/**
 * Formats a count with singular and plural labels.
 *
 * @param {number|string} count Count to display.
 * @param {string} singular Label used when the count is exactly one.
 * @param {string} plural Label used for all other counts.
 * @returns {string} Formatted count label.
 */
export function countLabel( count, singular, plural = `${ singular }s` ) {
	const numericCount = Number( count ) || 0;
	return `${ numericCount } ${ numericCount === 1 ? singular : plural }`;
}
