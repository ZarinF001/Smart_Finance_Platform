/**
 * Format a number into Bangladeshi Taka (BDT) representation
 * Example: 15000 -> ৳ 15,000.00
 *
 * @param {number|string} amount
 * @param {object} options
 * @returns {string}
 */
export const formatBDT = (amount, options = {}) => {
  const { showSign = false, decimals = 2 } = options;

  const num = Number(amount);
  if (isNaN(num)) return '৳ 0.00';

  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const formattedNumber = absNum.toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (isNegative) {
    return `-৳${formattedNumber}`;
  }

  if (showSign && num > 0) {
    return `+৳${formattedNumber}`;
  }

  return `৳${formattedNumber}`;
};

/**
 * Format a date string into readable date (e.g., Oct 24, 2026)
 *
 * @param {string|Date} date
 * @param {object} options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A';
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Format date for HTML date inputs (YYYY-MM-DD)
 *
 * @param {string|Date} date
 * @returns {string}
 */
export const toInputDateFormat = (date = new Date()) => {
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
};

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Get human-readable month name from 1-indexed month number (1-12)
 * @param {number} monthNumber (1 to 12)
 * @returns {string}
 */
export const getMonthName = (monthNumber) => {
  const index = Number(monthNumber) - 1;
  return MONTH_NAMES[index] || 'Unknown';
};
