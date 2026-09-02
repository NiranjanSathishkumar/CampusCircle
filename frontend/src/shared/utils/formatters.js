/**
 * Helper utility for standardizing number formatting & calculations across CampusCircle.
 * Uses Intl.NumberFormat with Indian locale defaults ('en-IN').
 */

const numberFormatter = new Intl.NumberFormat('en-IN');

export function formatCount(value) {
  if (value === null || value === undefined || isNaN(value)) return '0';
  return numberFormatter.format(Number(value));
}

export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return `₹${numberFormatter.format(Number(amount))}`;
}

export function formatMetricCount(val) {
  const num = Number(val) || 0;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

export function calculateAcademicStanding(cgpa = 0) {
  const num = Number(cgpa);
  if (num >= 9.0) return 'Distinction';
  if (num >= 7.5) return 'First Class';
  if (num >= 6.0) return 'Second Class';
  return 'Good Standing';
}
