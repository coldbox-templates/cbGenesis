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

		toggle() {
			this.checked = !this.checked;
		},

		get submittedValue() {
			return this.checked ? this.trueValue : this.falseValue;
		},

		get ariaLabel() {
			return this.name ? `${ this.name } ${ this.checked ? "enabled" : "disabled" }` : `Switch ${ this.checked ? "enabled" : "disabled" }`;
		},
	};
}