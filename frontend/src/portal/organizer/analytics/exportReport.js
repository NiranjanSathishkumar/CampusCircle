/**
 * exportReport.js — builds the "Export Report" .xlsx workbook for the
 * organiser Analytics page.
 *
 * Two libraries, two jobs: ExcelJS lays out the worksheets — banners, KPI
 * tiles, banded data tables, number formats, freeze panes, tab colours —
 * and hands back a finished .xlsx buffer. That buffer is then reopened as
 * a zip and spliced with hand-built native chart parts (see
 * nativeCharts/chartXml.js) via nativeCharts/injectCharts.js, because
 * ExcelJS itself can only embed static images, never a real Excel chart
 * object. The result is a workbook where every chart is the same kind of
 * editable, linked chart you'd get from selecting the data and hitting
 * Insert > Chart yourself.
 *
 * Both are lazy-imported so neither (ExcelJS alone is ~1MB minified) lands
 * in the main app bundle — only pulled in when someone clicks Export.
 */
import { formatCount } from '@/shared/utils/formatters';
import { buildLineChartXml, buildBarChartXml, buildPieChartXml } from './nativeCharts/chartXml';

// Brand palette — kept in step with the on-screen charts' fixed palettes
// (OrganizerCompositionBar's CATEGORICAL, OrganizerFunnelChart's ORDINAL_RAMP)
// so a colour means the same thing in the workbook as it does on the page.
const NAVY = '0F172A';
const CRIMSON = '991B1B';
const TEAL = '0D9488';
const AMBER = 'B45309';
const VIOLET = '7C3AED';
const BLUE = '2563EB';
const MUTED = '6B7280';
const BORDER = 'D8D3C4';
const BAND = 'F6F3EA';
const CATEGORICAL = [CRIMSON, BLUE, TEAL, AMBER, VIOLET];
const ORDINAL_RAMP = ['DCA3A3', 'C57373', 'A83A3A', '7F1D1D'];

// Pale tints of each accent, for KPI card backgrounds — same hue family as
// the card's top bar/border so the card reads as one designed unit instead
// of a plain white box with a coloured stripe.
const PASTEL = {
  [CRIMSON]: 'FBEAEA',
  [TEAL]: 'E6F5F3',
  [AMBER]: 'FDF0E1',
  [VIOLET]: 'F1EAFD',
  [NAVY]: 'E9EBF0',
};

// Ships with Windows/Office — where this workbook's audience opens it —
// and reads less "default spreadsheet" than Calibri.
const FONT_NAME = 'Segoe UI';

const DATA_COL0 = 0; // data tables start at column A
const CHART_COL0 = 5; // charts float beside the table, starting at column F
const CHART_COL_SPAN = 8;
const CHART_ROW_SPAN = 17;

function argb(hex) {
  return `FF${hex.replace('#', '').toUpperCase()}`;
}

/** Every helper below works in 0-based "next free row" terms; ExcelJS cells are 1-based. */
const R = (row0) => row0 + 1;

function addNavLink(sheet, row0, targetSheetName) {
  const cell = sheet.getCell(R(row0), 1);
  cell.value = { text: '‹  Back to Dashboard', hyperlink: `#'${targetSheetName.replace(/'/g, "''")}'!A1` };
  cell.font = { name: FONT_NAME, italic: true, size: 9, color: { argb: argb(CRIMSON) }, underline: true };
  return row0 + 1;
}

