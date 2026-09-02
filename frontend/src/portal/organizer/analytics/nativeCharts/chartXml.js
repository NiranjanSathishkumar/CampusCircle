/**
 * chartXml.js — hand-written OOXML (DrawingML/ChartML) builders.
 *
 * ExcelJS can write worksheets but has no support for *native* Excel chart
 * objects (github.com/exceljs/exceljs — charts are perpetually out of
 * scope), only static images. A "proper" report needs real, editable,
 * in-Excel charts, so this module builds the `xl/charts/chartN.xml` parts
 * by hand and `injectCharts.js` splices them into the .xlsx zip that
 * ExcelJS already produced. Every chart both *references* a live worksheet
 * range (so it's a real linked chart, editable in Excel) and carries a
 * cache of the same values (so it renders correctly the instant the file
 * is opened, before Excel recalculates anything).
 */

export function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&apos;';
    }
  });
}

/** Wraps a sheet name for use in a formula ref, escaping embedded quotes per Excel convention. */
function quoteSheetName(sheetName) {
  return `'${sheetName.replace(/'/g, "''")}'`;
}

/** Builds an `A5:A14`-style range string from a 0-based column + row span. */
export function colLetter(col0) {
  let n = col0 + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function rangeRef(sheetName, col0, rowStart1, rowEnd1) {
  const col = colLetter(col0);
  return `${quoteSheetName(sheetName)}!$${col}$${rowStart1}${rowEnd1 && rowEnd1 !== rowStart1 ? `:$${col}$${rowEnd1}` : ''}`;
}

export function cellRef(sheetName, col0, row1) {
  return `${quoteSheetName(sheetName)}!$${colLetter(col0)}$${row1}`;
}

function numCache(values, formatCode = 'General') {
  const pts = values
    .map((v, i) => `<c:pt idx="${i}"><c:v>${Number(v) || 0}</c:v></c:pt>`)
    .join('');
  return `<c:numCache><c:formatCode>${formatCode}</c:formatCode><c:ptCount val="${values.length}"/>${pts}</c:numCache>`;
}

function strCache(values) {
  const pts = values.map((v, i) => `<c:pt idx="${i}"><c:v>${escapeXml(v)}</c:v></c:pt>`).join('');
  return `<c:strCache><c:ptCount val="${values.length}"/>${pts}</c:strCache>`;
}

function numRef(formula, values, formatCode) {
  return `<c:numRef><c:f>${escapeXml(formula)}</c:f>${numCache(values, formatCode)}</c:numRef>`;
}

function strRef(formula, values) {
  return `<c:strRef><c:f>${escapeXml(formula)}</c:f>${strCache(values)}</c:strRef>`;
}

function solidFill(hex) {
  return `<a:solidFill><a:srgbClr val="${hex.replace('#', '')}"/></a:solidFill>`;
}

// Segoe UI ships with Windows/Office (where this workbook's audience opens
// it) and reads less "default spreadsheet" than Calibri; set explicitly
// everywhere since nested txPr/defRPr blocks don't reliably inherit a
// parent's typeface in every Excel renderer.
const FONT = 'Segoe UI';

function titleXml(title, color = '0F172A') {
  if (!title) return '<c:autoTitleDeleted val="1"/>';
  return `<c:title><c:tx><c:rich><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1300" b="1"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:r><a:rPr lang="en-US" sz="1300" b="1"><a:solidFill><a:srgbClr val="${color}"/></a:solidFill><a:latin typeface="${FONT}"/></a:rPr><a:t>${escapeXml(
    title
  )}</a:t></a:r></a:p></c:rich></c:tx><c:overlay val="0"/></c:title><c:autoTitleDeleted val="0"/>`;
}

function legendXml(pos = 'b') {
  return `<c:legend><c:legendPos val="${pos}"/><c:overlay val="0"/><c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1000"><a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr></c:legend>`;
}

function textProps(sz = 1000, bold = false) {
  return `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="${sz}"${
    bold ? ' b="1"' : ''
  }><a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>`;
}

const CHART_SPACE_OPEN =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
  '<c:chartSpace xmlns:c="http://schemas.openxmlformats.org/drawingml/2006/chart" ' +
  'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" ' +
  'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
  '<c:roundedCorners val="1"/>';
// A soft, defined card edge instead of a chart that floats borderless on
// the sheet — a thin warm-grey line matching the report's table borders.
const CHART_SPACE_CLOSE =
  '<c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="D8D3C4"/></a:solidFill></a:ln></c:spPr>' +
  `<c:txPr><a:bodyPr/><a:lstStyle/><a:p><a:pPr><a:defRPr sz="1000"><a:latin typeface="${FONT}"/></a:defRPr></a:pPr><a:endParaRPr lang="en-US"/></a:p></c:txPr>` +
  '</c:chartSpace>';

let axIdCounter = 100000;
function nextAxId() {
  axIdCounter += 1;
  return axIdCounter;
}

/**
 * Line chart — one or more series sharing the same category axis.
 * series: [{ name, color, sheetName, valueCol0, rowStart1, rowEnd1, values }]
 */
export function buildLineChartXml({ title, titleColor, sheetName, categoryCol0, rowStart1, rowEnd1, categories, series }) {
  const catAxId = nextAxId();
  const valAxId = nextAxId();
  const catFormula = rangeRef(sheetName, categoryCol0, rowStart1, rowEnd1);

  const serXml = series
    .map((s, i) => {
      const valFormula = rangeRef(sheetName, s.valueCol0, rowStart1, rowEnd1);
      const nameFormula = cellRef(sheetName, s.valueCol0, rowStart1 - 1);
      return (
        `<c:ser><c:idx val="${i}"/><c:order val="${i}"/>` +
        `<c:tx>${strRef(nameFormula, [s.name])}</c:tx>` +
        `<c:spPr><a:ln w="31750" cap="rnd">${solidFill(s.color)}</a:ln></c:spPr>` +
        `<c:marker><c:symbol val="circle"/><c:size val="6"/><c:spPr>${solidFill(s.color)}<a:ln w="14288">${solidFill(
          '#FFFFFF'
        )}</a:ln></c:spPr></c:marker>` +
        `<c:cat>${strRef(catFormula, categories)}</c:cat>` +
        `<c:val>${numRef(valFormula, s.values, '#,##0')}</c:val>` +
        `<c:smooth val="0"/></c:ser>`
      );
    })
    .join('');

  return (
    `${CHART_SPACE_OPEN}<c:chart>${titleXml(title, titleColor)}<c:plotArea><c:layout/>` +
    `<c:lineChart><c:grouping val="standard"/><c:varyColors val="0"/>${serXml}` +
    `<c:marker val="1"/><c:axId val="${catAxId}"/><c:axId val="${valAxId}"/></c:lineChart>` +
    `<c:catAx><c:axId val="${catAxId}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/>` +
    `<c:spPr><a:ln><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln></c:spPr>${textProps(900)}<c:crossAx val="${valAxId}"/></c:catAx>` +
    `<c:valAx><c:axId val="${valAxId}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="l"/>` +
    `<c:majorGridlines><c:spPr><a:ln><a:solidFill><a:srgbClr val="E5E0D5"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>` +
    `<c:numFmt formatCode="#,##0" sourceLinked="0"/>${textProps(900)}<c:crossAx val="${catAxId}"/></c:valAx>` +
    `</c:plotArea>${series.length > 1 ? legendXml('b') : ''}<c:plotVisOnly val="1"/></c:chart>${CHART_SPACE_CLOSE}`
  );
}

/**
 * Bar chart — single series, optionally coloured per-point (funnel ramp,
 * ranked leaderboards). `horizontal: true` gives the bar-not-column
 * orientation used for funnels / leaderboards throughout this report.
 */
export function buildBarChartXml({
  title,
  titleColor,
  sheetName,
  categoryCol0,
  valueCol0,
  rowStart1,
  rowEnd1,
  categories,
  values,
  seriesName,
  color = '#991B1B',
  pointColors,
  horizontal = true,
}) {
  const catAxId = nextAxId();
  const valAxId = nextAxId();
  const catFormula = rangeRef(sheetName, categoryCol0, rowStart1, rowEnd1);
  const valFormula = rangeRef(sheetName, valueCol0, rowStart1, rowEnd1);
  const nameFormula = cellRef(sheetName, valueCol0, rowStart1 - 1);

  const dPts = pointColors
    ? pointColors
        .map((c, i) => `<c:dPt><c:idx val="${i}"/><c:invertIfNegative val="0"/><c:bubble3D val="0"/><c:spPr>${solidFill(c)}</c:spPr></c:dPt>`)
        .join('')
    : '';

  const dataLabels = `<c:dLbls><c:numFmt formatCode="#,##0" sourceLinked="0"/><c:spPr><a:noFill/><a:ln><a:noFill/></a:ln></c:spPr>${textProps(
    900,
    true
  )}<c:showLegendKey val="0"/><c:showVal val="1"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="0"/><c:showBubbleSize val="0"/></c:dLbls>`;

  const serXml =
    `<c:ser><c:idx val="0"/><c:order val="0"/><c:tx>${strRef(nameFormula, [seriesName])}</c:tx>` +
    `<c:spPr>${solidFill(color)}<a:ln><a:noFill/></a:ln></c:spPr>${dPts}${dataLabels}` +
    `<c:cat>${strRef(catFormula, categories)}</c:cat>` +
    `<c:val>${numRef(valFormula, values, '#,##0')}</c:val></c:ser>`;

  return (
    `${CHART_SPACE_OPEN}<c:chart>${titleXml(title, titleColor)}<c:plotArea><c:layout/>` +
    `<c:barChart><c:barDir val="${horizontal ? 'bar' : 'col'}"/><c:grouping val="clustered"/><c:varyColors val="${
      pointColors ? 1 : 0
    }"/>${serXml}<c:gapWidth val="40"/><c:axId val="${catAxId}"/><c:axId val="${valAxId}"/></c:barChart>` +
    `<c:catAx><c:axId val="${catAxId}"/><c:scaling><c:orientation val="${
      horizontal ? 'maxMin' : 'minMax'
    }"/></c:scaling><c:delete val="0"/><c:axPos val="${horizontal ? 'l' : 'b'}"/>` +
    // c:tickLblPos must precede spPr/txPr/crossAx per CT_CatAx's declared
    // sequence — placing it after crossAx (as an earlier version of this
    // function did) produces a chart part Excel refuses to open at all.
    `${horizontal ? '<c:tickLblPos val="low"/>' : ''}<c:spPr><a:ln><a:solidFill><a:srgbClr val="CBD5E1"/></a:solidFill></a:ln></c:spPr>${textProps(
      900
    )}<c:crossAx val="${valAxId}"/></c:catAx>` +
    `<c:valAx><c:axId val="${valAxId}"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="${
      horizontal ? 'b' : 'l'
    }"/>` +
    `<c:majorGridlines><c:spPr><a:ln><a:solidFill><a:srgbClr val="E5E0D5"/></a:solidFill></a:ln></c:spPr></c:majorGridlines>` +
    `<c:numFmt formatCode="#,##0" sourceLinked="0"/>${textProps(900)}<c:crossAx val="${catAxId}"/></c:valAx>` +
    `</c:plotArea><c:plotVisOnly val="1"/></c:chart>${CHART_SPACE_CLOSE}`
  );
}

/**
 * Pie/donut chart with an explicit colour per slice (matches the app's
 * fixed categorical palette so a slice's colour means the same thing here
 * as it does on-screen).
 */
export function buildPieChartXml({
  title,
  titleColor,
  sheetName,
  categoryCol0,
  valueCol0,
  rowStart1,
  rowEnd1,
  categories,
  values,
  seriesName,
  colors,
  donut = true,
}) {
  const catFormula = rangeRef(sheetName, categoryCol0, rowStart1, rowEnd1);
  const valFormula = rangeRef(sheetName, valueCol0, rowStart1, rowEnd1);
  const nameFormula = cellRef(sheetName, valueCol0, rowStart1 - 1);

  const dPts = categories
    .map(
      (_, i) =>
        `<c:dPt><c:idx val="${i}"/><c:bubble3D val="0"/><c:spPr>${solidFill(colors[i % colors.length])}<a:ln w="19050"><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill></a:ln></c:spPr></c:dPt>`
    )
    .join('');

  const dataLabels = `<c:dLbls><c:numFmt formatCode="0%" sourceLinked="0"/>${textProps(
    900,
    true
  )}<c:showLegendKey val="0"/><c:showVal val="0"/><c:showCatName val="0"/><c:showSerName val="0"/><c:showPercent val="1"/><c:showBubbleSize val="0"/><c:showLeaderLines val="0"/></c:dLbls>`;

  const serXml =
    `<c:ser><c:idx val="0"/><c:order val="0"/><c:tx>${strRef(nameFormula, [seriesName])}</c:tx>${dPts}${dataLabels}` +
    `<c:cat>${strRef(catFormula, categories)}</c:cat>` +
    `<c:val>${numRef(valFormula, values, '#,##0')}</c:val></c:ser>`;

  const chartTag = donut ? 'doughnutChart' : 'pieChart';
  const holeSize = donut ? '<c:holeSize val="62"/>' : '';

  return (
    `${CHART_SPACE_OPEN}<c:chart>${titleXml(title, titleColor)}<c:plotArea><c:layout/>` +
    `<c:${chartTag}><c:varyColors val="1"/>${serXml}${
      donut ? '<c:firstSliceAng val="0"/>' : ''
    }${holeSize}</c:${chartTag}></c:plotArea>${legendXml('r')}<c:plotVisOnly val="1"/></c:chart>${CHART_SPACE_CLOSE}`
  );
}
