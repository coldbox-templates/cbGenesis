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

/**
 * Formats a date as a human-readable relative time using the browser's locale.
 *
 * @param {string|number|Date|null} value Date-time value to format.
 * @param {*} fallback Value returned when the date is invalid.
 * @returns {string|*} Relative date string or the fallback value.
 */
export function formatRelativeDate( value, fallback = "Never" ) {
	if ( value === null || value === undefined || value === "" ) {
		return fallback;
	}

	const date = new Date( value );
	if ( Number.isNaN( date.getTime() ) ) {
		return fallback;
	}

	const seconds = ( date.getTime() - Date.now() ) / 1000;
	const units = [
		{ name: "year", seconds: 31536000 },
		{ name: "month", seconds: 2628000 },
		{ name: "week", seconds: 604800 },
		{ name: "day", seconds: 86400 },
		{ name: "hour", seconds: 3600 },
		{ name: "minute", seconds: 60 },
		{ name: "second", seconds: 1 },
	];
	const relativeUnit = units.find( ( unit ) => Math.abs( seconds ) >= unit.seconds ) || units.at( -1 );
	const valueInUnit = Math.round( seconds / relativeUnit.seconds );

	return new Intl.RelativeTimeFormat( undefined, { numeric: "always" } ).format( valueInUnit, relativeUnit.name );
}
