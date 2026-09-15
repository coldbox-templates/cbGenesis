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
export function messageBox( { autoDismiss = 5000 } = {} ) {
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
				this.startAutoDismiss( () => { this.visible = false; } );
			}
		},

		/**
		 * Starts or resets the auto-dismiss timer with a caller-provided action.
		 *
		 * @param {Function} dismissAction Action to run when the timer expires.
		 * @returns {void}
		 */
		startAutoDismiss( dismissAction ) {
			this.cancelAutoDismiss();
			if ( autoDismiss <= 0 || typeof dismissAction !== "function" ) return;
			this._timer = setTimeout( dismissAction, autoDismiss );
		},

		/**
		 * Cancels the pending auto-dismiss timer.
		 *
		 * @returns {void}
		 */
		cancelAutoDismiss() {
			if ( this._timer ) {
				clearTimeout( this._timer );
				this._timer = null;
			}
		},

		/**
		 * Clears the auto-dismiss timer when Alpine removes the component.
		 *
		 * @returns {void}
		 */
		destroy() {
			this.cancelAutoDismiss();
		},

		/**
		 * Hides the message immediately.
		 *
		 * @returns {void}
		 */
		dismiss() {
			this.cancelAutoDismiss();
			this.visible = false;
		},
	};
}