function addBanner(sheet, row0, { title, subtitle, accent, span = 12 }) {
  const titleRow = R(row0);
  sheet.mergeCells(titleRow, 1, titleRow, span);
  for (let c = 1; c <= span; c += 1) {
    const cell = sheet.getCell(titleRow, c);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(accent) } };
    if (c === 1) {
      cell.value = title;
      cell.font = { name: FONT_NAME, bold: true, size: 15, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };
    }
  }
  sheet.getRow(titleRow).height = 30;

  // A thin accent-toned rule under the subtitle separates the banner block
  // from the content below instead of just leaving blank space.
  const subRow = R(row0 + 1);
  sheet.mergeCells(subRow, 1, subRow, span);
  for (let c = 1; c <= span; c += 1) {
    sheet.getCell(subRow, c).border = { bottom: { style: 'thin', color: { argb: argb(accent) } } };
  }
  const subCell = sheet.getCell(subRow, 1);
  subCell.value = subtitle;
  subCell.font = { name: FONT_NAME, italic: true, size: 9, color: { argb: argb(MUTED) } };
  subCell.alignment = { indent: 1 };
  sheet.getRow(subRow).height = 18;

  return row0 + 3; // banner (2 rows) + 1 blank spacer
}

/**
 * Styled, banded, filterable data table. `columns`: [{ header, width, numFmt }].
 * `rows`: array of value arrays, same order as `columns`. Returns the next
 * free 0-based row, and the 1-based header row (charts need it for refs).
 */
function writeTable(sheet, row0, { columns, rows, accent }) {
  const headerRow1 = R(row0);
  sheet.getRow(headerRow1).height = 20;

  columns.forEach((col, i) => {
    sheet.getColumn(DATA_COL0 + i + 1).width = col.width || 20;
    const cell = sheet.getCell(headerRow1, DATA_COL0 + i + 1);
    cell.value = col.header;
    cell.font = { name: FONT_NAME, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(accent) } };
    // Right-align numeric headers flush with their right-aligned numeric
    // data below (no indent — an indent here would fight the alignment
    // and no longer line up with the flush-right values underneath it).
    cell.alignment = { vertical: 'middle', horizontal: col.numFmt ? 'right' : 'left' };
    cell.border = {
      left: i === 0 ? { style: 'medium', color: { argb: argb(accent) } } : undefined,
      right: i === columns.length - 1 ? { style: 'medium', color: { argb: argb(accent) } } : undefined,
    };
  });

  rows.forEach((rowValues, r) => {
    const rowNum = headerRow1 + 1 + r;
    const isLastRow = r === rows.length - 1;
    rowValues.forEach((value, c) => {
      const cell = sheet.getCell(rowNum, DATA_COL0 + c + 1);
      cell.value = value;
      cell.font = { name: FONT_NAME };
      if (columns[c]?.numFmt) cell.numFmt = columns[c].numFmt;
      cell.border = {
        top: { style: 'thin', color: { argb: argb(BORDER) } },
        bottom: { style: isLastRow ? 'medium' : 'thin', color: { argb: argb(isLastRow ? accent : BORDER) } },
        left: c === 0 ? { style: 'medium', color: { argb: argb(accent) } } : undefined,
        right: c === columns.length - 1 ? { style: 'medium', color: { argb: argb(accent) } } : undefined,
      };
      if (r % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(BAND) } };
      }
    });
  });

  if (rows.length > 0) {
    sheet.autoFilter = {
      from: { row: headerRow1, column: DATA_COL0 + 1 },
      to: { row: headerRow1 + rows.length, column: DATA_COL0 + columns.length },
    };
  }
  sheet.views = [{ state: 'frozen', ySplit: headerRow1 }];

  return { nextRow0: headerRow1 + rows.length + 1, headerRow1 };
}

