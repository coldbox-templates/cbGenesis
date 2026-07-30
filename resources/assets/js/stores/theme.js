import Alpine from "alpinejs";

/**
 * Global theme store persisted under the cbGenesis-theme local storage key.
 *
 * @type {Object}
 */
Alpine.store( "theme", {
	mode : Alpine.$persist( window.matchMedia( "(prefers-color-scheme: dark)" ).matches ? "dark" : "light" ).as( "cbGenesis-theme" ),

	/**
	 * Applies the persisted theme mode to the document root.
	 *
	 * @returns {void}
	 */
	init() {
		this._apply();
	},

	/**
	 * Switches between light and dark theme modes and persists the selection.
	 *
	 * @returns {void}
	 */
	toggle() {
		this.mode = this.mode === "dark" ? "light" : "dark";
		this._apply();
	},

	/**
	 * Updates Bootstrap's theme attribute on the document root.
	 *
	 * @returns {void}
	 */
	_apply() {
		document.documentElement.setAttribute( "data-bs-theme", this.mode );
	},
} );