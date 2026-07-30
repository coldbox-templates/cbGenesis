/**
 * Alpine component for filtering the user management listing.
 *
 * @param {Array} users Users supplied by the server.
 * @returns {Object} Alpine user listing state and computed values.
 */
export function usersForm( payload = {}, csrfToken = "" ) {
	const initialPayload = payload && !Array.isArray( payload ) ? payload : { records: payload };

	return {
		users        : ( initialPayload.records || [] ).map( normalizeUser ),
		roles        : initialPayload.roles || [],
		total        : Number( initialPayload.count || 0 ),
		counts       : initialPayload.counts || { active: 0, pending: 0, inactive: 0, all: 0 },
		csrfToken,
		query        : "",
		statusFilter : "active",
		sortOrder    : "lastName asc",
		page         : 1,
		limit        : 25,
		loading      : false,
		submitting   : false,
		deleting     : false,
		inviteOpen   : false,
		deleteTarget : null,
		error        : "",
		notice       : "",
		form         : { firstName: "", lastName: "", email: "", roleId: "" },

		get pageCount() {
			return Math.max( 1, Math.ceil( this.total / this.limit ) );
		},

		get inviteReady() {
			return [
				this.form.firstName,
				this.form.lastName,
				this.form.email,
				this.form.roleId,
			].every( ( value ) => String( value || "" ).trim().length > 0 );
		},

		get feedbackMessage() {
			return this.error || this.notice;
		},

		get feedbackType() {
			return this.error ? "error" : "success";
		},

		clearFeedback() {
			this.error = "";
			this.notice = "";
		},

		setStatusFilter( filter ) {
			this.statusFilter = filter;
			this.page = 1;
			this.refreshUsers();
		},

		async refreshUsers() {
			if ( this.loading ) return;
			this.loading = true;
			this.error = "";
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

				const response = await fetch( `/users/search?${ params.toString() }`, { headers: { Accept: "application/json" } } );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Users could not be loaded." );
				this.users = ( result.data?.records || [] ).map( normalizeUser );
				this.total = Number( result.data?.count || 0 );
				this.counts = result.data?.counts || this.counts;
			} catch ( error ) {
				this.error = error.message || "Users could not be loaded.";
			} finally {
				this.loading = false;
			}
		},

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

		sortClass( column ) {
			return this.sortOrder.startsWith( `${ column } ` ) ? "is-active" : "";
		},

		sortIcon( column ) {
			if ( !this.sortOrder.startsWith( `${ column } ` ) ) return "ph-arrows-down-up";
			return this.sortOrder.endsWith( " desc" ) ? "ph-arrow-down" : "ph-arrow-up";
		},

		previousPage() {
			if ( this.page <= 1 ) return;
			this.page--;
			this.refreshUsers();
		},

		nextPage() {
			if ( this.page >= this.pageCount ) return;
			this.page++;
			this.refreshUsers();
		},

		openInvite() {
			this.form = { firstName: "", lastName: "", email: "", roleId: "" };
			this.error = "";
			this.inviteOpen = true;
		},

		closeInvite( force = false ) {
			if ( this.submitting && !force ) return;
			this.inviteOpen = false;
			this.error = "";
		},

		async inviteUser( event ) {
			if ( event ) event.preventDefault();
			if ( this.submitting || !this.inviteReady ) return;
			this.submitting = true;
			this.error = "";
			try {
				const body = new URLSearchParams( {
					...this.form,
					csrf     : this.csrfToken,
					password : temporaryPassword(),
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

		confirmDelete( user ) {
			this.deleteTarget = user;
			this.error = "";
		},

		cancelDelete( force = false ) {
			if ( this.deleting && !force ) return;
			this.deleteTarget = null;
			this.error = "";
		},

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

		formatDate( value ) {
			const date = new Date( value );
			return Number.isNaN( date.getTime() ) ? value : new Intl.DateTimeFormat( undefined, { dateStyle: "medium" } ).format( date );
		},
	};
}

function normalizeUser( user = {} ) {
	const name = user.fullName || [
		user.firstName,
		user.lastName
	].filter( Boolean ).join( " " ) || user.email || "Unknown user";
	const roles = ( user.roles || [] ).map( ( role ) => typeof role === "string" ? role : role.role || role.name ).filter( Boolean );
	const status = !user.isActive ? "Inactive" : user.verifiedAt ? "Active" : "Pending";
	const initials = [
		user.firstName,
		user.lastName
	].filter( Boolean ).map( ( value ) => value.charAt( 0 ) ).join( "" ).toUpperCase() || name.charAt( 0 ).toUpperCase();

	return { ...user, name, roles, status, initials, detailUrl: `/users/${ encodeURIComponent( user.userId ) }` };
}

function temporaryPassword() {
	return `Invite-${ crypto.randomUUID().replaceAll( "-", "" ).slice( 0, 20 ) }a1!`;
}

function validationMessage( errors = {} ) {
	return Object.values( errors ).flat().map( ( error ) => error.message || error ).join( " " ) || "Please check the invitation details.";
}