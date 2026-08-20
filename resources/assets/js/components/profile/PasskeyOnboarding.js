/**
 * Alpine component for mandatory passkey enrollment.
 *
 * @param {string} csrfToken CSRF token used to save passkey metadata.
 * @returns {Object} Enrollment state and ceremony handler.
 */
export function passkeyOnboarding( csrfToken = "" ) {
	return {
		csrfToken,
		label   : "",
		loading : false,
		notice  : { type: "", message: "" },

		/** Registers one passkey and gives it the user's chosen label. */
		async register() {
			if ( this.loading || !this.label.trim() ) return;
			this.loading = true;
			this.notice = { type: "", message: "" };
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
				if ( !response.ok ) throw new Error( "Passkey could not be registered." );
				const metadataResponse = await fetch( "/profile/passkeys", {
					method      : "POST",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/json", Accept: "application/json" },
					body        : JSON.stringify( { credentialId: credential.id, label: this.label.trim(), csrf: this.csrfToken } ),
				} );
				if ( !metadataResponse.ok ) throw new Error( "Passkey label could not be saved." );
				window.location = "/dashboard";
			} catch ( error ) {
				this.notice = {
					type    : "error",
					message : error.name === "NotAllowedError" ? "Passkey registration was cancelled." : ( error.message || "Passkey registration failed." ),
				};
			} finally {
				this.loading = false;
			}
		},
	};
}
