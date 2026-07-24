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
		submitting         : false,
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
			this.modalOpen = true;
			this.$nextTick( () => this.$root.querySelector( "#permission-name" )?.focus() );
		},

		/**
		 * Closes the create-permission modal and clears its form fields.
		 *
		 * @returns {void}
		 */
		closeModal() {
			if ( this.submitting || this.deleteSubmitting ) {
				return;
			}
			this.modalOpen = false;
			this.form.permission = "";
			this.form.description = "";
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
				const csrf = this.csrfToken;
				const response = await fetch( `/permissions/${ encodeURIComponent( this.selectedPermission.permissionId ) }`, {
					method  : "DELETE",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body    : new URLSearchParams( { csrf } ),
				} );

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