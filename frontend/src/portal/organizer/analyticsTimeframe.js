/**
 * analyticsTimeframe.js — timeframe resolution for the organizer analytics
 * pages. A timeframe value is { preset: '30d' | '90d' | 'all' | 'custom', from, to }
 * where from/to are 'YYYY-MM-DD' strings, only meaningful when preset is 'custom'.
 */

export const TIMEFRAME_PRESETS = [
  { id: '30d', label: 'Last 30 Days', days: 30 },
  { id: '90d', label: 'Last 90 Days', days: 90 },
  { id: 'all', label: 'This Semester', days: null },
];

export const DEFAULT_TIMEFRAME = { preset: 'all', from: '', to: '' };

/** Resolve a timeframe value to concrete { start, end } Date bounds. */
export function resolveTimeframeRange(timeframe, referenceDate = new Date()) {
  if (timeframe.preset === 'custom' && timeframe.from && timeframe.to) {
    const start = new Date(`${timeframe.from}T00:00:00`);
    const end = new Date(`${timeframe.to}T23:59:59`);
    return { start, end };
  }

  const preset = TIMEFRAME_PRESETS.find((p) => p.id === timeframe.preset) || TIMEFRAME_PRESETS[2];
  const end = referenceDate;
  if (preset.days == null) {
    // 'all' — wide enough to include every fixture date in this mock dataset.
    return { start: new Date('2000-01-01T00:00:00'), end };
  }
  const start = new Date(end);
  start.setDate(start.getDate() - preset.days);
  return { start, end };
}

/** Keep only entries whose `date` field falls inside the resolved range. Entries with no `date` are always kept (can't be filtered). */
export function filterByDateRange(data, range) {
  if (!data) return [];
  return data.filter((d) => {
    if (!d.date) return true;
    const t = new Date(`${d.date}T12:00:00`).getTime();
    return t >= range.start.getTime() && t <= range.end.getTime();
  });
}

/** Percentage change from the first to the last entry of a (date-filtered) series. Returns null when there isn't enough data to compare. */
export function computeSeriesDelta(series) {
  if (!series || series.length < 2) return null;
  const first = series[0].value;
  const last = series[series.length - 1].value;
  if (!first) return null;
  return Math.round(((last - first) / first) * 100);
}

/** Human label for the active timeframe, for headers/exports. */
export function formatTimeframeLabel(timeframe, range) {
  if (timeframe.preset === 'custom' && timeframe.from && timeframe.to) {
    const fmt = (iso) =>
      new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${fmt(timeframe.from)} – ${fmt(timeframe.to)}`;
  }
  return TIMEFRAME_PRESETS.find((p) => p.id === timeframe.preset)?.label || 'This Semester';
}
