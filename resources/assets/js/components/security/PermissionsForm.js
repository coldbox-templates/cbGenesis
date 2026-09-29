/**
 * Alpine component for filtering and grouping the permission catalog.
 *
 * @param {Array} permissions Permissions supplied by the server.
 * @param {string} csrfToken CSRF token for form submissions.
 *
 * @returns {Object} Alpine component state and derived groups.
 */
export function permissionsForm( permissions = [], csrfToken = "" ) {
	return {
		permissions        ,
		query              : "",
		modalOpen          : false,
		editingPermission  : null,
		submitting         : false,
		formError          : "",
		confirmModalOpen   : false,
		selectedPermission : null,
		deleteSubmitting   : false,
		deleteError        : "",
		form               : {
			permission  : "",
			description : "",
		},
		csrfToken : csrfToken,

		/**
		 * Returns permissions matching the current search query.
		 *
		 * @returns {Array} Permissions matching the query across their key, description, prefix, or slug.
		 */
		get filteredPermissions() {
			const query = this.query.trim().toLowerCase();

			if ( !query ) {
				return this.permissions;
			}

			return this.permissions.filter( ( permission ) => [
				permission.permission,
				permission.description,
				permission.prefix,
				permission.slug,
			].some( ( value ) => String( value || "" ).toLowerCase().includes( query ) ) );
		},

		/**
		 * Returns the number of permissions matching the current search query.
		 *
		 * @returns {number} Number of filtered permissions.
		 */
		get filteredCount() {
			return this.filteredPermissions.length;
		},

		/**
		 * Groups filtered permissions by their prefix and sorts the groups by label.
		 *
		 * @returns {Array} Permission groups containing a key, label, and permissions list.
		 */
		get groups() {
			const grouped = {};

			this.filteredPermissions.forEach( ( permission ) => {
				const key = permission.prefix || "general";
				if ( !grouped[ key ] ) {
					grouped[ key ] = {
						key,
						label       : key === "general" ? "General" : key,
						permissions : [],
					};
				}
				grouped[ key ].permissions.push( permission );
			} );

			return Object.values( grouped ).sort( ( first, second ) => first.label.localeCompare( second.label ) );
		},

		/**
		 * Opens the create-permission modal and focuses its permission field.
		 *
		 * @returns {void}
		 */
		openModal() {
			this.editingPermission = null;
			this.formError = "";
			this.modalOpen = true;
			this.$focus( "#permission-name" );
		},

		/**
		 * Opens the permission modal with an existing permission loaded for editing.
		 *
		 * @param {Object} permission Permission selected for editing.
		 * @returns {void}
		 */
		openEditModal( permission ) {
			this.editingPermission = permission;
			this.formError = "";
			this.form.permission = permission.permission || "";
			this.form.description = permission.description || "";
			this.modalOpen = true;
			this.$focus( "#permission-name" );
		},

		/**
		 * Closes the create-permission modal and clears its form fields.
		 *
		 * @returns {void}
		 */
		closeModal( force = false ) {
			if ( ( this.submitting || this.deleteSubmitting ) && !force ) {
				return;
			}
			this.modalOpen = false;
			this.editingPermission = null;
			this.formError = "";
			this.form.permission = "";
			this.form.description = "";
		},

		/**
		 * Sends a mutation request carrying the page's CSRF token, recovering once from a stale token.
		 *
		 * The token is embedded when the page renders, but the server can invalidate it while the
		 * page sits open: tokens expire a fixed time after they were created (not after this page
		 * loaded), and any page that renders csrfField() force-rotates the session's token. When
		 * the server rejects the request with a 403, this fetches the session's current token from
		 * the cbcsrf endpoint and replays the request once, so the user's input is never lost to
		 * an expired token. A second 403 (e.g. a genuine authorization failure) is returned as-is.
		 *
		 * @param {string} url Endpoint to send the request to.
		 * @param {string} method HTTP method to use.
		 * @param {Object} [fields={}] Form fields to send urlencoded; `csrf` is added automatically.
		 * @returns {Promise<Response>} The final fetch response.
		 */
		async fetchWithCsrf( url, method, fields = {} ) {
			const send = () => fetch( url, {
				method,
				headers : { "Content-Type": "application/x-www-form-urlencoded" },
				body    : new URLSearchParams( { ...fields, csrf: this.csrfToken } ),
			} );

			const response = await send();
			if ( response.status !== 403 || !( await this.refreshCsrfToken() ) ) {
				return response;
			}
			return send();
		},

		/**
		 * Replaces the component's CSRF token with the session's current one.
		 *
		 * Side effect: updates `csrfToken`, which also refreshes the form's hidden `csrf` field.
		 *
		 * @returns {Promise<boolean>} True when a new token was obtained; false if the endpoint was
		 * unavailable (e.g. the session itself expired and the request was redirected to login).
		 */
		async refreshCsrfToken() {
			try {
				const response = await fetch( "/cbcsrf/generate", { headers: { Accept: "text/plain" } } );
				const token = ( await response.text() ).trim();
				// A redirect to the login page yields HTML, never a bare alphanumeric token.
				if ( !response.ok || response.redirected || !/^[A-Za-z0-9]+$/.test( token ) || token === this.csrfToken ) {
					return false;
				}
				this.csrfToken = token;
				return true;
			} catch ( error ) {
				return false;
			}
		},

		/**
		 * Creates a permission through the remote handler action.
		 *
		 * Submitting via fetch (rather than a native form post) keeps the modal and its values in
		 * place when the request fails, so the user can correct or retry without retyping.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {Promise<void>}
		 */
		async createPermission( event ) {
			event.preventDefault();
			if ( this.editingPermission || this.submitting ) {
				return;
			}

			this.submitting = true;
			this.formError = "";

			try {
				const response = await this.fetchWithCsrf( "/permissions", "POST", {
					permission  : this.form.permission,
					description : this.form.description,
				} );
				const result = await response.json().catch( () => ( {} ) );

				if ( !response.ok || result.error ) {
					throw new Error( [].concat( result.messages || "Permission could not be saved." ).join( " " ) );
				}

				this.permissions = [
					...this.permissions,
					result.data,
				];
				window.$toast?.( "Permission created successfully.", "success", { title: "Permission created" } );
				this.closeModal( true );
			} catch ( error ) {
				// Leave the modal open with the user's input intact so they can retry.
				this.formError = error.message || "Permission could not be saved.";
			} finally {
				this.submitting = false;
			}
		},

		/**
		 * Updates the selected permission through the remote handler action.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {Promise<void>}
		 */
		async updatePermission( event ) {
			event.preventDefault();
			if ( !this.editingPermission || this.submitting ) {
				return;
			}

			this.submitting = true;
			this.formError = "";

			try {
				const response = await this.fetchWithCsrf( `/permissions/${ encodeURIComponent( this.editingPermission.permissionId ) }`, "POST", {
					permission  : this.form.permission,
					description : this.form.description,
				} );
				const result = await response.json().catch( () => ( {} ) );

				if ( !response.ok || result.error ) {
					throw new Error( [].concat( result.messages || "Permission could not be saved." ).join( " " ) );
				}

				this.permissions = this.permissions.map( ( permission ) =>
					permission.permissionId === result.data.permissionId ? result.data : permission
				);
				this.closeModal( true );
			} catch ( error ) {
				this.formError = error.message || "Permission could not be saved.";
			} finally {
				this.submitting = false;
			}
		},

		/**
		 * Opens the delete confirmation dialog for a permission.
		 *
		 * @param {Object} permission Permission selected for deletion.
		 * @returns {void}
		 */
		confirmDelete( permission ) {
			this.selectedPermission = permission;
			this.deleteError = "";
			this.confirmModalOpen = true;
		},

		/**
		 * Closes the delete confirmation dialog unless a request is in progress.
		 *
		 * @param {boolean} force If true, forces the dialog to close even if a request is in progress.
		 *
		 * @returns {void}
		 */
		cancelDelete( force = false ) {
			if ( this.deleteSubmitting && !force ) {
				return;
			}
			this.confirmModalOpen = false;
			this.selectedPermission = null;
			this.deleteError = "";
		},

		/**
		 * Deletes the selected permission after confirmation.
		 *
		 * @returns {Promise<void>}
		 */
		async deletePermission() {
			// Prevent deletion if no permission is selected or if a request is already in progress.
			if ( !this.selectedPermission || this.deleteSubmitting ) {
				return;
			}

			// Set the submitting state and clear any previous error messages.
			this.deleteSubmitting = true;
			this.deleteError = "";

			try {
				// Submit to DELETE resource
				const response = await this.fetchWithCsrf( `/permissions/${ encodeURIComponent( this.selectedPermission.permissionId ) }`, "DELETE" );

				// Handle non-OK responses by attempting to parse the error message from the server.
				if ( !response.ok ) {
					let errorMessage = "Permission could not be deleted.";

					try {
						const errorResponse = await response.json();
						const messages = errorResponse.messages;
						if ( messages ) {
							errorMessage = JSON.stringify( messages );
						}
					} catch ( parseError ) {
						// Keep the default message when the server response is not JSON.
					}

					throw new Error( errorMessage );
				}

				// Remove the deleted permission from the local list and close the confirmation dialog.
				this.permissions = this.permissions.filter( ( permission ) => permission.permissionId !== this.selectedPermission.permissionId );
				this.cancelDelete( true );
			} catch ( error ) {
				this.deleteError = error.message || "Permission could not be deleted.";
			} finally {
				this.deleteSubmitting = false;
			}
		},
	};
}