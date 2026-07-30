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
export function rolesForm( roles = [], permissions = [], csrfToken = "" ) {
	return {
		roles,
		permissions,
		csrfToken,
		query             : "",
		userQuery         : "",
		selectedRole      : null,
		assignedUsers     : [],
		availableUsers    : [],
		selectedUsers     : [],
		loadingUsers      : false,
		loadingAvailable  : false,
		removingUserId    : null,
		assigningUsers    : false,
		drawerOpen        : false,
		assignModalOpen   : false,
		confirmDeleteOpen : false,
		submitting        : false,
		deleting          : false,
		error             : "",
		usersError        : "",
		assignError       : "",
		assignmentQuery   : "",
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
		 * Groups active permissions by their prefix and sorts the permission groups by label.
		 *
		 * @returns {Array} Permission groups containing a key, label, and permissions list.
		 */
		get permissionGroups() {
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
		 * Returns users matching the current name or email filter.
		 *
		 * @returns {Array} Assigned users matching the query.
		 */
		get filteredUsers() {
			const query = this.userQuery.trim().toLowerCase();
			if ( !query ) return this.assignedUsers;
			return this.assignedUsers.filter( ( user ) => [
				user.fullName,
				user.email,
			].some( ( value ) => String( value || "" ).toLowerCase().includes( query ) ) );
		},

		/**
		 * Returns available users that have not already been selected.
		 *
		 * @returns {Array} Users available for selection.
		 */
		get selectableUsers() {
			const selectedIds = this.selectedUsers.map( ( user ) => user.userId );
			return this.availableUsers.filter( ( user ) => !selectedIds.includes( user.userId ) );
		},

		/**
		 * Returns the display name for a user result.
		 *
		 * @param {Object} user User result.
		 * @returns {string} User's full name or email.
		 */
		userName( user ) {
			const name = [
				user.firstName,
				user.lastName
			].filter( Boolean ).join( " " );
			return name || user.email || "Unnamed user";
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
		async selectRole( role ) {
			this.selectedRole = role;
			this.userQuery = "";
			this.assignedUsers = [];
			this.usersError = "";
			await this.loadRoleUsers( role );
		},

		/**
		 * Opens the assignment modal with an empty search and selection.
		 *
		 * @returns {void}
		 */
		openAssignUsers() {
			if ( !this.selectedRole ) return;
			this.assignmentQuery = "";
			this.availableUsers = [];
			this.selectedUsers = [];
			this.assignError = "";
			this.assignModalOpen = true;
		},

		/**
		 * Closes the assignment modal unless assignments are being saved.
		 *
		 * @param {boolean} force Whether to close during an active submission.
		 * @returns {void}
		 */
		closeAssignUsers( force = false ) {
			if ( this.assigningUsers && !force ) return;
			this.assignModalOpen = false;
			this.assignmentQuery = "";
			this.availableUsers = [];
			this.selectedUsers = [];
			this.assignError = "";
		},

		/**
		 * Searches active, verified users who are not assigned to the selected role.
		 *
		 * @returns {Promise<void>}
		 */
		async searchAvailableUsers() {
			if ( !this.assignModalOpen || !this.selectedRole ) return;
			const search = this.assignmentQuery.trim();
			if ( search.length < 2 ) {
				this.availableUsers = [];
				return;
			}
			this.loadingAvailable = true;
			this.assignError = "";
			try {
				const params = new URLSearchParams( { search, max: "10" } );
				const response = await fetch( `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }/available-users?${ params.toString() }`, { headers: { Accept: "application/json" }, } );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Users could not be loaded." );
				if ( this.assignModalOpen && this.selectedRole && this.assignmentQuery.trim() === search ) {
					this.availableUsers = result.data || [];
				}
			} catch ( error ) {
				this.assignError = error.message || "Users could not be loaded.";
			} finally {
				this.loadingAvailable = false;
			}
		},

		/**
		 * Adds a user to the pending assignment selection.
		 *
		 * @param {Object} user User to select.
		 * @returns {void}
		 */
		selectUserForAssignment( user ) {
			if ( this.selectedUsers.some( ( selectedUser ) => selectedUser.userId === user.userId ) ) return;
			this.selectedUsers = [
				...this.selectedUsers,
				user
			];
			this.assignmentQuery = "";
			this.availableUsers = [];
		},

		/**
		 * Removes a user from the pending assignment selection.
		 *
		 * @param {Object} user User to remove.
		 * @returns {void}
		 */
		removeUserFromAssignment( user ) {
			this.selectedUsers = this.selectedUsers.filter( ( selectedUser ) => selectedUser.userId !== user.userId );
		},

		/**
		 * Assigns each selected user to the current role and refreshes the list.
		 * Successful users are removed from the pending selection if any request fails.
		 *
		 * @returns {Promise<void>}
		 */
		async assignSelectedUsers( event ) {
			event.preventDefault();
			if ( !this.selectedRole || !this.selectedUsers.length || this.assigningUsers ) return;
			this.assigningUsers = true;
			this.assignError = "";
			const selectedUsers = [ ...this.selectedUsers ];
			const results = await Promise.allSettled( selectedUsers.map( async( user ) => {
				const response = await fetch( `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }/users/${ encodeURIComponent( user.userId ) }`, {
					method  : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || `Could not assign ${ this.userName( user ) }.` );
				return user;
			} ) );
			const failedUsers = results
				.map( ( result, index ) => result.status === "rejected" ? {
					user  : selectedUsers[ index ],
					error : result.reason,
				} : null )
				.filter( Boolean );
			try {
				await this.loadRoleUsers( this.selectedRole );
				const assignedCount = selectedUsers.length - failedUsers.length;
				this.selectedUsers = failedUsers.map( ( failedUser ) => failedUser.user );
				if ( failedUsers.length ) {
					this.assignError = `${ assignedCount } user${ assignedCount === 1 ? "" : "s" } assigned. ${ failedUsers.map( ( failedUser ) => failedUser.error?.message || "Assignment failed." ).join( " " ) }`;
				} else {
					this.closeAssignUsers( true );
				}
			} catch ( error ) {
				this.assignError = error.message || "Users could not be refreshed.";
			} finally {
				this.assigningUsers = false;
			}
		},

		/**
		 * Loads users assigned to a role through the remote handler action.
		 *
		 * @param {Object} role Role whose users should be loaded.
		 * @returns {Promise<void>}
		 */
		async loadRoleUsers( role ) {
			this.loadingUsers = true;
			try {
				const response = await fetch( `/roles/${ encodeURIComponent( role.roleId ) }/users` );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Users could not be loaded." );
				if ( this.selectedRole?.roleId === role.roleId ) {
					this.assignedUsers = result.data || [];
					this.selectedRole.usersCount = this.assignedUsers.length;
					this.roles = this.roles.map( ( currentRole ) => currentRole.roleId === role.roleId ? this.selectedRole : currentRole );
				}
			} catch ( error ) {
				if ( this.selectedRole?.roleId === role.roleId ) this.usersError = error.message || "Users could not be loaded.";
			} finally {
				if ( this.selectedRole?.roleId === role.roleId ) this.loadingUsers = false;
			}
		},

		/**
		 * Removes a user from the selected role after confirmation.
		 *
		 * @param {Object} user User to remove from the selected role.
		 * @returns {Promise<void>}
		 */
		async removeUser( user ) {
			if ( !this.selectedRole || this.removingUserId ) return;
			const name = user.fullName || user.email;
			if ( !window.confirm( `Remove ${ name } from ${ this.selectedRole.role }?` ) ) return;

			this.removingUserId = user.userId;
			this.usersError = "";
			try {
				const response = await fetch( `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }/users/${ encodeURIComponent( user.userId ) }`, {
					method  : "DELETE",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "User could not be removed from the role." );
				this.assignedUsers = this.assignedUsers.filter( ( assignedUser ) => assignedUser.userId !== user.userId );
				this.selectedRole.usersCount = Math.max( 0, Number( this.selectedRole.usersCount || 0 ) - 1 );
				this.roles = this.roles.map( ( role ) => role.roleId === this.selectedRole.roleId ? this.selectedRole : role );
			} catch ( error ) {
				this.usersError = error.message || "User could not be removed from the role.";
			} finally {
				this.removingUserId = null;
			}
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
		 * Toggles all permissions in a group while preserving other selections.
		 *
		 * @param {Object} group Permission group to select.
		 * @returns {void}
		 */
		togglePermissionGroup( group ) {
			const groupPermissionIds = group.permissions.map( ( permission ) => permission.permissionId );
			const allPermissionsSelected = groupPermissionIds.every( ( permissionId ) => this.hasPermission( permissionId ) );
			if ( allPermissionsSelected ) {
				this.form.permissionIds = this.form.permissionIds.filter( ( permissionId ) => !groupPermissionIds.includes( permissionId ) );
				return;
			}
			this.form.permissionIds = [
				...new Set( [
					...this.form.permissionIds,
					...groupPermissionIds,
				] )
			];
		},

		/**
		 * Creates or updates the selected role through the remote handler action.
		 *
		 * @param {SubmitEvent} event Role form submit event.
		 * @returns {Promise<void>}
		 */
		async saveRole( event ) {

			// Prep Submission
			event.preventDefault();
			if ( this.submitting ) return;
			this.submitting = true;
			this.error = "";

			// Prepare the submissions
			const body = new URLSearchParams( {
				csrf        : this.csrfToken,
				role        : this.form.role,
				description : this.form.description,
			} );
			this.form.permissionIds.forEach( ( permissionId ) => body.append( "permissions[]", permissionId ) );

			try {
				// POST => /roles = Create
				// PUT => /roles/{roleId} = Update
				const endpoint = this.selectedRole ? `/roles/${ encodeURIComponent( this.selectedRole.roleId ) }` : "/roles";
				const response = await fetch( endpoint, {
					method  : this.selectedRole ? "PUT" : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded" },
					body,
				} );
				const result = await response.json();
				// Test response
				if ( !response.ok || result.error ) throw new Error( result.messages || "Role could not be saved." );
				// If updating an existing role, replace it in the local catalog. If creating a new role, add it to the catalog and sort by name.
				if ( this.selectedRole ) {
					this.roles = this.roles.map( ( role ) => role.roleId === result.data.roleId ? result.data : role );
					this.selectedRole = result.data;
				}
				// If creating a new role, add it to the catalog and sort by name.
				else {
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
