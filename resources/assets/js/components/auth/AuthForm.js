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
 */
export function authForm() {
	return {
		loading  : false,
		email    : "",
		password : "",

		/**
		 * Returns true when both the email and password fields are non-empty (after trimming whitespace).
		 */
		get canSubmit() {
			return !!String( this.email ).trim() && !!String( this.password ).trim();
		},

		/**
		 * Called by @submit. Returns false (and prevents submit) when there is a
         * client-side validation error; otherwise sets loading state and allows
         * the native form POST to proceed.
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
