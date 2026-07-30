/**
 * Formats a date using the browser's locale and timezone.
 *
 * @param {string|number|Date|null} value Date value to format.
 * @param {*} fallback Value returned when the date is invalid.
 * @returns {string|*} Localized date string or the fallback value.
 */
export function formatDate( value, fallback = value ) {
	const date = new Date( value );
	return Number.isNaN( date.getTime() )
		? fallback
		: new Intl.DateTimeFormat( undefined, { dateStyle: "medium" } ).format( date );
}

/**
 * Formats a date and time using the browser's locale and timezone.
 *
 * @param {string|number|Date|null} value Date-time value to format.
 * @param {*} fallback Value returned when the date is invalid.
 * @returns {string|*} Localized date-time string or the fallback value.
 */
export function formatDateTime( value, fallback = value ) {
	const date = new Date( value );
	return Number.isNaN( date.getTime() )
		? fallback
		: new Intl.DateTimeFormat( undefined, { dateStyle: "medium", timeStyle: "medium" } ).format( date );
}
