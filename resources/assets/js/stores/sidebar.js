import Alpine from "alpinejs";

function getSavedCollapsedState() {
	try {
		return localStorage.getItem( "sidebar-collapsed" ) === "true";
	} catch ( error ) {
		return false;
	}
}

function syncCollapsedState( collapsed ) {
	document.documentElement.setAttribute( "data-sidebar-collapsed", collapsed ? "true" : "false" );
}

Alpine.store( "sidebar", {
	collapsed : getSavedCollapsedState(),
	open      : false,

	init() {
		syncCollapsedState( this.collapsed );
	},

	toggle() {
		if ( window.innerWidth >= 992 ) {
			this.collapsed = !this.collapsed;
			localStorage.setItem( "sidebar-collapsed", String( this.collapsed ) );
			syncCollapsedState( this.collapsed );
		} else {
			this.open = !this.open;
		}
	},

	close() {
		this.open = false;
	},
} );