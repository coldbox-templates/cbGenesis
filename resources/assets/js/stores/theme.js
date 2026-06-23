import Alpine from "alpinejs";

Alpine.store( "theme", {
	mode : "light",

	init() {
		const saved      = localStorage.getItem( "theme" );
		const prefersDark = window.matchMedia( "(prefers-color-scheme: dark)" ).matches;
		this.mode = saved ?? ( prefersDark ? "dark" : "light" );
		this._apply();
	},

	toggle() {
		this.mode = this.mode === "dark" ? "light" : "dark";
		localStorage.setItem( "theme", this.mode );
		this._apply();
	},

	_apply() {
		document.documentElement.setAttribute( "data-bs-theme", this.mode );
	},
} );