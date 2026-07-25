/**
 * Alpine component for reusable right-side drawer shells.
 *
 * Tracks the element that had focus before opening so keyboard users return to
 * their previous position when the drawer closes.
 *
 * @returns {Object} Alpine drawer state and lifecycle actions.
 */
export function drawer() {
	return {
		open               : false,
		lastFocusedElement : null,

		/**
		 * Watches drawer visibility and manages initial and restored focus.
		 *
		 * @returns {void}
		 */
		init() {
			this.$watch( "open", ( isOpen ) => {
				if ( isOpen ) {
					this.lastFocusedElement = document.activeElement;
					this.$nextTick( () => this.$root.querySelector( "input, button, select, textarea" )?.focus() );
				} else {
					this.lastFocusedElement?.focus?.();
				}
			} );
		},

		/**
		 * Closes the drawer.
		 *
		 * @returns {void}
		 */
		close() {
			this.open = false;
		},
	};
}
