/**
 * Alpine component for filtering, editing, and deleting roles.
 *
 * Maintains the local role catalog while role metadata and permissions are
 * persisted through the remote Roles handler actions.
 *
 * @param {Array} roles Roles supplied by the server.
 * @param {Array} permissions Active permissions supplied by the server.
 * @param {string} csrfToken CSRF token for form submissions.
 * @returns {Object} Alpine role form state, computed values, and actions.
 */
export function roleForm( roles = [], permissions = [], csrfToken = "" ) {
	return {
		roles,
		permissions,
		csrfToken,
		query             : "",
		selectedRole      : null,
		drawerOpen        : false,
		confirmDeleteOpen : false,
		submitting        : false,
		deleting          : false,
		error             : "",
		form              : {
			role          : "",
			description   : "",
			permissionIds : [],
		},

		/**
		 * Returns roles matching the current search query.
		 *
		 * @returns {Array} Roles matching by name or description.
		 */
		get filteredRoles() {
			const query = this.query.trim().toLowerCase();
			if ( !query ) return this.roles;
			return this.roles.filter( ( role ) => [
				role.role,
				role.description
			].some( ( value ) =>
				String( value || "" ).toLowerCase().includes( query )
			) );
		},

		/**
		 * Groups active permissions by their prefix and sorts the groups by label.
		 *
		 * @returns {Array} Permission groups containing a key, label, and permissions list.
		 */
		get groups() {
			const grouped = {};
			this.permissions.forEach( ( permission ) => {
				const key = permission.prefix || "general";
				if ( !grouped[ key ] ) grouped[ key ] = { key, label: key === "general" ? "General" : key, permissions: [] };
				grouped[ key ].permissions.push( permission );
			} );
			return Object.values( grouped ).sort( ( first, second ) => first.label.localeCompare( second.label ) );
		},

		/**
		 * Returns the number of roles visible after filtering.
		 *
		 * @returns {number} Number of filtered roles.
		 */
		get filteredCount() {
			return this.filteredRoles.length;
		},

		/**
		 * Opens the role drawer with an empty create form.
		 *
		 * @returns {void}
		 */
		openCreate() {
			this.selectedRole = null;
			this.form = { role: "", description: "", permissionIds: [] };
			this.error = "";
			this.drawerOpen = true;
		},

		/**
		 * Selects a role for the summary panel without opening the editor drawer.
		 *
		 * @param {Object} role Role selected from the role catalog.
		 * @returns {void}
		 */
		selectRole( role ) {
			this.selectedRole = role;
		},

		/**
		 * Opens the role drawer with an existing role loaded for editing.
		 *
		 * @param {Object} role Role selected for editing.
		 * @returns {void}
		 */
		openEdit( role ) {
			this.selectedRole = role;
			this.form = {
				role          : role.role || "",
				description   : role.description || "",
				permissionIds : ( role.permissions || [] ).map( ( permission ) => permission.permissionId ),
			};
			this.error = "";
			this.drawerOpen = true;
		},

		/**
		 * Closes the role drawer unless a save request is in progress.
		 *
		 * @param {boolean} force If true, forces the drawer to close.
		 * @returns {void}
		 */
		closeDrawer( force = false ) {
			if ( this.submitting && !force ) return;
			this.drawerOpen = false;
			this.error = "";
		},

		/**
		 * Checks whether a permission is selected in the role form.
		 *
		 * @param {string} permissionId Permission identifier to check.
		 * @returns {boolean} Whether the permission is selected.
		 */
		hasPermission( permissionId ) {
			return this.form.permissionIds.includes( permissionId );
		},

		/**
		 * Adds or removes a permission from the role form selection.
		 *
		 * @param {string} permissionId Permission identifier to toggle.
		 * @returns {void}
		 */
		togglePermission( permissionId ) {
			if ( this.hasPermission( permissionId ) ) {
				this.form.permissionIds = this.form.permissionIds.filter( ( id ) => id !== permissionId );
			} else {
				this.form.permissionIds.push( permissionId );
			}
		},

		/**
		 * Creates or updates the selected role through the remote handler action.
		 *
		 * @param {SubmitEvent} event Role form submit event.
		 * @returns {Promise<void>}
		 */
		async saveRole( event ) {
			event.preventDefault();
			if ( this.submitting ) return;
			this.submitting = true;
			this.error = "";
			const body = new URLSearchParams( {
				csrf        : this.csrfToken,
				role        : this.form.role,
				description : this.form.description,
			} );
			this.form.permissionIds.forEach( ( permissionId ) => body.append( "permissionIds[]", permissionId ) );

			try {
				const endpoint = this.selectedRole ? `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }` : "/roles";
				const response = await fetch( endpoint, {
					method  : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body,
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Role could not be saved." );
				if ( this.selectedRole ) {
					this.roles = this.roles.map( ( role ) => role.roleId === result.data.roleId ? result.data : role );
				} else {
					this.roles = [
						...this.roles,
						result.data
					].sort( ( first, second ) => first.role.localeCompare( second.role ) );
				}
				this.closeDrawer( true );
			} catch ( error ) {
				this.error = error.message || "Role could not be saved.";
			} finally {
				this.submitting = false;
			}
		},

		/**
		 * Opens the delete confirmation dialog for a role.
		 *
		 * @param {Object} role Role selected for deletion.
		 * @returns {void}
		 */
		confirmDelete( role ) {
			this.selectedRole = role;
			this.confirmDeleteOpen = true;
			this.error = "";
		},

		/**
		 * Closes the delete confirmation dialog unless a request is in progress.
		 *
		 * @param {boolean} force If true, forces the dialog to close even if a request is in progress.
		 * @returns {void}
		 */
		cancelDelete( force = false ) {
			if ( this.deleting && !force ) return;
			this.confirmDeleteOpen = false;
			this.error = "";
		},

		/**
		 * Deletes the selected role after confirmation and removes it locally.
		 *
		 * @returns {Promise<void>}
		 */
		async deleteRole() {
			if ( !this.selectedRole || this.deleting ) return;
			this.deleting = true;
			try {
				const response = await fetch( `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }`, {
					method  : "DELETE",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Role could not be deleted." );
				this.roles = this.roles.filter( ( role ) => role.roleId !== this.selectedRole.roleId );
				this.selectedRole = null;
				this.cancelDelete( true );
				this.closeDrawer( true );
			} catch ( error ) {
				this.error = error.message || "Role could not be deleted.";
			} finally {
				this.deleting = false;
			}
		},
	};
}
