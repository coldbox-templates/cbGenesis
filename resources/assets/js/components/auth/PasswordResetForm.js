/**
 * Alpine.js component: passwordResetForm
 *
 * Manages password reset form state and prevents submission until all required
 * fields are filled and the password confirmation matches.
 *
 * Usage:
 *   <div x-data="passwordResetForm">
 *     <form @submit="onSubmit">
 *       <input name="passwordConfirm" x-model="confirmValue">
 *       <button :disabled="loading || !canSubmit">Reset Password</button>
 *     </form>
 *   </div>
 *
 * @returns {Object} Alpine registration state and validation methods.
 */
export function passwordResetForm() {
	return {
		loading      : false,
		password     : "",
		confirmValue : "",
		confirmError : "",
		showConfirm  : false,

		/**
		 * Returns true when all fields are filled and passwords match.
		 *
		 * @returns {boolean} Whether registration may be submitted.
		 */
		get canSubmit() {
			return [
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