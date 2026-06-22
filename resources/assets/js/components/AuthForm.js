/**
 * Alpine.js component: authForm
 *
 * Manages shared UI state for authentication forms:
 *   - loading state (spinner while the server processes the POST)
 *   - confirm-password visibility toggle + live mismatch feedback
 *
 * Usage:
 *   <form x-data="authForm" @submit="onSubmit">
 *     ...
 *     <input name="passwordConfirm" :type="showConfirm ? 'text' : 'password'"
 *            x-model="confirmValue" @input="checkConfirm">
 *     <p x-show="confirmError" x-text="confirmError" class="text-danger small"></p>
 *     ...
 *     <button :disabled="loading">Submit</button>
 *   </form>
 *
 * To wire up the confirm-password check, set `passwordRef` to the value of
 * the primary password field whenever it changes:
 *   @input="passwordRef = $event.target.value"   (on the primary password input)
 */
export function authForm() {
	return {
		loading      : false,
		showConfirm  : false,
		confirmValue : "",
		passwordRef  : "",
		confirmError : "",

		checkConfirm(){
			if ( this.confirmValue && this.passwordRef &&
                 this.confirmValue !== this.passwordRef ) {
				this.confirmError = "Passwords do not match.";
			} else {
				this.confirmError = "";
			}
		},

		/** Called by @submit. Returns false (and prevents submit) when there is a
         *  client-side validation error; otherwise sets loading state and allows
         *  the native form POST to proceed. */
		onSubmit( event ) {
			this.checkConfirm();
			if ( this.confirmError ) {
				event.preventDefault();
				return;
			}
			this.loading = true;
		},
	};
}
