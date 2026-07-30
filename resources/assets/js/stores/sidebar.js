import Alpine from "alpinejs";

function syncCollapsedState( collapsed ) {
	document.documentElement.setAttribute( "data-sidebar-collapsed", collapsed ? "true" : "false" );
}

Alpine.store( "sidebar", {
	collapsed : Alpine.$persist( false ).as( "cbGenesis-sidebar-collapsed" ),
	open      : false,

	init() {
		syncCollapsedState( this.collapsed );
	},

	toggle() {
		if ( window.innerWidth >= 992 ) {
			this.collapsed = !this.collapsed;
			syncCollapsedState( this.collapsed );
		} else {
			this.open = !this.open;
		}
	},

	close() {
		this.open = false;
	},
} );