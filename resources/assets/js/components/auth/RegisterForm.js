/**
 * Alpine.js component: registerForm
 *
 * Manages registration form state and prevents submission until all required
 * fields are filled and the password confirmation matches.
 *
 * Usage:
 *   <div x-data="registerForm">
 *     <form @submit="onSubmit">
 *       <input name="firstName" x-model="firstName">
 *       <input name="lastName" x-model="lastName">
 *       <input name="email" x-model="email">
 *       <input name="passwordConfirm" x-model="confirmValue">
 *       <button :disabled="loading || !canSubmit">Create account</button>
 *     </form>
 *   </div>
 *
 * @returns {Object} Alpine registration state and validation methods.
 */
export function registerForm() {
	return {
		loading      : false,
		firstName    : "",
		lastName     : "",
		email        : "",
		password     : "",
		confirmValue : "",
		confirmError : "",

		/**
		 * Returns true when all fields are filled and passwords match.
		 *
		 * @returns {boolean} Whether registration may be submitted.
		 */
		get canSubmit() {
			return [
				this.firstName,
				this.lastName,
				this.email,
				this.password,
				this.confirmValue,
			].every( value => !!String( value ).trim() ) && !this.confirmError;
		},

		/**
		 * Updates the confirmation error when the passwords differ.
		 *
		 * @returns {void}
		 */
		checkConfirm() {
			if ( this.confirmValue && this.password && this.confirmValue !== this.password ) {
				this.confirmError = "Passwords do not match.";
			} else {
				this.confirmError = "";
			}
		},

		/**
		 * Sets the password value and checks the confirmation.
		 *
		 * @param {string} value The new password value.
		 * @returns {void}
		 */
		setPassword( value ) {
			this.password = value;
			this.checkConfirm();
		},

		/**
		 * Prevents invalid registration and marks valid submissions as loading.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		onSubmit( event ) {
			this.checkConfirm();
			if ( !this.canSubmit ) {
				event.preventDefault();
				return;
			}
			this.loading = true;
		},
	};
}