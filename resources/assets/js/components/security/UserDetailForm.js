/**
 * Reactive administration component for a single user's profile, access, preferences,
 * and security controls.
 *
 * @param {Object} payload User detail payload rendered by the server.
 * @returns {Object} Alpine state and user-management actions.
 */
export function userDetailForm( payload = {} ) {
	const initial = payload || {};
	const user = initial.user || {};
	const preferenceEntries = Object.entries( user.preferences || {} ).map(
		( [
			name,
			value
		], index ) => ( { id: `${ name }-${ index }`, name, value } )
	);

	return {
		user,
		roles                 : initial.roles || [],
		directPermissions     : initial.directPermissions || [],
		effectivePermissions  : initial.effectivePermissions || [],
		roleCatalog           : initial.roleCatalog || [],
		permissionCatalog     : initial.permissionCatalog || [],
		apiTokens             : initial.apiTokens || [],
		preferences           : preferenceEntries,
		csrfToken             : initial.csrf || "",
		activeTab             : "overview",
		loading               : "",
		preferencesSubmitting : false,
		error                 : "",
		search                : "",

		get filteredPermissions() {
			const query = this.search.trim().toLowerCase();
			return this.permissionCatalog.filter( ( permission ) => !query || String( permission.permission || "" ).toLowerCase().includes( query ) );
		},

		get availableRoles() {
			const assigned = this.roles.map( ( role ) => role.roleId );
			return this.roleCatalog.filter( ( role ) => !assigned.includes( role.roleId ) );
		},

		get availablePermissions() {
			const assigned = this.directPermissions.map( ( permission ) => permission.permissionId );
			return this.filteredPermissions.filter( ( permission ) => !assigned.includes( permission.permissionId ) );
		},

		/** @param {string} path Endpoint path. @param {string} method HTTP method. @param {Object} data Form values. @returns {Promise<Object>} Parsed response. */
		async request( path, method = "POST", data = {} ) {
			this.loading = path;
			this.error = "";
			try {
				const response = await fetch( path, { method, headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" }, body: method === "GET" ? undefined : new URLSearchParams( { ...data, csrf: this.csrfToken } ) } );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "The user could not be updated." );
				if ( result.data?.user ) this.applyPayload( result.data );
				window.$toast?.( result.messages || "User updated successfully.", "success", { title: "User updated" } );
				return result;
			} catch ( error ) {
				this.error = error.message || "The request failed.";
				window.$toast?.( this.error, "error", { title: "Update failed" } );
				throw error;
			} finally {
				this.loading = "";
			}
		},

		/** @param {Object} next Updated detail payload. @returns {void} */
		applyPayload( next ) {
			this.user = next.user || this.user;
			this.roles = next.roles || [];
			this.directPermissions = next.directPermissions || [];
			this.effectivePermissions = next.effectivePermissions || [];
			this.apiTokens = next.apiTokens || this.apiTokens;
			this.preferences = Object.entries( this.user.preferences || {} ).map(
				( [
					name,
					value
				], index ) => ( { id: `${ name }-${ index }`, name, value } )
			);
		},

		/** @param {Event} event Form submission event. @returns {Promise<void>} */
		async saveProfile( event ) {
			event.preventDefault();
			await this.request( `/users/${ encodeURIComponent( this.user.userId ) }/profile`, "PUT", { firstName: this.user.firstName, lastName: this.user.lastName, email: this.user.email, biography: this.user.biography || "" } );
		},

		/** @param {boolean} value Desired active state. @returns {Promise<void>} */
		async setStatus( value ) { await this.request( `/users/${ this.user.userId }/status`, "POST", { isActive: String( value ) } ); },
		/** @returns {Promise<void>} */
		async resetPassword() { if ( window.confirm( "Send password reset instructions to this user?" ) ) await this.request( `/users/${ this.user.userId }/reset-password` ); },
		/** @returns {Promise<void>} */
		async verifyUser() { await this.request( `/users/${ this.user.userId }/verify` ); },
		/** @returns {Promise<void>} */
		async revokeRememberTokens() { if ( window.confirm( "Revoke all remembered sessions for this user?" ) ) await this.request( `/users/${ this.user.userId }/revoke-remember-tokens` ); },
		/** @param {Object} role Role to add. @returns {Promise<void>} */
		async addRole( role ) { await this.request( `/users/${ this.user.userId }/roles/${ role.roleId }` ); },
		/** @param {Object} role Role to remove. @returns {Promise<void>} */
		async removeRole( role ) { if ( window.confirm( `Remove the ${ role.role } role?` ) ) await this.request( `/users/${ this.user.userId }/roles/${ role.roleId }`, "DELETE" ); },
		/** @param {Object} permission Permission to add. @returns {Promise<void>} */
		async addPermission( permission ) { await this.request( `/users/${ this.user.userId }/permissions/${ permission.permissionId }` ); },
		/** @param {Object} permission Permission to remove. @returns {Promise<void>} */
		async removePermission( permission ) { await this.request( `/users/${ this.user.userId }/permissions/${ permission.permissionId }`, "DELETE" ); },
		/** @param {Event} event Form submission event. @returns {Promise<void>} */
		async savePreferences( event ) {
			event.preventDefault();
			if ( this.preferencesSubmitting ) return;
			this.preferencesSubmitting = true;
			try {
				const preferences = {};
				this.preferences.forEach( ( entry ) => { if ( entry.name.trim() ) preferences[ entry.name.trim() ] = entry.value; } );
				await this.request( `/users/${ encodeURIComponent( this.user.userId ) }/preferences`, "POST", { preferences: JSON.stringify( preferences ) } );
			} finally {
				this.preferencesSubmitting = false;
			}
		},
		/** @returns {void} */
		addPreference() { this.preferences.push( { id: `new-${ Date.now() }`, name: "", value: "" } ); },
		/** @param {string} id Preference identifier. @returns {void} */
		removePreference( id ) { this.preferences = this.preferences.filter( ( entry ) => entry.id !== id ); },
		/** @param {Object} token Token to revoke. @returns {Promise<void>} */
		async revokeToken( token ) { if ( window.confirm( `Revoke ${ token.label || "this token" }?` ) ) await this.request( `/users/${ this.user.userId }/tokens/${ token.tokenId }`, "DELETE" ); },
		/** @returns {Promise<void>} */
		async revokeAllTokens() { if ( window.confirm( "Revoke every API token for this user?" ) ) await this.request( `/users/${ this.user.userId }/tokens/revoke-all` ); },
	};
}
