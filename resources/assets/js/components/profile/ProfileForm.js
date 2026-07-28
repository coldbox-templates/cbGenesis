/**
 * Alpine.js component for the authenticated profile page.
 *
 * Owns the profile and password subforms so both sections can submit through
 * the same JSON response and notice handling workflow.
 *
 * @param {Object} initialProfile Safe profile data loaded by the server.
 * @param {string} csrfToken CSRF token for profile and API token submissions.
 * @returns {Object} Alpine profile form state and handlers.
 */
export function profileForm( initialProfile = {}, csrfToken = "" ) {
	return {
		activeTab : "profile",
		loading   : "",
		notice    : { type: "", message: "" },
		profile   : {
			firstName : initialProfile.firstName ?? "",
			lastName  : initialProfile.lastName ?? "",
			email     : initialProfile.email ?? "",
			biography : initialProfile.biography ?? "",
			errors    : {},
			initial   : {},
		},
		csrfToken,
		password : {
			currentPassword : "",
			newPassword     : "",
			passwordConfirm : "",
			errors          : {},
		},
		apiTokens          : [],
		tokenModalOpen     : false,
		tokenModalMode     : "create",
		editingToken       : null,
		tokenSubmitting    : false,
		tokenErrors        : {},
		selectedToken      : null,
		confirmTokenOpen   : false,
		deleteTokenLoading : false,
		createdRawToken    : "",
		tokenCopied        : false,
		tokenForm          : {
			label      : "",
			expiration : "",
		},

		/**
		 * Captures the initial profile values and loads the user's API tokens.
		 *
		 * @returns {void}
		 */
		init() {
			this.profile.initial = this.profileValues();
			this.loadApiTokens();
		},

		/**
		 * Indicates whether the API token form has a usable label.
		 *
		 * @returns {boolean} Whether the token label is valid.
		 */
		get tokenFormValid() {
			return Boolean( this.tokenForm.label.trim() );
		},

		/**
		 * Loads safe API token metadata for the authenticated user.
		 *
		 * @returns {Promise<void>}
		 */
		async loadApiTokens() {
			try {
				const response = await fetch( "/profile/api-tokens", {
					credentials : "same-origin",
					headers     : { Accept: "application/json" },
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) {
					throw new Error( payload.messages || "API tokens could not be loaded." );
				}
				this.apiTokens = payload.data || [];
			} catch ( error ) {
				this.notice = { type: "error", message: error.message || "API tokens could not be loaded." };
			}
		},

		/** Opens the create-token modal with a clean form. */
		openCreateTokenModal() {
			this.tokenModalMode = "create";
			this.editingToken = null;
			this.tokenForm = { label: "", expiration: "" };
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
			this.tokenModalOpen = true;
			this.$nextTick( () => this.$root.querySelector( "#api-token-label" )?.focus() );
		},

		/**
		 * Opens the token modal for editing an existing token.
		 *
		 * @param {Object} token Token metadata selected for editing.
		 * @returns {void}
		 */
		openEditTokenModal( token ) {
			this.tokenModalMode = "edit";
			this.editingToken = token;
			this.tokenForm = {
				label      : token.label || "",
				expiration : "",
			};
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
			this.tokenModalOpen = true;
			this.$nextTick( () => this.$root.querySelector( "#api-token-label" )?.focus() );
		},

		/**
		 * Closes the token modal and clears transient token state.
		 *
		 * @param {boolean} force Close while a request is in progress.
		 * @returns {void}
		 */
		closeTokenModal( force = false ) {
			if ( this.tokenSubmitting && !force ) return;
			this.tokenModalOpen = false;
			this.editingToken = null;
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
		},

		/**
		 * Creates or updates an API token from the modal form.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {Promise<void>}
		 */
		async saveToken( event ) {
			event.preventDefault();
			if ( !this.tokenFormValid || this.tokenSubmitting ) return;
			this.tokenSubmitting = true;
			this.tokenErrors = {};

			try {
				const endpoint = this.tokenModalMode === "edit"
					? `/profile/api-tokens/${ encodeURIComponent( this.editingToken.tokenId ) }`
					: "/profile/api-tokens";
				const response = await fetch( endpoint, {
					method      : "POST",
					body        : new FormData( event.currentTarget ),
					credentials : "same-origin",
					headers     : { Accept: "application/json" },
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) {
					this.applyErrors( this.tokenErrors, payload.data || {} );
					throw new Error( payload.messages || "API token could not be saved." );
				}

				if ( this.tokenModalMode === "edit" ) {
					this.apiTokens = this.apiTokens.map( token =>
						token.tokenId === payload.data.tokenId ? payload.data : token
					);
					this.closeTokenModal( true );
				} else {
					this.apiTokens = [
						payload.data.token,
						...this.apiTokens
					];
					this.createdRawToken = payload.data.rawToken || "";
				}
				this.notice = { type: "success", message: payload.messages || "API token saved successfully." };
			} catch ( error ) {
				this.notice = { type: "error", message: error.message || "API token could not be saved." };
			} finally {
				this.tokenSubmitting = false;
			}
		},

		/**
		 * Opens the delete confirmation dialog for a token.
		 *
		 * @param {Object} token Token metadata selected for deletion.
		 * @returns {void}
		 */
		confirmDeleteToken( token ) {
			this.selectedToken = token;
			this.confirmTokenOpen = true;
		},

		/**
		 * Closes the delete confirmation dialog and clears its selection.
		 *
		 * @param {boolean} force Close while a request is in progress.
		 * @returns {void}
		 */
		cancelDeleteToken( force = false ) {
			if ( this.deleteTokenLoading && !force ) return;
			this.confirmTokenOpen = false;
			this.selectedToken = null;
		},

		/**
		 * Deletes the selected API token after confirmation.
		 *
		 * @returns {Promise<void>}
		 */
		async deleteApiToken() {
			if ( !this.selectedToken || this.deleteTokenLoading ) return;
			this.deleteTokenLoading = true;
			try {
				const response = await fetch( `/profile/api-tokens/${ encodeURIComponent( this.selectedToken.tokenId ) }`, {
					method      : "DELETE",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body        : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) throw new Error( payload.messages || "API token could not be deleted." );
				this.apiTokens = this.apiTokens.filter( token => token.tokenId !== this.selectedToken.tokenId );
				this.notice = { type: "success", message: payload.messages || "API token deleted successfully." };
				this.cancelDeleteToken( true );
			} catch ( error ) {
				this.notice = { type: "error", message: error.message || "API token could not be deleted." };
			} finally {
				this.deleteTokenLoading = false;
			}
		},

		/** Copies the newly-created raw token to the clipboard. */
		async copyCreatedToken() {
			if ( !this.createdRawToken || !navigator.clipboard ) return;
			try {
				await navigator.clipboard.writeText( this.createdRawToken );
				this.tokenCopied = true;
			} catch ( error ) {
				this.notice = { type: "error", message: "The token could not be copied. Select and copy it manually." };
			}
		},

		/**
		 * Returns normalized values used to detect profile changes.
		 *
		 * @returns {Object} Normalized profile values.
		 */
		profileValues() {
			return {
				firstName : this.normalize( this.profile.firstName ),
				lastName  : this.normalize( this.profile.lastName ),
				email     : this.normalize( this.profile.email ),
				biography : this.normalize( this.profile.biography ),
			};
		},

		/**
		 * Converts a profile field to a trimmed string.
		 *
		 * @param {*} value Value to normalize.
		 * @returns {string} Normalized value.
		 */
		normalize( value ) {
			return String( value ?? "" ).trim();
		},

		/** Indicates whether profile fields differ from their initial values. */
		get profileDirty() {
			const current = this.profileValues();
			return Object.keys( current ).some( key => current[ key ] !== this.profile.initial[ key ] );
		},

		/** Indicates whether the required profile fields are valid. */
		get profileValid() {
			return Boolean(
				this.profile.firstName.trim()
				&& this.profile.lastName.trim()
				&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( this.profile.email.trim() )
			);
		},

		/** Indicates whether the password form can be submitted. */
		get passwordValid() {
			return Boolean(
				this.password.currentPassword
				&& this.password.newPassword
				&& this.password.passwordConfirm === this.password.newPassword
				&& this.passwordStrengthValid
			);
		},

		/** Indicates whether the new password meets the strength policy. */
		get passwordStrengthValid() {
			const value = this.password.newPassword;
			return value.length >= 8
				&& /[A-Z]/.test( value )
				&& /[a-z]/.test( value )
				&& /[0-9]/.test( value )
				&& /[^A-Za-z0-9]/.test( value );
		},

		/**
		 * Returns a password confirmation error when the values differ.
		 *
		 * @returns {string} Validation message or an empty string.
		 */
		get passwordConfirmationError() {
			if ( !this.password.passwordConfirm ) return "";
			return this.password.passwordConfirm === this.password.newPassword
				? ""
				: "Passwords do not match.";
		},

		/** Clears server-side password errors while the user edits the password. */
		setNewPassword( value ) {
			this.password.newPassword = value;
			this.password.errors.password = "";
		},

		/** Updates the confirmation value and its validation error. */
		setPasswordConfirmation( value ) {
			this.password.passwordConfirm = value;
			this.password.errors.passwordConfirm = this.passwordConfirmationError;
		},

		/** Clears the global notice. */
		clearNotice() {
			this.notice = { type: "", message: "" };
		},

		/**
		 * Converts a server validation error value into display text.
		 *
		 * @param {Object} errors Error map returned by the server.
		 * @param {string} field Error field name.
		 * @returns {string} Displayable error text.
		 */
		fieldError( errors, field ) {
			const value = errors?.[ field ];
			if ( Array.isArray( value ) ) return value.join( " " );
			if ( value && typeof value === "object" ) return value.message ?? "";
			return String( value ?? "" );
		},

		/** Copies server validation errors into an Alpine state object. */
		applyErrors( target, errors = {} ) {
			for ( const field of Object.keys( errors ) ) {
				target[ field ] = this.fieldError( errors, field );
			}
		},

		/**
		 * Submits a profile-related form and applies its response state.
		 *
		 * @param {HTMLFormElement} form Form being submitted.
		 * @param {string} endpoint Fallback endpoint when the form has no action.
		 * @param {string} owner State group receiving loading and validation state.
		 * @returns {Promise<void>}
		 */
		async submit( form, endpoint, owner ) {
			this.clearNotice();
			this.loading = owner;
			owner === "profile" ? this.profile.errors = {} : this.password.errors = {};

			try {
				const response = await fetch( form.action || endpoint, {
					method      : "POST",
					body        : new FormData( form ),
					credentials : "same-origin",
					headers     : { Accept: "application/json" },
				} );
				const payload = await response.json();

				if ( !response.ok || payload.error ) {
					const errors = payload.data ?? {};
					this.applyErrors( owner === "profile" ? this.profile.errors : this.password.errors, errors );
					this.notice = { type: "error", message: payload.messages || "Please correct the highlighted fields." };
					return;
				}

				this.notice = { type: "success", message: payload.messages || "Changes saved successfully." };
				if ( owner === "profile" ) {
					this.profile.initial = this.profileValues();
					this.profile.errors = {};
					this.updateProfileHero( payload.data ?? {} );
				} else {
					this.password.currentPassword = "";
					this.password.newPassword = "";
					this.password.passwordConfirm = "";
					this.password.errors = {};
				}
			} catch ( error ) {
				this.notice = { type: "error", message: "The request could not be completed. Please try again." };
			} finally {
				this.loading = "";
			}
		},

		/** Prevents invalid profile submissions and submits valid profile changes. */
		submitProfile( event ) {
			event.preventDefault();
			if ( !this.profileDirty || !this.profileValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile", "profile" );
		},

		/** Prevents invalid password submissions and submits valid password changes. */
		submitPassword( event ) {
			event.preventDefault();
			if ( !this.passwordValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile/password", "password" );
		},

		/** Updates the profile hero after a successful profile save. */
		updateProfileHero( profile ) {
			const name = [
				profile.firstName,
				profile.lastName
			].filter( Boolean ).join( " " );
			const initials = [
				profile.firstName,
				profile.lastName
			]
				.filter( Boolean )
				.map( value => value.charAt( 0 ) )
				.join( "" );
			if ( name ) this.$root.querySelector( "[data-profile-name]" ).textContent = name;
			if ( initials ) this.$root.querySelector( "[data-profile-initials]" ).textContent = initials;
		},
	};
}
