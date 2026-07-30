import Alpine from "alpinejs";

Alpine.store( "theme", {
	mode : Alpine.$persist( window.matchMedia( "(prefers-color-scheme: dark)" ).matches ? "dark" : "light" ).as( "cbGenesis-theme" ),

	init() {
		this._apply();
	},

	toggle() {
		this.mode = this.mode === "dark" ? "light" : "dark";
		this._apply();
	},

	_apply() {
		document.documentElement.setAttribute( "data-bs-theme", this.mode );
	},
} );