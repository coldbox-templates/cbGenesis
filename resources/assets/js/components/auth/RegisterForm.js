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
		loading          : false,
		firstName        : "",
		lastName         : "",
		email            : "",
		emailChecking    : false,
		emailAvailable   : false,
		emailUnavailable : false,
		emailCheckError  : "",
		password         : "",
		confirmValue     : "",
		confirmError     : "",
		showConfirm      : false,
		emailRequest     : 0,

		/**
		 * Returns the registration email availability endpoint from the form root.
		 *
		 * @returns {string} Relative endpoint URL.
		 */
		get emailCheckUrl() {
			return this.$root.dataset.emailCheckUrl || "";
		},

		/**
		 * Returns Bootstrap validation classes for the email control.
		 *
		 * @returns {Object} Conditional validation classes.
		 */
		get emailClass() {
			return {
				"is-valid"   : this.emailAvailable,
				"is-invalid" : this.emailUnavailable || !!this.emailCheckError,
			};
		},

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
			].every( value => !!String( value ).trim() )
				&& !this.confirmError
				&& this.emailAvailable
				&& !this.emailChecking
				&& !this.emailUnavailable
				&& !this.emailCheckError;
		},

		/**
		 * Clears a previous result as soon as the email value changes.
		 *
		 * @returns {void}
		 */
		emailChanged() {
			this.emailRequest++;
			this.emailAvailable = false;
			this.emailUnavailable = false;
			this.emailCheckError = "";
			this.emailChecking = false;
		},

		/**
		 * Checks email availability after focus leaves the email control.
		 * A sequence number prevents a slower response from replacing newer state.
		 *
		 * @returns {Promise<void>} Completes when the availability check finishes.
		 */
		async checkEmailAvailability() {
			const email = String( this.email || "" ).trim();
			const requestId = ++this.emailRequest;
			this.emailAvailable = false;
			this.emailUnavailable = false;
			this.emailCheckError = "";

			if ( !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( email ) || !this.emailCheckUrl ) return;

			this.emailChecking = true;
			try {
				const response = await fetch( `${ this.emailCheckUrl }?email=${ encodeURIComponent( email ) }`, {
					headers     : { Accept: "application/json" },
					credentials : "same-origin",
				} );
				if ( requestId !== this.emailRequest ) return;
				if ( !response.ok ) throw new Error( "Email availability could not be checked." );

				const result = await response.json();
				if ( requestId !== this.emailRequest ) return;
				this.emailAvailable = result.valid === true && result.available === true;
				this.emailUnavailable = result.valid === true && result.available === false;
				if ( !result.valid ) this.emailCheckError = "Enter a valid email address.";
			} catch ( error ) {
				if ( requestId === this.emailRequest ) {
					this.emailCheckError = "We could not check this email. Please try again.";
				}
			} finally {
				if ( requestId === this.emailRequest ) this.emailChecking = false;
			}
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