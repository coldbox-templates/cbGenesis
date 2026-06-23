import Alpine from "alpinejs";

Alpine.store( "sidebar", {
	collapsed : false,
	open      : false,

	init() {
		const saved = localStorage.getItem( "sidebar-collapsed" );
		if ( saved !== null ) {
			this.collapsed = saved === "true";
		}
	},

	toggle() {
		if ( window.innerWidth >= 992 ) {
			this.collapsed = !this.collapsed;
			localStorage.setItem( "sidebar-collapsed", String( this.collapsed ) );
		} else {
			this.open = !this.open;
		}
	},

	close() {
		this.open = false;
	},
} );