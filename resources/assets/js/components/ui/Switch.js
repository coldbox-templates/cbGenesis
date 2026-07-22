/**
 * Converts common form values into a boolean switch state.
 *
 * @param {*} value Value to convert.
 * @returns {boolean} Normalized boolean value.
 */
function coerceBoolean( value ) {
	if ( typeof value === "boolean" ) {
		return value;
	}

	if ( typeof value === "number" ) {
		return value !== 0;
	}

	if ( typeof value === "string" ) {
		const normalized = value.trim().toLowerCase();
		return [
			"true",
			"1",
			"yes",
			"on"
		].includes( normalized );
	}

	return !!value;
}

/**
 * Alpine.js switch component.
 *
 * Keeps a boolean toggle in sync with a hidden field so forms submit the
 * current state without relying on visible checkbox markup.
 *
 * @param {Object} options Component configuration.
 * @param {*} options.checked Initial switch state.
 * @param {string} options.name Form field name used in the accessible label.
 * @param {string} options.trueValue Value submitted when enabled.
 * @param {string} options.falseValue Value submitted when disabled.
 * @returns {Object} Alpine switch state and computed form values.
 */
export function switchComponent( {
	checked = false,
	name = "",
	trueValue = "true",
	falseValue = "false",
} = {} ) {
	return {
		checked : coerceBoolean( checked ),
		name,
		trueValue,
		falseValue,

		/**
		 * Inverts the current switch state.
		 *
		 * @returns {void}
		 */
		toggle() {
			this.checked = !this.checked;
		},

		/**
		 * Returns the configured form value for the current state.
		 *
		 * @returns {string} Value submitted by the hidden form field.
		 */
		get submittedValue() {
			return this.checked ? this.trueValue : this.falseValue;
		},

		/**
		 * Returns an accessible label describing the current state.
		 *
		 * @returns {string} Accessible switch label.
		 */
		get ariaLabel() {
			return this.name ? `${ this.name } ${ this.checked ? "enabled" : "disabled" }` : `Switch ${ this.checked ? "enabled" : "disabled" }`;
		},
	};
}