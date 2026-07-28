/**
 * Alpine.js component for the authenticated profile page.
 *
 * Owns the profile and password subforms so both sections can submit through
 * the same JSON response and notice handling workflow.
 *
 * @param {Object} initialProfile Safe profile data loaded by the server.
 * @returns {Object} Alpine profile form state and handlers.
 */
export function profileForm( initialProfile = {} ) {
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

		init() {
			this.profile.initial = this.profileValues();
			this.loadApiTokens();
		},

		get tokenFormValid() {
			return Boolean( this.tokenForm.label.trim() );
		},

		csrfValue() {
			return this.$root.querySelector( "input[name='csrf']" )?.value || "";
		},

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

		openEditTokenModal( token ) {
			this.tokenModalMode = "edit";
			this.editingToken = token;
			this.tokenForm = {
				label      : token.label || "",
				expiration : token.expiration ? String( token.expiration ).substring( 0, 10 ) : "",
			};
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
			this.tokenModalOpen = true;
			this.$nextTick( () => this.$root.querySelector( "#api-token-label" )?.focus() );
		},

		closeTokenModal( force = false ) {
			if ( this.tokenSubmitting && !force ) return;
			this.tokenModalOpen = false;
			this.editingToken = null;
			this.tokenErrors = {};
			this.createdRawToken = "";
			this.tokenCopied = false;
		},

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

		confirmDeleteToken( token ) {
			this.selectedToken = token;
			this.confirmTokenOpen = true;
		},

		cancelDeleteToken( force = false ) {
			if ( this.deleteTokenLoading && !force ) return;
			this.confirmTokenOpen = false;
			this.selectedToken = null;
		},

		async deleteApiToken() {
			if ( !this.selectedToken || this.deleteTokenLoading ) return;
			this.deleteTokenLoading = true;
			try {
				const response = await fetch( `/profile/api-tokens/${ encodeURIComponent( this.selectedToken.tokenId ) }`, {
					method      : "DELETE",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body        : new URLSearchParams( { csrf: this.csrfValue() } ),
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

		async copyCreatedToken() {
			if ( !this.createdRawToken || !navigator.clipboard ) return;
			await navigator.clipboard.writeText( this.createdRawToken );
			this.tokenCopied = true;
		},

		profileValues() {
			return {
				firstName : this.normalize( this.profile.firstName ),
				lastName  : this.normalize( this.profile.lastName ),
				email     : this.normalize( this.profile.email ),
				biography : this.normalize( this.profile.biography ),
			};
		},

		normalize( value ) {
			return String( value ?? "" ).trim();
		},

		get profileDirty() {
			const current = this.profileValues();
			return Object.keys( current ).some( key => current[ key ] !== this.profile.initial[ key ] );
		},

		get profileValid() {
			return Boolean(
				this.profile.firstName.trim()
				&& this.profile.lastName.trim()
				&& /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( this.profile.email.trim() )
			);
		},

		get passwordValid() {
			return Boolean(
				this.password.currentPassword
				&& this.password.newPassword
				&& this.password.passwordConfirm === this.password.newPassword
				&& this.passwordStrengthValid
			);
		},

		get passwordStrengthValid() {
			const value = this.password.newPassword;
			return value.length >= 8
				&& /[A-Z]/.test( value )
				&& /[a-z]/.test( value )
				&& /[0-9]/.test( value )
				&& /[^A-Za-z0-9]/.test( value );
		},

		get passwordConfirmationError() {
			if ( !this.password.passwordConfirm ) return "";
			return this.password.passwordConfirm === this.password.newPassword
				? ""
				: "Passwords do not match.";
		},

		setNewPassword( value ) {
			this.password.newPassword = value;
			this.password.errors.password = "";
		},

		setPasswordConfirmation( value ) {
			this.password.passwordConfirm = value;
			this.password.errors.passwordConfirm = this.passwordConfirmationError;
		},

		clearNotice() {
			this.notice = { type: "", message: "" };
		},

		fieldError( errors, field ) {
			const value = errors?.[ field ];
			if ( Array.isArray( value ) ) return value.join( " " );
			if ( value && typeof value === "object" ) return value.message ?? "";
			return String( value ?? "" );
		},

		applyErrors( target, errors = {} ) {
			for ( const field of Object.keys( errors ) ) {
				target[ field ] = this.fieldError( errors, field );
			}
		},

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

		submitProfile( event ) {
			event.preventDefault();
			if ( !this.profileDirty || !this.profileValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile", "profile" );
		},

		submitPassword( event ) {
			event.preventDefault();
			if ( !this.passwordValid || this.loading ) return;
			this.submit( event.currentTarget, "/profile/password", "password" );
		},

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
