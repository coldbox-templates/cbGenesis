/**
 * Alpine component for filtering the user management listing.
 *
 * @param {Array} users Users supplied by the server.
 * @returns {Object} Alpine user listing state and computed values.
 */
export function usersForm( payload = {}, csrfToken = "" ) {
	const initialPayload = payload && !Array.isArray( payload ) ? payload : { records: payload };

	return {
		users            : ( initialPayload.records || [] ).map( normalizeUser ),
		roles            : initialPayload.roles || [],
		total            : Number( initialPayload.count || 0 ),
		counts           : initialPayload.counts || { active: 0, pending: 0, inactive: 0, all: 0 },
		csrfToken,
		query            : "",
		statusFilter     : "active",
		roleFilter       : "",
		sortOrder        : "lastName asc",
		page             : 1,
		limit            : 25,
		loading          : false,
		submitting       : false,
		deleting         : false,
		resendingUserId  : null,
		inviteOpen       : false,
		deleteTarget     : null,
		statusTarget     : null,
		statusSubmitting : false,
		invitationError  : "",
		error            : "",
		notice           : "",
		form             : { firstName: "", lastName: "", email: "", roleId: "" },

		/**
		 * Calculates the number of pages in the current table result set.
		 *
		 * @returns {number} Number of pages available for the current result set.
		 */
		get pageCount() {
			return Math.max( 1, Math.ceil( this.total / this.limit ) );
		},

		/**
		 * Calculates the number of columns currently rendered by the users table.
		 *
		 * @returns {number} Visible table column count for the selected status filter.
		 */
		get visibleColumnCount() {
			return this.statusFilter === "active" || this.statusFilter === "pending" ? 5 : 6;
		},

		/**
		 * Determines whether the invitation form has all required values.
		 *
		 * @returns {boolean} Whether all required invitation fields are populated.
		 */
		get inviteReady() {
			return [
				this.form.firstName,
				this.form.lastName,
				this.form.email,
				this.form.roleId,
			].every( ( value ) => String( value || "" ).trim().length > 0 );
		},

		/**
		 * Returns the highest-priority feedback message for the page.
		 *
		 * @returns {string} Current error or success message for the page.
		 */
		get feedbackMessage() {
			return this.error || this.notice;
		},

		/**
		 * Selects the messagebox style for the current feedback state.
		 *
		 * @returns {string} Messagebox style based on the current feedback state.
		 */
		get feedbackType() {
			return this.error ? "error" : "success";
		},

		/**
		 * Clears the current page error and success messages.
		 *
		 * @returns {void}
		 */
		clearFeedback() {
			this.error = "";
			this.notice = "";
		},

		/** Closes the resend invitation error dialog. */
		closeInvitationError() {
			this.invitationError = "";
		},

		/**
		 * Selects a visibility tab and reloads its first page.
		 *
		 * @param {string} filter Visibility filter to apply.
		 */
		setStatusFilter( filter ) {
			this.statusFilter = filter;
			this.page = 1;
			this.refreshUsers();
		},

		/**
		 * Selects a role filter and reloads its first page.
		 *
		 * @param {string} roleId Role ID to filter by, or an empty string for all roles.
		 */
		setRoleFilter( roleId ) {
			this.roleFilter = roleId;
			this.page = 1;
			this.refreshUsers();
		},

		/**
		 * Loads the current page from the users search endpoint.
		 *
		 * The existing rows and result total are cleared while the request is in
		 * progress. Request failures are stored in the component error state.
		 *
		 * @returns {Promise<void>}
		 */
		async refreshUsers() {
			if ( this.loading ) return;
			this.loading = true;
			this.error = "";
			this.users = [];
			this.total = 0;
			try {
				const params = new URLSearchParams( {
					page      : String( this.page ),
					limit     : String( this.limit ),
					search    : this.query.trim(),
					sortOrder : this.sortOrder,
				} );
				const filter = this.statusFilter;
				if ( filter !== "all" ) {
					params.set( "isActive", filter === "inactive" ? "false" : "true" );
				}
				if ( filter === "active" ) params.set( "isVerified", "true" );
				if ( filter === "pending" ) params.set( "isVerified", "false" );
				if ( this.roleFilter ) params.set( "roleId", this.roleFilter );

				const response = await fetch( `/users/search?${ params.toString() }`, { headers: { Accept: "application/json" } } );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Users could not be loaded." );
				this.users = ( result.data?.records || [] ).map( normalizeUser );
				this.total = Number( result.data?.count || 0 );
			} catch ( error ) {
				this.error = error.message || "Users could not be loaded.";
			} finally {
				this.loading = false;
			}
		},

		/**
		 * Changes the active sort column and reloads the first page.
		 *
		 * @param {string} column User field to sort by.
		 */
		sortBy( column ) {
			const [
				currentColumn,
				currentDirection
			] = this.sortOrder.split( " " );
			const direction = currentColumn === column && currentDirection === "asc" ? "desc" : "asc";
			this.sortOrder = `${ column } ${ direction }`;
			this.page = 1;
			this.refreshUsers();
		},

		/**
		 * Moves to the previous page and reloads the listing when one is available.
		 *
		 * @returns {void}
		 */
		previousPage() {
			if ( this.page <= 1 ) return;
			this.page--;
			this.refreshUsers();
		},

		/**
		 * Moves to the next page and reloads the listing when one is available.
		 *
		 * @returns {void}
		 */
		nextPage() {
			if ( this.page >= this.pageCount ) return;
			this.page++;
			this.refreshUsers();
		},

		/**
		 * Opens the invitation drawer with a cleared invitation form and errors.
		 *
		 * @returns {void}
		 */
		openInvite() {
			this.form = { firstName: "", lastName: "", email: "", roleId: "" };
			this.error = "";
			this.inviteOpen = true;
		},

		/**
		 * Closes the invitation drawer unless a submission is in progress.
		 *
		 * @param {boolean} force Whether to close during submission.
		 */
		closeInvite( force = false ) {
			if ( this.submitting && !force ) return;
			this.inviteOpen = false;
			this.error = "";
		},

		/**
		 * Submits a new-user invitation and refreshes the listing on success.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {Promise<void>}
		 */
		async inviteUser( event ) {
			if ( event ) event.preventDefault();
			if ( this.submitting || !this.inviteReady ) return;
			this.submitting = true;
			this.error = "";
			try {
				const body = new URLSearchParams( {
					...this.form,
					csrf : this.csrfToken,
				} );
				const response = await fetch( "/users", {
					method  : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body,
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( response.status === 422 ? validationMessage( result.data ) : result.messages || "User could not be invited." );
				this.closeInvite( true );
				this.notice = "Invitation sent successfully.";
				await this.refreshUsers();
			} catch ( error ) {
				this.error = error.message || "User could not be invited.";
			} finally {
				this.submitting = false;
			}
		},

		/**
		 * Re-sends an invitation and refreshes the listing when complete.
		 *
		 * @param {Object} user Unverified user whose invitation should be replaced.
		 * @returns {Promise<void>}
		 */
		async resendInvitation( user ) {
			if ( !user?.canResendInvitation || this.resendingUserId ) return;
			this.resendingUserId = user.userId;
			this.error = "";
			window.$progress?.start( { message: "Resending invitation..." } );
			try {
				const response = await fetch( `/users/${ encodeURIComponent( user.userId ) }/invitation`, {
					method  : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Invitation could not be sent." );
				this.notice = "Invitation sent successfully.";
				window.$toast?.( this.notice, "success", { title: "Invitation sent" } );
				await this.refreshUsers();
			} catch ( error ) {
				this.error = error.message || "Invitation could not be sent.";
				this.invitationError = this.error;
				window.$toast?.( this.error, "error", { title: "Invitation failed" } );
			} finally {
				this.resendingUserId = null;
				window.$progress?.stop();
			}
		},

		/**
		 * Opens the confirmation dialog for changing a user's active state.
		 *
		 * @param {Object} user User whose active state will change.
		 * @param {boolean} isActive Active state to save.
		 * @returns {void}
		 */
		confirmStatusChange( user, isActive ) {
			this.statusTarget = { user, isActive };
			this.error = "";
		},

		/**
		 * Closes the active-state confirmation dialog unless a request is running.
		 *
		 * @param {boolean} force Whether to close while submitting.
		 * @returns {void}
		 */
		cancelStatusChange( force = false ) {
			if ( this.statusSubmitting && !force ) return;
			this.statusTarget = null;
			this.error = "";
		},

		/**
		 * Saves only the requested active state and refreshes the current listing.
		 *
		 * @returns {Promise<void>}
		 */
		async saveStatusChange() {
			if ( !this.statusTarget || this.statusSubmitting ) return;
			const { user, isActive } = this.statusTarget;
			this.statusSubmitting = true;
			this.error = "";
			window.$progress?.start( { message: isActive ? "Enabling user..." : "Disabling user..." } );
			try {
				const response = await fetch( `/users/${ encodeURIComponent( user.userId ) }`, {
					method  : "PUT",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { isActive: String( isActive ), csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "User status could not be changed." );
				this.cancelStatusChange( true );
				this.notice = isActive ? "User enabled successfully." : "User disabled successfully.";
				window.$toast?.( this.notice, "success", { title: isActive ? "User enabled" : "User disabled" } );
				await this.refreshUsers();
			} catch ( error ) {
				this.error = error.message || "User status could not be changed.";
				window.$toast?.( this.error, "error", { title: "User status update failed" } );
			} finally {
				this.statusSubmitting = false;
				window.$progress?.stop();
			}
		},

		/**
		 * Selects a user and opens the delete confirmation dialog.
		 *
		 * @param {Object} user User record selected for deletion.
		 * @returns {void}
		 */
		confirmDelete( user ) {
			this.deleteTarget = user;
			this.error = "";
		},

		/**
		 * Closes the delete confirmation unless deletion is in progress.
		 *
		 * @param {boolean} force Whether to close during deletion.
		 */
		cancelDelete( force = false ) {
			if ( this.deleting && !force ) return;
			this.deleteTarget = null;
			this.error = "";
		},

		/**
		 * Deletes the selected user and refreshes the current listing.
		 *
		 * The request is skipped when no user is selected or another deletion is
		 * active. Server and network failures are stored in the component error
		 * state rather than thrown to the caller.
		 *
		 * @returns {Promise<void>}
		 */
		async deleteUser() {
			if ( !this.deleteTarget || this.deleting ) return;
			this.deleting = true;
			this.error = "";
			try {
				const response = await fetch( `/users/${ encodeURIComponent( this.deleteTarget.userId ) }`, {
					method  : "DELETE",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "User could not be deleted." );
				this.cancelDelete( true );
				if ( this.page > 1 && this.users.length === 1 ) this.page--;
				this.notice = "User deleted successfully.";
				await this.refreshUsers();
			} catch ( error ) {
				this.error = error.message || "User could not be deleted.";
			} finally {
				this.deleting = false;
			}
		},

	};
}

/**
 * Normalizes server user data for display in the listing.
 *
 * @param {Object} user User data returned by the server.
 * @returns {Object} User with derived display fields.
 */
function normalizeUser( user = {} ) {
	const name = user.fullName || [
		user.firstName,
		user.lastName
	].filter( Boolean ).join( " " ) || user.email || "Unknown user";
	const roles = ( user.roles || [] ).map( ( role ) => typeof role === "string" ? role : role.role || role.name ).filter( Boolean );
	const status = !user.isActive ? "Inactive" : user.verifiedAt ? "Active" : "Pending";
	const invitationStatus = user.verifiedAt
		? "Accepted"
		: user.invitationStatus || "Not invited";
	const invitationStatusClass = invitationStatus.toLowerCase().replaceAll( " ", "-" );
	const initials = [
		user.firstName,
		user.lastName
	].filter( Boolean ).map( ( value ) => value.charAt( 0 ) ).join( "" ).toUpperCase() || name.charAt( 0 ).toUpperCase();

	return { ...user, name, roles, status, invitationStatus, invitationStatusClass, initials, detailUrl: `/users/${ encodeURIComponent( user.userId ) }` };
}

/**
 * Converts server validation errors into a displayable message.
 *
 * @param {Object} errors Validation error map returned by the server.
 * @returns {string} Human-readable validation message.
 */
function validationMessage( errors = {} ) {
	return Object.values( errors ).flat().map( ( error ) => error.message || error ).join( " " ) || "Please check the invitation details.";
}