function writeKpiCards(sheet, row0, cards) {
  const cardWidth = 3;
  const gap = 1;
  let col0 = 0;

  cards.forEach((card) => {
    const c1 = col0 + 1;
    const c2 = col0 + cardWidth;
    const barRow = R(row0);
    const labelRow = R(row0 + 1);
    const valueRow = R(row0 + 2);
    const deltaRow = R(row0 + 4);
    const tint = argb(PASTEL[card.accent] || 'F3F1EA');

    // Pale tint fill across the whole card body (everything below the top
    // bar) so it reads as one designed tile, not a white box with a stripe.
    for (let r = labelRow; r <= deltaRow; r += 1) {
      for (let c = c1; c <= c2; c += 1) {
        sheet.getCell(r, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: tint } };
      }
    }

    sheet.mergeCells(barRow, c1, barRow, c2);
    sheet.getRow(barRow).height = 6;
    for (let c = c1; c <= c2; c += 1) {
      sheet.getCell(barRow, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(card.accent) } };
    }

    sheet.mergeCells(labelRow, c1, labelRow, c2);
    const labelCell = sheet.getCell(labelRow, c1);
    labelCell.value = card.label.toUpperCase();
    labelCell.font = { name: FONT_NAME, bold: true, size: 9, color: { argb: argb(card.accent) } };
    labelCell.alignment = { indent: 1 };

    sheet.mergeCells(valueRow, c1, valueRow + 1, c2);
    const valueCell = sheet.getCell(valueRow, c1);
    valueCell.value = card.value;
    valueCell.font = { name: FONT_NAME, bold: true, size: 24, color: { argb: argb(NAVY) } };
    valueCell.alignment = { indent: 1, vertical: 'middle' };

    sheet.mergeCells(deltaRow, c1, deltaRow, c2);
    const deltaCell = sheet.getCell(deltaRow, c1);
    deltaCell.value = card.deltaText || '';
    deltaCell.font = {
      name: FONT_NAME,
      size: 10,
      bold: true,
      color: { argb: argb(card.deltaColor || MUTED) },
    };
    deltaCell.alignment = { indent: 1 };

    for (let r = barRow; r <= deltaRow; r += 1) {
      for (let c = c1; c <= c2; c += 1) {
        const cell = sheet.getCell(r, c);
        cell.border = {
          top: r === barRow ? { style: 'thin', color: { argb: argb(card.accent) } } : cell.border?.top,
          bottom: r === deltaRow ? { style: 'thin', color: { argb: argb(card.accent) } } : cell.border?.bottom,
          left: c === c1 ? { style: 'thin', color: { argb: argb(card.accent) } } : cell.border?.left,
          right: c === c2 ? { style: 'thin', color: { argb: argb(card.accent) } } : cell.border?.right,
        };
      }
    }

    col0 += cardWidth + gap;
  });

  return row0 + 6;
}

function chartAnchor(row0) {
  return { fromCol: CHART_COL0, fromRow: row0, toCol: CHART_COL0 + CHART_COL_SPAN, toRow: row0 + CHART_ROW_SPAN };
}

