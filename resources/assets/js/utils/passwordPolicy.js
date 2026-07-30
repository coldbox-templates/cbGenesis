/**
 * Returns the password composition requirements used by the application.
 *
 * @param {*} value Password value to inspect.
 * @returns {Object} Requirement names mapped to completion states.
 */
export function passwordRequirements( value ) {
	const password = String( value ?? "" );

	return {
		length    : password.length >= 8,
		uppercase : /[A-Z]/.test( password ),
		lowercase : /[a-z]/.test( password ),
		number    : /[0-9]/.test( password ),
		special   : /[^A-Za-z0-9]/.test( password ),
	};
}

/**
 * Determines whether a password satisfies the minimum password policy.
 *
 * @param {*} value Password value to validate.
 * @returns {boolean} Whether the password has the required length and character types.
 */
export function passwordMeetsPolicy( value ) {
	return Object.values( passwordRequirements( value ) ).every( Boolean );
}
