/**
 * Alpine.js component for the authenticated profile page.
 *
 * Owns the profile and password subforms so both sections can submit through
 * the same JSON response and notice handling workflow.
 *
 * @param {Object} initialProfile Safe profile data loaded by the server.
 * @param {string} csrfToken CSRF token for profile and API token submissions.
 *
 * @returns {Object} Alpine profile form state and handlers.
 */
export function profileForm( initialProfile = {}, csrfToken = "", apiTokenMaxValidityMonths = 12 ) {
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
		apiTokens            : [],
		passkeys             : [],
		passkeyRegistering   : false,
		selectedPasskey      : null,
		confirmPasskeyOpen   : false,
		deletePasskeyLoading : false,
		tokenSortKey         : "label",
		tokenSortDirection   : "asc",
		tokenModalOpen       : false,
		tokenModalMode       : "create",
		editingToken         : null,
		tokenSubmitting      : false,
		tokenErrors          : {},
		selectedToken        : null,
		confirmTokenOpen     : false,
		deleteTokenLoading   : false,
		createdRawToken      : "",
		tokenCopied          : false,
		apiTokenMaxValidityMonths,
		tokenForm            : {
			label            : "",
			expirationPreset : "",
			expiration       : "",
		},

		/**
		 * Captures the initial profile values and loads the user's API tokens.
		 *
		 * @returns {void}
		 */
		init() {
			this.profile.initial = this.profileValues();
			this.loadApiTokens();
			this.loadPasskeys();
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
		 * Returns the latest date allowed for a custom token expiration.
		 *
		 * @returns {string} Maximum date in the native date-input format.
		 */
		get apiTokenMaxDate() {
			const date = new Date();
			date.setMonth( date.getMonth() + Number( this.apiTokenMaxValidityMonths || 12 ) );
			return this.toDateInputValue( date );
		},

		/**
		 * Converts a date to the local YYYY-MM-DD format used by date inputs.
		 *
		 * @param {Date} date Date to convert.
		 * @returns {string} Local date-input value.
		 */
		toDateInputValue( date ) {
			return [
				date.getFullYear(),
				String( date.getMonth() + 1 ).padStart( 2, "0" ),
				String( date.getDate() ).padStart( 2, "0" )
			].join( "-" );
		},

		/**
		 * Applies a preset duration or reveals the custom expiration date.
		 *
		 * @returns {void}
		 */
		setTokenExpirationPreset() {
			if ( this.tokenForm.expirationPreset === "custom" ) {
				this.tokenForm.expiration = "";
				return;
			}
			if ( !this.tokenForm.expirationPreset ) {
				this.tokenForm.expiration = "";
				return;
			}
			const date = new Date();
			date.setDate( date.getDate() + Number( this.tokenForm.expirationPreset ) );
			const expiration = this.toDateInputValue( date );
			this.tokenForm.expiration = expiration <= this.apiTokenMaxDate
				? expiration
				: this.apiTokenMaxDate;
		},

		/**
		 * Formats an API token date for display.
		 *
		 * @param {string|Date|null} value Date value returned by the server.
		 * @param {string} fallback Label used when no valid date exists.
		 *
		 * @returns {string} Localized date or a fallback label.
		 */
		formatTokenDate( value, fallback = "Never" ) {
			if ( !value ) return fallback;
			const date = new Date( value );
			return Number.isNaN( date.getTime() )
				? fallback
				: new Intl.DateTimeFormat( undefined, { dateStyle: "medium" } ).format( date );
		},

		/**
		 * Returns whether an API token is expired or expires within seven days.
		 *
		 * @param {string|Date|null} value Token expiration date.
		 *
		 * @returns {boolean} Whether the token expiration should be emphasized.
		 */
		tokenExpiringSoon( value ) {
			if ( !value ) return false;
			const expiration = new Date( value );
			if ( Number.isNaN( expiration.getTime() ) ) return false;
			return expiration <= new Date( Date.now() + ( 7 * 24 * 60 * 60 * 1000 ) );
		},

		/**
		 * Returns API tokens ordered by the active table sort.
		 *
		 * @returns {Array} Sorted API token metadata.
		 */
		get sortedApiTokens() {
			const direction = this.tokenSortDirection === "asc" ? 1 : -1;
			const sortKey = this.tokenSortKey;

			return [ ...this.apiTokens ].sort( ( firstToken, secondToken ) => {
				const firstValue = firstToken[ sortKey ];
				const secondValue = secondToken[ sortKey ];
				if ( !firstValue && !secondValue ) return 0;
				if ( !firstValue ) return 1;
				if ( !secondValue ) return -1;

				if ( [
					"expiration",
					"lastUsed",
					"createdDate"
				].includes( sortKey ) ) {
					return ( new Date( firstValue ) - new Date( secondValue ) ) * direction;
				}

				return String( firstValue ).localeCompare( String( secondValue ) ) * direction;
			} );
		},

		/**
		 * Selects a table sort column or reverses its direction.
		 *
		 * @param {string} sortKey Token field to sort by.
		 * @returns {void}
		 */
		sortTokens( sortKey ) {
			if ( this.tokenSortKey === sortKey ) {
				this.tokenSortDirection = this.tokenSortDirection === "asc" ? "desc" : "asc";
				return;
			}
			this.tokenSortKey = sortKey;
			this.tokenSortDirection = "asc";
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

		/**
		 * Loads non-sensitive passkey metadata for the authenticated user.
		 *
		 * @returns {Promise<void>}
		 */
		async loadPasskeys() {
			try {
				const response = await fetch( "/profile/passkeys", {
					credentials : "same-origin",
					headers     : { Accept: "application/json" },
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) throw new Error( payload.messages || "Passkeys could not be loaded." );
				this.passkeys = payload.data || [];
			} catch ( error ) {
				this.notice = { type: "error", message: error.message || "Passkeys could not be loaded." };
			}
		},

		/**
		 * Runs the cbsecurity-passkeys registration ceremony without leaving the profile page.
		 *
		 * @returns {Promise<void>}
		 */
		async registerPasskey() {
			if ( this.passkeyRegistering ) return;
			this.passkeyRegistering = true;
			this.clearNotice();
			try {
				if ( !window.cbSecurity?.passkeys || !await window.cbSecurity.passkeys.isSupported() ) {
					throw new Error( "This browser does not support passkeys." );
				}
				const optionsResponse = await fetch( "/cbsecurity/passkeys/registration/new", {
					credentials : "same-origin",
					headers     : { Accept: "application/json" },
				} );
				const optionsPayload = await optionsResponse.json();
				if ( !optionsResponse.ok ) throw new Error( optionsPayload.message || "Passkey registration could not start." );
				const options = typeof optionsPayload === "string" ? JSON.parse( optionsPayload ) : optionsPayload;
				const credential = await window.webauthnJSON.create( options );
				const response = await fetch( "/cbsecurity/passkeys/registration", {
					method      : "POST",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/json", Accept: "application/json" },
					body        : JSON.stringify( { publicKeyCredentialJson: JSON.stringify( credential ) } ),
				} );
				const payload = await response.json();
				if ( !response.ok ) throw new Error( payload.message || "Passkey could not be registered." );
				await this.loadPasskeys();
				this.notice = { type: "success", message: "Passkey registered successfully." };
			} catch ( error ) {
				this.notice = { type: "error", message: error.name === "NotAllowedError" ? "Passkey registration was cancelled." : ( error.message || "Passkey registration failed." ) };
			} finally {
				this.passkeyRegistering = false;
			}
		},

		/** Opens the passkey removal confirmation dialog. */
		confirmDeletePasskey( passkey ) {
			this.selectedPasskey = passkey;
			this.confirmPasskeyOpen = true;
		},

		/** Closes the passkey removal confirmation dialog. */
		cancelDeletePasskey( force = false ) {
			if ( this.deletePasskeyLoading && !force ) return;
			this.confirmPasskeyOpen = false;
			this.selectedPasskey = null;
		},

		/** Deletes the selected passkey after confirmation. */
		async deletePasskey() {
			if ( !this.selectedPasskey || this.deletePasskeyLoading ) return;
			this.deletePasskeyLoading = true;
			try {
				const response = await fetch( `/profile/passkeys/${ encodeURIComponent( this.selectedPasskey.passkeyId ) }`, {
					method      : "DELETE",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body        : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) throw new Error( payload.messages || "Passkey could not be removed." );
				this.passkeys = this.passkeys.filter( item => item.passkeyId !== this.selectedPasskey.passkeyId );
				this.notice = { type: "success", message: payload.messages || "Passkey removed successfully." };
				this.cancelDeletePasskey( true );
			} catch ( error ) {
				this.notice = { type: "error", message: error.message || "Passkey could not be removed." };
			} finally {
				this.deletePasskeyLoading = false;
			}
		},

		/**
		 * Opens the create-token modal with a clean form.
		 *
		 * @returns {void}
		 */
		openCreateTokenModal() {
			this.tokenModalMode = "create";
			this.editingToken = null;
			this.tokenForm = { label: "", expirationPreset: "", expiration: "" };
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
			this.tokenModalOpen = true;
			this.$focus( "#api-token-label" );
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
			this.$focus( "#api-token-label" );
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

		/**
		 * Copies the newly-created raw token to the clipboard.
		 *
		 * @returns {Promise<void>}
		 */
		async copyCreatedToken() {
			if ( await this.$copy( this.createdRawToken ) ) {
				this.tokenCopied = true;
			} else {
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

		/**
		 * Indicates whether profile fields differ from their initial values.
		 *
		 * @returns {boolean} Whether unsaved profile changes exist.
		 */
		get profileDirty() {
			const current = this.profileValues();
			return Object.keys( current ).some( key => current[ key ] !== this.profile.initial[ key ] );
		},

		/**
		 * Indicates whether the required profile fields are valid.
		 *
		 * @returns {boolean} Whether names and email pass validation.
		 */
		get profileValid() {
			return Boolean(
				this.profile.firstName.trim()
				&& this.profile.lastName.trim()
				&& this.$isEmail( this.profile.email )
			);
		},

		/**
		 * Indicates whether the password form can be submitted.
		 *
		 * @returns {boolean} Whether current password, strength, and confirmation pass.
		 */
		get passwordValid() {
			return Boolean(
				this.password.currentPassword
				&& this.password.newPassword
				&& this.password.passwordConfirm === this.password.newPassword
				&& this.passwordStrengthValid
			);
		},

		/**
		 * Indicates whether the new password meets the strength policy.
		 *
		 * @returns {boolean} Whether the password meets all strength requirements.
		 */
		get passwordStrengthValid() {
			return this.$passwordMeetsPolicy( this.password.newPassword );
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

		/**
		 * Clears server-side password errors while the user edits the password.
		 *
		 * @param {string} value New password value.
		 * @returns {void}
		 */
		setNewPassword( value ) {
			this.password.newPassword = value;
			this.password.errors.password = "";
		},

		/**
		 * Updates the confirmation value and its validation error.
		 *
		 * @param {string} value Password confirmation value.
		 * @returns {void}
		 */
		setPasswordConfirmation( value ) {
			this.password.passwordConfirm = value;
			this.password.errors.passwordConfirm = this.passwordConfirmationError;
		},

		/**
		 * Clears the global profile page notice.
		 *
		 * @returns {void}
		 */
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

		/**
		 * Copies server validation errors into an Alpine state object.
		 *
		 * @param {Object} target State object receiving error messages.
		 * @param {Object} errors Server validation error map.
		 * @returns {void}
		 */
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

		/**
		 * Prevents invalid profile submissions and submits valid profile changes.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		submitProfile( event ) {
			event.preventDefault();
			if ( !this.profileDirty || !this.profileValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile", "profile" );
		},

		/**
		 * Prevents invalid password submissions and submits valid password changes.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		submitPassword( event ) {
			event.preventDefault();
			if ( !this.passwordValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile/password", "password" );
		},

		/**
		 * Updates the profile hero after a successful profile save.
		 *
		 * @param {Object} profile Updated profile data from the server.
		 * @returns {void}
		 */
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
