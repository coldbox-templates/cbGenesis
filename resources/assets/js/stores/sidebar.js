import Alpine from "alpinejs";

/**
 * Synchronizes the persisted sidebar state with the document root attribute.
 *
 * @param {boolean} collapsed Whether the desktop sidebar is collapsed.
 * @returns {void}
 */
function syncCollapsedState( collapsed ) {
	document.documentElement.setAttribute( "data-sidebar-collapsed", collapsed ? "true" : "false" );
}

/**
 * Global responsive sidebar store persisted under the cbGenesis-sidebar-collapsed key.
 *
 * @type {Object}
 */
Alpine.store( "sidebar", {
	collapsed : Alpine.$persist( false ).as( "cbGenesis-sidebar-collapsed" ),
	open      : false,

	/**
	 * Applies the persisted collapsed state when Alpine initializes.
	 *
	 * @returns {void}
	 */
	init() {
		syncCollapsedState( this.collapsed );
	},

	/**
	 * Toggles desktop collapse or mobile drawer visibility based on viewport width.
	 *
	 * Desktop mode updates the persisted collapsed state; mobile mode updates
	 * only the temporary drawer visibility state.
	 *
	 * @returns {void}
	 */
	toggle() {
		if ( window.innerWidth >= 992 ) {
			this.collapsed = !this.collapsed;
			syncCollapsedState( this.collapsed );
		} else {
			this.open = !this.open;
		}
	},

	/**
	 * Closes the mobile sidebar drawer without changing desktop collapse state.
	 *
	 * @returns {void}
	 */
	close() {
		this.open = false;
	},
} );