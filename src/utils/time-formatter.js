/**
 * Converts a dollar amount to a time string based on hourly wage.
 */

/**
 * Convert dollar amount to minutes of work.
 */
export function dollarsToMinutes(dollars, hourlyWage) {
  if (!hourlyWage || hourlyWage <= 0) return 0;
  return (dollars / hourlyWage) * 60;
}

/**
 * Format minutes into a human-readable time string.
 *
 * Examples:
 *   3     -> "3m"
 *   65    -> "1h 5m"
 *   510   -> "8h 30m"
 *   1500  -> "3d 1h"  (assuming 8h work day)
 *   12000 -> "4w 1d"  (assuming 5-day work week)
 */
export function formatTime(totalMinutes, style = 'compact') {
  if (totalMinutes <= 0) return '0m';

  const minutes = Math.round(totalMinutes);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;
  const weeks = Math.floor(days / 5);
  const remainingDays = days % 5;

  if (style === 'compact') {
    if (weeks > 0) {
      const parts = [`${weeks}w`];
      if (remainingDays > 0) parts.push(`${remainingDays}d`);
      return parts.join(' ');
    }
    if (days > 0) {
      const parts = [`${days}d`];
      if (remainingHours > 0) parts.push(`${remainingHours}h`);
      return parts.join(' ');
    }
    if (hours > 0) {
      const parts = [`${hours}h`];
      if (remainingMinutes > 0) parts.push(`${remainingMinutes}m`);
      return parts.join(' ');
    }
    return `${minutes}m`;
  }

  if (style === 'conversational') {
    if (weeks > 0) {
      const parts = [`${weeks} week${weeks > 1 ? 's' : ''}`];
      if (remainingDays > 0)
        parts.push(`${remainingDays} day${remainingDays > 1 ? 's' : ''}`);
      return parts.join(', ') + ' of your life';
    }
    if (days > 0) {
      const parts = [`${days} day${days > 1 ? 's' : ''}`];
      if (remainingHours > 0)
        parts.push(`${remainingHours} hour${remainingHours > 1 ? 's' : ''}`);
      return parts.join(', ') + ' of your life';
    }
    if (hours > 0) {
      const parts = [`${hours} hour${hours > 1 ? 's' : ''}`];
      if (remainingMinutes > 0)
        parts.push(
          `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`
        );
      return parts.join(' and ') + ' of your life';
    }
    return `${minutes} minute${minutes > 1 ? 's' : ''} of your life`;
  }

  return `${minutes}m`;
}

/**
 * Get color tier based on minutes of work.
 * green < 60min, yellow 1-4h, orange 4-8h, red > 8h
 */
export function getTimeTier(totalMinutes) {
  if (totalMinutes < 60) return 'green';
  if (totalMinutes < 240) return 'yellow';
  if (totalMinutes < 480) return 'orange';
  return 'red';
}

/**
 * Full conversion: dollars -> formatted time string with tier.
 */
export function convertPrice(dollars, hourlyWage, style = 'compact') {
  const minutes = dollarsToMinutes(dollars, hourlyWage);
  return {
    text: formatTime(minutes, style),
    tier: getTimeTier(minutes),
    minutes,
  };
}
