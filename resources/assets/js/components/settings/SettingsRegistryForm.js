/**
 * Alpine component for managing database-backed application settings.
 *
 * @param {Object} payload Initial registry response payload.
 * @param {string} csrfToken CSRF token used by mutation requests.
 * @returns {Object} Registry state and actions.
 */
export function settingsRegistryForm( payload = {}, csrfToken = "" ) {
	return {
		records      : payload.records || [],
		counts       : payload.counts || { active: 0, inactive: 0, all: 0 },
		total        : Number( payload.count || 0 ),
		csrfToken,
		query        : "",
		statusFilter : "active",
		sortOrder    : "name asc",
		page         : 1,
		limit        : 25,
		loading      : false,
		submitting   : false,
		deleting     : false,
		drawerOpen   : false,
		deleteOpen   : false,
		statusOpen   : false,
		editing      : null,
		deleteTarget : null,
		statusTarget : null,
		form         : { name: "", value: "", isActive: true },

		/** Returns the number of pages available for the current result set. */
		get pageCount() {
			return Math.max( 1, Math.ceil( this.total / this.limit ) );
		},

		/** Loads the current filtered registry page. */
		async refresh() {
			if ( this.loading ) return;
			this.loading = true;
			try {
				const params = new URLSearchParams( { page: String( this.page ), limit: String( this.limit ), search: this.query.trim(), sortOrder: this.sortOrder, } );
				if ( this.statusFilter !== "all" ) params.set( "isActive", this.statusFilter === "active" ? "true" : "false" );
				const response = await fetch( `/settings/registry/search?${ params }`, { headers: { Accept: "application/json" } } );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Settings could not be loaded." );
				this.records = result.data?.records || [];
				this.total = Number( result.data?.count || 0 );
				this.counts = result.data?.counts || this.counts;
			} catch ( error ) {
				window.$toast?.( error.message || "Settings could not be loaded.", "error", { title: "Loading failed" } );
			} finally {
				this.loading = false;
			}
		},

		/** Changes the active status filter and refreshes the first page. */
		setStatusFilter( filter ) {
			this.statusFilter = filter;
			this.page = 1;
			this.refresh();
		},

		/** Advances to the next registry page. */
		nextPage() {
			if ( this.page >= this.pageCount ) return;
			this.page++;
			this.refresh();
		},

		/** Changes the sort order and refreshes the first page. */
		sortBy( column ) {
			const [
				currentColumn,
				direction
			] = this.sortOrder.split( " " );
			this.sortOrder = `${ column } ${ currentColumn === column && direction === "asc" ? "desc" : "asc" }`;
			this.page = 1;
			this.refresh();
		},

		/** Opens the create drawer with a clean form. */
		openCreate() {
			this.editing = null;
			this.form = { name: "", value: "", isActive: true };
			this.drawerOpen = true;
		},

		/** Opens the edit drawer for a setting. */
		openEdit( setting ) {
			this.editing = setting;
			this.form = { name: setting.name || "", value: setting.value || "", isActive: Boolean( setting.isActive ) };
			this.drawerOpen = true;
		},

		/** Closes the editor drawer. */
		closeDrawer( force = false ) {
			if ( this.submitting && !force ) return;
			this.drawerOpen = false;
		},

		/** Saves a new or existing setting. */
		async save( event ) {
			event?.preventDefault();
			if ( this.submitting ) return;
			this.submitting = true;
			try {
				const endpoint = this.editing ? `/settings/registry/${ encodeURIComponent( this.editing.settingId ) }` : "/settings/registry";
				const response = await fetch( endpoint, {
					method  : this.editing ? "PUT" : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { ...this.form, isActive: String( this.form.isActive ), csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Setting could not be saved." );
				this.closeDrawer( true );
				window.$toast?.( result.messages || "Setting saved successfully.", "success", { title: this.editing ? "Setting updated" : "Setting created" } );
				await this.refresh();
			} catch ( error ) {
				window.$toast?.( error.message || "Setting could not be saved.", "error", { title: "Save failed" } );
			} finally {
				this.submitting = false;
			}
		},

		/** Opens the status confirmation dialog. */
		confirmStatus( setting ) {
			this.statusTarget = { setting, isActive: !setting.isActive };
			this.statusOpen = true;
		},

		/** Applies the pending active-state change. */
		async saveStatus() {
			if ( !this.statusTarget ) return;
			const target = this.statusTarget;
			try {
				const response = await fetch( `/settings/registry/${ encodeURIComponent( target.setting.settingId ) }/status`, {
					method  : "POST",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { isActive: String( target.isActive ), csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Setting status could not be changed." );
				this.statusOpen = false;
				window.$toast?.( result.messages || "Setting status updated successfully.", "success", { title: target.isActive ? "Setting enabled" : "Setting disabled" } );
				await this.refresh();
			} catch ( error ) {
				window.$toast?.( error.message || "Setting status could not be changed.", "error", { title: "Status update failed" } );
			}
		},

		/** Opens the delete confirmation dialog. */
		confirmDelete( setting ) {
			this.deleteTarget = setting;
			this.deleteOpen = true;
		},

		/** Deletes the selected setting. */
		async deleteSetting() {
			if ( !this.deleteTarget || this.deleting ) return;
			this.deleting = true;
			try {
				const response = await fetch( `/settings/registry/${ encodeURIComponent( this.deleteTarget.settingId ) }`, {
					method  : "DELETE",
					headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body    : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Setting could not be deleted." );
				this.deleteOpen = false;
				window.$toast?.( result.messages || "Setting deleted successfully.", "success", { title: "Setting deleted" } );
				await this.refresh();
			} catch ( error ) {
				window.$toast?.( error.message || "Setting could not be deleted.", "error", { title: "Delete failed" } );
			} finally {
				this.deleting = false;
			}
		},
	};
}