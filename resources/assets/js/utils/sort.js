/**
 * Returns whether a table column is the active sort column.
 *
 * @param {string} sortOrder Sort order in `column direction` format.
 * @param {string} column Table column to inspect.
 * @returns {boolean} Whether the column is currently sorted.
 */
export function isSortedColumn( sortOrder = "", column = "" ) {
	return String( sortOrder ).startsWith( `${ column } ` );
}

/**
 * Returns the active CSS class for a table sort button.
 *
 * @param {string} sortOrder Sort order in `column direction` format.
 * @param {string} column Table column to inspect.
 * @returns {string} Active class or an empty string.
 */
export function sortClass( sortOrder = "", column = "" ) {
	return isSortedColumn( sortOrder, column ) ? "is-active" : "";
}

/**
 * Returns the icon class for a table sort indicator.
 *
 * @param {string} sortOrder Sort order in `column direction` format.
 * @param {string} column Table column to inspect.
 * @returns {string} Sort direction or inactive sort icon class.
 */
export function sortIcon( sortOrder = "", column = "" ) {
	if ( !isSortedColumn( sortOrder, column ) ) return "ph-arrows-down-up";
	return String( sortOrder ).endsWith( " desc" ) ? "ph-caret-down" : "ph-caret-up";
}