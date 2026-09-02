/**
 * injectCharts.js — splices hand-built native chart parts (see chartXml.js)
 * into an .xlsx buffer that ExcelJS already produced. ExcelJS owns the
 * worksheet/table/style plumbing; this only adds the OOXML parts ExcelJS
 * doesn't know how to write: a chart part, a drawing part anchoring it to a
 * cell range, the relationship files wiring both to the target worksheet,
 * and the [Content_Types].xml overrides so Excel recognises the new parts.
 *
 * Relies on ExcelJS's own sheet-numbering: it writes worksheets to
 * `xl/worksheets/sheetN.xml` in the order `addWorksheet` was called
 * (1-based), which is stable as long as callers only ever add sheets.
 */
import JSZip from 'jszip';

const REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships';
const DRAWING_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing';
const CHART_REL_TYPE = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart';

function buildGraphicFrameXml({ id, name, rId, anchor }) {
  return (
    `<xdr:twoCellAnchor editAs="oneCell">` +
    `<xdr:from><xdr:col>${anchor.fromCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${anchor.fromRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>` +
    `<xdr:to><xdr:col>${anchor.toCol}</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>${anchor.toRow}</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>` +
    `<xdr:graphicFrame macro="">` +
    `<xdr:nvGraphicFramePr><xdr:cNvPr id="${id}" name="${name}"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr>` +
    `<xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm>` +
    `<a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/chart">` +
    `<c:chart xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:id="${rId}"/>` +
    `</a:graphicData></a:graphic></xdr:graphicFrame><xdr:clientData/></xdr:twoCellAnchor>`
  );
}

/**
 * @param {ArrayBuffer|Buffer} xlsxBuffer - output of workbook.xlsx.writeBuffer()
 * @param {Array<{ sheetIndex: number, charts: Array<{ chartXml: string, anchor: {fromCol,fromRow,toCol,toRow}, name?: string }> }>} placements
 * @returns {Promise<ArrayBuffer>}
 */
export async function injectNativeCharts(xlsxBuffer, placements) {
  const zip = await JSZip.loadAsync(xlsxBuffer);
  let chartPartCounter = 1;
  let contentTypesOverrides = '';

  for (const { sheetIndex, charts } of placements) {
    if (!charts || charts.length === 0) continue;

    const drawingPath = `xl/drawings/drawing${sheetIndex}.xml`;
    const drawingRelsPath = `xl/drawings/_rels/drawing${sheetIndex}.xml.rels`;
    const sheetPath = `xl/worksheets/sheet${sheetIndex}.xml`;
    const sheetRelsPath = `xl/worksheets/_rels/sheet${sheetIndex}.xml.rels`;

    let drawingRelEntries = '';
    let drawingFrames = '';

    charts.forEach((chart, i) => {
      const partIndex = chartPartCounter++;
      const chartPath = `xl/charts/chart${partIndex}.xml`;
      zip.file(chartPath, chart.chartXml);
      contentTypesOverrides += `<Override PartName="/${chartPath}" ContentType="application/vnd.openxmlformats-officedocument.drawingml.chart+xml"/>`;

      const rId = `rId${i + 1}`;
      drawingRelEntries += `<Relationship Id="${rId}" Type="${CHART_REL_TYPE}" Target="../charts/chart${partIndex}.xml"/>`;
      drawingFrames += buildGraphicFrameXml({
        id: i + 1,
        name: chart.name || `Chart ${partIndex}`,
        rId,
        anchor: chart.anchor,
      });
    });

    zip.file(
      drawingRelsPath,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${REL_NS}">${drawingRelEntries}</Relationships>`
    );
    zip.file(
      drawingPath,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>` +
        `<xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">${drawingFrames}</xdr:wsDr>`
    );
    contentTypesOverrides += `<Override PartName="/${drawingPath}" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/>`;

    // ExcelJS may already have written this sheet's .rels file — e.g. every
    // sheet here has a "Back to Dashboard" hyperlink relationship at rId1.
    // Overwriting it would silently repoint that rId at the new drawing
    // relationship instead, breaking the hyperlink. Merge in, don't clobber.
    const existingRelsFile = zip.file(sheetRelsPath);
    const existingRelsXml = existingRelsFile ? await existingRelsFile.async('string') : null;
    let existingRelEntries = '';
    let maxExistingRid = 0;
    if (existingRelsXml) {
      existingRelEntries = existingRelsXml.replace(/^[\s\S]*?<Relationships[^>]*>/, '').replace('</Relationships>', '');
      for (const m of existingRelsXml.matchAll(/Id="rId(\d+)"/g)) {
        maxExistingRid = Math.max(maxExistingRid, parseInt(m[1], 10));
      }
    }
    const drawingRid = `rId${maxExistingRid + 1}`;

    zip.file(
      sheetRelsPath,
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="${REL_NS}">${existingRelEntries}<Relationship Id="${drawingRid}" Type="${DRAWING_REL_TYPE}" Target="../drawings/drawing${sheetIndex}.xml"/></Relationships>`
    );

    const sheetXml = await zip.file(sheetPath).async('string');
    if (!sheetXml) {
      throw new Error(`injectNativeCharts: worksheet part not found for sheetIndex ${sheetIndex} (${sheetPath})`);
    }
    const patchedSheetXml = sheetXml.includes('<drawing ')
      ? sheetXml
      : sheetXml.replace('</worksheet>', `<drawing r:id="${drawingRid}"/></worksheet>`);
    zip.file(sheetPath, patchedSheetXml);
  }

  const contentTypesPath = '[Content_Types].xml';
  const contentTypesXml = await zip.file(contentTypesPath).async('string');
  zip.file(contentTypesPath, contentTypesXml.replace('</Types>', `${contentTypesOverrides}</Types>`));

  return zip.generateAsync({ type: 'arraybuffer' });
}
