/**
 * Alpine component for filtering the user management listing.
 *
 * @param {Array} users Users supplied by the server.
 * @returns {Object} Alpine user listing state and computed values.
 */
export function usersForm( users = [] ) {
	return {
		users,
		query        : "",
		statusFilter : "all",

		/**
		 * Returns users matching the selected status and search query.
		 *
		 * @returns {Array} Users matching the active filters.
		 */
		get filteredUsers() {
			const query = this.query.trim().toLowerCase();

			return this.users.filter( ( user ) => {
				const matchesStatus = this.statusFilter === "all"
					|| String( user.status || "" ).toLowerCase() === this.statusFilter;
				const matchesQuery = !query || [
					user.name,
					user.email,
					...( user.roles || [] ),
				].some( ( value ) => String( value || "" ).toLowerCase().includes( query ) );

				return matchesStatus && matchesQuery;
			} );
		},

		/**
		 * Returns the number of users visible after filtering.
		 *
		 * @returns {number} Number of filtered users.
		 */
		get filteredCount() {
			return this.filteredUsers.length;
		},
	};
}