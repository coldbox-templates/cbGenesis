/**
 * Alpine component for filtering and grouping the permission catalog.
 *
 * @param {Array} permissions Permissions supplied by the server.
 * @returns {Object} Alpine component state and derived groups.
 */
export function permissionsForm( permissions = [] ) {
	return {
		permissions,
		query      : "",
		modalOpen  : false,
		submitting : false,
		form       : {
			permission  : "",
			description : "",
		},

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
			if ( this.submitting ) {
				return;
			}
			this.modalOpen = false;
			this.form.permission = "";
			this.form.description = "";
		},
	};
}