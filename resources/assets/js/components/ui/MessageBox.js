/**
 * MessageBox Alpine Component
 *
 * Manages visibility and optional auto-dismiss for .cb-messagebox elements.
 * Registered in App.js as Alpine.data("messageBox", messageBox).
 *
 * Usage in BXM:
 *   x-data="messageBox({ autoDismiss: 5000 })"
 *
 * @param {Object} options Component configuration.
 * @param {number} options.autoDismiss Milliseconds before the message hides.
 * @returns {Object} Alpine component state and lifecycle methods.
 */
export function messageBox( { autoDismiss = 0 } = {} ) {
	return {
		visible : true,
		_timer  : null,

		/**
		 * Starts the auto-dismiss timer when configured.
		 *
		 * @returns {void}
		 */
		init() {
			if ( autoDismiss > 0 ) {
				this._timer = setTimeout( () => { this.visible = false; }, autoDismiss );
			}
		},

		/**
		 * Clears the auto-dismiss timer when Alpine removes the component.
		 *
		 * @returns {void}
		 */
		destroy() {
			if ( this._timer ) clearTimeout( this._timer );
		},

		/**
		 * Hides the message immediately.
		 *
		 * @returns {void}
		 */
		dismiss() {
			this.visible = false;
		},
	};
}
