/**
 * Alpine.js component: authForm
 *
 * Manages authentication form state:
 *   - email and password values used to gate submission
 *   - loading state while the server processes the POST
 *
 * Usage:
 *   <form x-data="authForm" @submit="onSubmit">
 *     ...
 *     <input name="email" type="email" x-model="email">
 *     <input name="password" type="password" x-model="password">
 *     ...
 *     <button :disabled="loading || !canSubmit">Submit</button>
 *   </form>
 *
 * `canSubmit` is false until both email and password contain non-whitespace
 * values. `onSubmit` repeats this check to prevent keyboard or programmatic
 * submissions from bypassing the disabled button.
 *
 * @returns {Object} Alpine authentication state and submit validation.
 */
export function authForm() {
	return {
		loading  : false,
		email    : "",
		password : "",

		/**
		 * Returns true when both credentials contain non-whitespace values.
		 *
		 * @returns {boolean} Whether the form has both required credentials.
		 */
		get canSubmit() {
			return !!String( this.email ).trim() && !!String( this.password ).trim();
		},

		/**
		 * Prevents invalid submission and marks valid submissions as loading.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		onSubmit( event ) {
			if ( !this.canSubmit ) {
				event.preventDefault();
				return;
			}
			this.loading = true;
		},
	};
}