export async function exportAnalyticsReportXlsx({
  communityName,
  rangeLabel,
  followersValue,
  followersDelta,
  eventRegistrants,
  repeatAttendees,
  followerGrowth,
  engagementFunnel,
  branchComposition,
  yearComposition,
  topEvents,
  byEvent, // optional: { event, analytics, rangeLabel }
}) {
  const [{ default: ExcelJS }, { injectNativeCharts }] = await Promise.all([
    import('exceljs'),
    import('./nativeCharts/injectCharts'),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CampusCircle';
  workbook.created = new Date();

  const generatedMeta = `Generated ${new Date().toLocaleString()} · Timeframe: ${rangeLabel}`;
  const chartPlacements = [];
  let sheetCounter = 0;

  function addSheet(name, tabColor) {
    sheetCounter += 1;
    const ws = workbook.addWorksheet(name.slice(0, 31), {
      properties: { tabColor: { argb: argb(tabColor) } },
      views: [{ showGridLines: false }],
    });
    return { ws, index: sheetCounter };
  }

  function registerChart(sheetIndex, row0, chartXml, name) {
    // Sheets can carry more than one chart (the single-event sheet stacks
    // three), so charts for the same sheet must land in one placement's
    // `charts` array — pushing a separate placement per call would make
    // each one overwrite the previous chart's drawing part instead of
    // adding to it.
    let placement = chartPlacements.find((p) => p.sheetIndex === sheetIndex);
    if (!placement) {
      placement = { sheetIndex, charts: [] };
      chartPlacements.push(placement);
    }
    placement.charts.push({ chartXml, anchor: chartAnchor(row0), name });
  }

  // ── Dashboard sheet — cover page: KPIs + a linked table of contents ──
  const { ws: dash } = addSheet('Dashboard', NAVY);
  dash.getColumn(1).width = 30; // holds full nav-link labels like "›  Engagement Funnel"
  let dr = addBanner(dash, 0, {
    title: `Community Analytics Report — ${communityName}`,
    subtitle: generatedMeta,
    accent: NAVY,
    span: 12,
  });

  const deltaColor = followersDelta > 0 ? '15803D' : followersDelta < 0 ? CRIMSON : MUTED;
  dr = writeKpiCards(dash, dr, [
    {
      label: 'Total Followers',
      value: formatCount(followersValue),
      deltaText: followersDelta != null ? `${followersDelta > 0 ? '▲' : followersDelta < 0 ? '▼' : ''} ${Math.abs(followersDelta)}%` : '—',
      deltaColor,
      accent: CRIMSON,
    },
    { label: 'Event Registrants', value: formatCount(eventRegistrants ?? 0), deltaText: 'All-time', deltaColor: MUTED, accent: TEAL },
    { label: 'Repeat Attendees', value: formatCount(repeatAttendees ?? 0), deltaText: 'All-time', deltaColor: MUTED, accent: AMBER },
  ]);
  dr += 1;

  const sectionRow1 = R(dr);
  dash.getCell(sectionRow1, 1).value = 'Report Sections';
  dash.getCell(sectionRow1, 1).font = { name: FONT_NAME, bold: true, size: 12, color: { argb: argb(NAVY) } };
  dr += 1;

  // Each row's accent matches that sheet's own tab colour, so the nav list
  // reads as a legend for the colour language used throughout the workbook.
  const sections = [
    ['Follower Growth', 'Community follower count over the selected timeframe', CRIMSON],
    ['Engagement Funnel', 'Followers → registrants → repeat attendees conversion', NAVY],
    ['Branch Composition', 'Follower base by academic department', TEAL],
    ['Year Composition', 'Follower base by academic year', AMBER],
    ['Top Events', 'Events ranked by registrations', CRIMSON],
  ];
  if (byEvent?.event) {
    sections.push([`Event – ${byEvent.event.title}`.slice(0, 31), `Single-event detail for ${byEvent.event.title}`, VIOLET]);
  }

  sections.forEach(([name, desc, accent], i) => {
    const rowNum = R(dr);
    dash.getRow(rowNum).height = 20;
    if (i % 2 === 1) {
      for (let c = 1; c <= 10; c += 1) {
        dash.getCell(rowNum, c).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: argb(BAND) } };
      }
    }
    const linkCell = dash.getCell(rowNum, 1);
    linkCell.value = { text: `›  ${name}`, hyperlink: `#'${name.replace(/'/g, "''")}'!A1` };
    linkCell.font = { name: FONT_NAME, bold: true, color: { argb: argb(accent) }, underline: true };
    linkCell.alignment = { indent: 1, vertical: 'middle' };
    dash.mergeCells(rowNum, 3, rowNum, 10);
    const descCell = dash.getCell(rowNum, 3);
    descCell.value = desc;
    descCell.font = { name: FONT_NAME, size: 10, italic: true, color: { argb: argb(MUTED) } };
    descCell.alignment = { vertical: 'middle' };
    dash.getCell(rowNum, 1).border = { bottom: { style: 'thin', color: { argb: argb(BORDER) } } };
    dr += 1;
  });

  // ── Follower Growth ──────────────────────────────────────────────
  if (followerGrowth?.length) {
    const { ws, index } = addSheet('Follower Growth', CRIMSON);
    let r = addNavLink(ws, 0, 'Dashboard');
    r = addBanner(ws, r, { title: 'Follower Growth', subtitle: rangeLabel, accent: CRIMSON });
    const { headerRow1 } = writeTable(ws, r, {
      accent: CRIMSON,
      columns: [
        { header: 'Period', width: 16 },
        { header: 'Followers', width: 14, numFmt: '#,##0' },
      ],
      rows: followerGrowth.map((d) => [d.label, d.value]),
    });
    registerChart(
      index,
      r,
      buildLineChartXml({
        title: 'Follower Growth',
        titleColor: CRIMSON,
        sheetName: ws.name,
        categoryCol0: DATA_COL0,
        rowStart1: headerRow1 + 1,
        rowEnd1: headerRow1 + followerGrowth.length,
        categories: followerGrowth.map((d) => d.label),
        series: [{ name: 'Followers', color: CRIMSON, valueCol0: DATA_COL0 + 1, values: followerGrowth.map((d) => d.value) }],
      }),
      'Follower Growth'
    );
  }

  // ── Engagement Funnel ────────────────────────────────────────────
  if (engagementFunnel?.length) {
    const { ws, index } = addSheet('Engagement Funnel', ORDINAL_RAMP[3]);
    let r = addNavLink(ws, 0, 'Dashboard');
    r = addBanner(ws, r, { title: 'Student Engagement Funnel', subtitle: `${rangeLabel} · All-time conversion`, accent: NAVY });

    const first = engagementFunnel[0]?.value || 1;
    const rows = engagementFunnel.map((d, i) => {
      const prev = i > 0 ? engagementFunnel[i - 1].value : d.value;
      const dropPct = i > 0 && prev > 0 ? (prev - d.value) / prev : null;
      return [d.label, d.value, (d.value || 0) / first, dropPct];
    });
    const { headerRow1 } = writeTable(ws, r, {
      accent: NAVY,
      columns: [
        { header: 'Stage', width: 22 },
        { header: 'Count', width: 12, numFmt: '#,##0' },
        { header: 'Share of first stage', width: 22, numFmt: '0%' },
        { header: 'Drop-off', width: 14, numFmt: '0%;-0%;0%' },
      ],
      rows,
    });
    registerChart(
      index,
      r,
      buildBarChartXml({
        title: 'Student Engagement Funnel',
        titleColor: NAVY,
        sheetName: ws.name,
        categoryCol0: DATA_COL0,
        valueCol0: DATA_COL0 + 1,
        rowStart1: headerRow1 + 1,
        rowEnd1: headerRow1 + engagementFunnel.length,
        categories: engagementFunnel.map((d) => d.label),
        values: engagementFunnel.map((d) => d.value),
        seriesName: 'Count',
        pointColors: engagementFunnel.map((_, i) => ORDINAL_RAMP[Math.min(i, ORDINAL_RAMP.length - 1)]),
        horizontal: true,
      }),
      'Engagement Funnel'
    );
  }

  // ── Composition sheets (branch + year) ──────────────────────────
  const compositionSheets = [
    { title: 'Branch Composition', label: 'Department', data: branchComposition, accent: TEAL },
    { title: 'Year Composition', label: 'Year', data: yearComposition, accent: AMBER },
  ];
  compositionSheets.forEach(({ title, label, data, accent }) => {
    if (!data?.length) return;
    const { ws, index } = addSheet(title, accent);
    let r = addNavLink(ws, 0, 'Dashboard');
    r = addBanner(ws, r, { title, subtitle: rangeLabel, accent });

    const total = data.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
    const { headerRow1 } = writeTable(ws, r, {
      accent,
      columns: [
        { header: label, width: 38 },
        { header: 'Followers', width: 12, numFmt: '#,##0' },
        { header: 'Share', width: 12, numFmt: '0%' },
      ],
      rows: data.map((d) => [d.label, d.value, (d.value || 0) / total]),
    });
    registerChart(
      index,
      r,
      buildPieChartXml({
        title,
        titleColor: accent,
        sheetName: ws.name,
        categoryCol0: DATA_COL0,
        valueCol0: DATA_COL0 + 1,
        rowStart1: headerRow1 + 1,
        rowEnd1: headerRow1 + data.length,
        categories: data.map((d) => d.label),
        values: data.map((d) => d.value),
        seriesName: 'Followers',
        colors: CATEGORICAL,
      }),
      title
    );
  });

  // ── Top Events ───────────────────────────────────────────────────
  if (topEvents?.length) {
    const { ws, index } = addSheet('Top Events', CRIMSON);
    let r = addNavLink(ws, 0, 'Dashboard');
    r = addBanner(ws, r, { title: 'Top Performing Events', subtitle: `${rangeLabel} · Ranked by registrations`, accent: CRIMSON });
    const { headerRow1 } = writeTable(ws, r, {
      accent: CRIMSON,
      columns: [
        { header: 'Rank', width: 8 },
        { header: 'Event', width: 42 },
        { header: 'Registrations', width: 16, numFmt: '#,##0' },
      ],
      rows: topEvents.map((e, i) => [i + 1, e.title, e.registrations]),
    });
    registerChart(
      index,
      r,
      buildBarChartXml({
        title: 'Top Performing Events',
        titleColor: CRIMSON,
        sheetName: ws.name,
        categoryCol0: DATA_COL0 + 1,
        valueCol0: DATA_COL0 + 2,
        rowStart1: headerRow1 + 1,
        rowEnd1: headerRow1 + topEvents.length,
        categories: topEvents.map((e) => e.title),
        values: topEvents.map((e) => e.registrations),
        seriesName: 'Registrations',
        color: CRIMSON,
        horizontal: true,
      }),
      'Top Events'
    );
  }

  // ── Optional: currently-viewed single-event sheet ───────────────
  if (byEvent?.event && byEvent?.analytics) {
    const { event, analytics, rangeLabel: eventRangeLabel } = byEvent;
    const { ws, index } = addSheet(`Event – ${event.title}`, VIOLET);
    let r = addNavLink(ws, 0, 'Dashboard');
    r = addBanner(ws, r, { title: `Event Analytics — ${event.title}`, subtitle: generatedMeta, accent: VIOLET });

    const fillPct = event.capacity ? (event.registeredCount || 0) / event.capacity : 0;
    const revenue = event.payment === 'Free' ? 'Free Entry' : `₹${((event.priceAmount || 0) * (event.registeredCount || 0)).toLocaleString()}`;
    r = writeKpiCards(ws, r, [
      { label: 'Total RSVPs', value: formatCount(event.registeredCount ?? 0), deltaText: '', accent: CRIMSON },
      { label: 'Capacity Fill Rate', value: `${Math.round(fillPct * 100)}%`, deltaText: `${event.registeredCount}/${event.capacity} seats`, deltaColor: MUTED, accent: TEAL },
      { label: 'Waitlisted', value: formatCount(event.waitlistCount ?? 0), deltaText: '', accent: AMBER },
    ]);
    r += 1;
    ws.getCell(R(r), 1).value = `Ticket Revenue: ${revenue}`;
    ws.getCell(R(r), 1).font = { name: FONT_NAME, bold: true, color: { argb: argb(NAVY) } };
    r += 2;

    if (analytics.registrationTimeline?.length) {
      const sub = R(r);
      ws.getCell(sub, 1).value = 'Registration Timeline';
      ws.getCell(sub, 1).font = { name: FONT_NAME, bold: true, size: 12, color: { argb: argb(CRIMSON) } };
      r += 1;
      const { headerRow1 } = writeTable(ws, r, {
        accent: CRIMSON,
        columns: [
          { header: 'Period', width: 16 },
          { header: 'Registrations', width: 16, numFmt: '#,##0' },
        ],
        rows: analytics.registrationTimeline.map((d) => [d.label, d.value]),
      });
      registerChart(
        index,
        r,
        buildLineChartXml({
          title: 'Registration Timeline',
          titleColor: CRIMSON,
          sheetName: ws.name,
          categoryCol0: DATA_COL0,
          rowStart1: headerRow1 + 1,
          rowEnd1: headerRow1 + analytics.registrationTimeline.length,
          categories: analytics.registrationTimeline.map((d) => d.label),
          series: [{ name: 'Registrations', color: CRIMSON, valueCol0: DATA_COL0 + 1, values: analytics.registrationTimeline.map((d) => d.value) }],
        }),
        'Registration Timeline'
      );
      r = Math.max(r + analytics.registrationTimeline.length + 3, r + CHART_ROW_SPAN + 2);
    }

    if (analytics.branchBreakdown?.length) {
      const sub = R(r);
      ws.getCell(sub, 1).value = 'Department Breakdown';
      ws.getCell(sub, 1).font = { name: FONT_NAME, bold: true, size: 12, color: { argb: argb(TEAL) } };
      r += 1;
      const total = analytics.branchBreakdown.reduce((sum, d) => sum + (d.value || 0), 0) || 1;
      const { headerRow1 } = writeTable(ws, r, {
        accent: TEAL,
        columns: [
          { header: 'Department', width: 38 },
          { header: 'Count', width: 12, numFmt: '#,##0' },
          { header: 'Share', width: 12, numFmt: '0%' },
        ],
        rows: analytics.branchBreakdown.map((d) => [d.label, d.value, (d.value || 0) / total]),
      });
      registerChart(
        index,
        r,
        buildPieChartXml({
          title: 'Department Breakdown',
          titleColor: TEAL,
          sheetName: ws.name,
          categoryCol0: DATA_COL0,
          valueCol0: DATA_COL0 + 1,
          rowStart1: headerRow1 + 1,
          rowEnd1: headerRow1 + analytics.branchBreakdown.length,
          categories: analytics.branchBreakdown.map((d) => d.label),
          values: analytics.branchBreakdown.map((d) => d.value),
          seriesName: 'Count',
          colors: CATEGORICAL,
        }),
        'Department Breakdown'
      );
      r = Math.max(r + analytics.branchBreakdown.length + 3, r + CHART_ROW_SPAN + 2);
    }

    if (analytics.funnel?.length) {
      const sub = R(r);
      ws.getCell(sub, 1).value = 'Attendance Conversion Funnel';
      ws.getCell(sub, 1).font = { name: FONT_NAME, bold: true, size: 12, color: { argb: argb(NAVY) } };
      r += 1;
      const { headerRow1 } = writeTable(ws, r, {
        accent: NAVY,
        columns: [
          { header: 'Stage', width: 22 },
          { header: 'Count', width: 12, numFmt: '#,##0' },
        ],
        rows: analytics.funnel.map((d) => [d.label, d.value]),
      });
      registerChart(
        index,
        r,
        buildBarChartXml({
          title: 'Attendance Conversion Funnel',
          titleColor: NAVY,
          sheetName: ws.name,
          categoryCol0: DATA_COL0,
          valueCol0: DATA_COL0 + 1,
          rowStart1: headerRow1 + 1,
          rowEnd1: headerRow1 + analytics.funnel.length,
          categories: analytics.funnel.map((d) => d.label),
          values: analytics.funnel.map((d) => d.value),
          seriesName: 'Count',
          pointColors: analytics.funnel.map((_, i) => ORDINAL_RAMP[Math.min(i, ORDINAL_RAMP.length - 1)]),
          horizontal: true,
        }),
        'Attendance Conversion Funnel'
      );
    }
  }

  const rawBuffer = await workbook.xlsx.writeBuffer();
  const finalBuffer = await injectNativeCharts(rawBuffer, chartPlacements);

  const blob = new Blob([finalBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics_report_${communityName.toLowerCase().replace(/\s+/g, '_')}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
