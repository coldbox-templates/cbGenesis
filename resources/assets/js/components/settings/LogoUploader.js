/**
 * Alpine.js component for the branding logo field on the Settings page.
 *
 * Owns the "App Logo Path" text input (manual URL entry + live preview) and
 * adds an upload/remove widget backed by the ImageService-processed asset
 * disk (see Assets.bx / Settings.bx uploadLogo()/deleteLogo()). Uploading
 * replaces the path with the streamed asset URL; removing resets it to the
 * server's default and clears the stored file.
 *
 * @param {string} initialLogoPath Current cbAppLogo setting value.
 * @param {string} csrfToken CSRF token for the upload/remove requests.
 *
 * @returns {Object} Alpine logo uploader state and handlers.
 */
export function logoUploader( initialLogoPath = "", csrfToken = "" ) {
	return {
		logoPath : initialLogoPath,
		loading  : false,
		csrfToken,

		/**
		 * Whether the current logo path points at an uploaded branding asset
		 * (rather than a manually-entered URL), so "Remove" only appears when
		 * there is something this widget can actually delete.
		 *
		 * @returns {boolean} Whether the current logo is an uploaded asset.
		 */
		get hasCustomLogo() {
			return this.logoPath.startsWith( "/branding/logo/" );
		},

		/**
		 * Reads a File as a base64 data URI.
		 *
		 * @param {File} file File selected from an <input type="file">.
		 * @returns {Promise<string>} Resolves with the file's data URI.
		 */
		readFileAsDataUrl( file ) {
			return new Promise( ( resolve, reject ) => {
				const reader = new FileReader();
				reader.onload  = () => resolve( reader.result );
				reader.onerror = () => reject( new Error( "The selected file could not be read." ) );
				reader.readAsDataURL( file );
			} );
		},

		/**
		 * Uploads the logo image picked from the hidden file input.
		 *
		 * @param {InputEvent} event File input change event.
		 * @returns {Promise<void>}
		 */
		async uploadLogo( event ) {
			const file = event.target.files?.[ 0 ];
			event.target.value = "";
			if ( !file || this.loading ) return;
			this.loading = true;
			try {
				const dataUri = await this.readFileAsDataUrl( file );
				const response = await fetch( "/settings/logo", {
					method      : "POST",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/json", Accept: "application/json" },
					body        : JSON.stringify( { logo: dataUri, csrf: this.csrfToken } ),
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) {
					throw new Error( payload.data?.logo || payload.messages || "Logo could not be saved." );
				}
				this.logoPath = payload.data?.cbAppLogo || this.logoPath;
				window.$toast?.( payload.messages || "Logo updated successfully.", "success" );
			} catch ( error ) {
				window.$toast?.( error.message || "Logo could not be saved.", "error" );
			} finally {
				this.loading = false;
			}
		},

		/**
		 * Removes the uploaded branding logo and restores the default.
		 *
		 * @returns {Promise<void>}
		 */
		async removeLogo() {
			if ( !this.hasCustomLogo || this.loading ) return;
			this.loading = true;
			try {
				const response = await fetch( "/settings/logo", {
					method      : "DELETE",
					credentials : "same-origin",
					headers     : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body        : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const payload = await response.json();
				if ( !response.ok || payload.error ) throw new Error( payload.messages || "Logo could not be removed." );
				this.logoPath = payload.data?.cbAppLogo || "";
				window.$toast?.( payload.messages || "Logo removed successfully.", "success" );
			} catch ( error ) {
				window.$toast?.( error.message || "Logo could not be removed.", "error" );
			} finally {
				this.loading = false;
			}
		},
	};
}
