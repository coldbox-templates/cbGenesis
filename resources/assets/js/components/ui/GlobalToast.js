/**
 * Global toast Alpine component.
 *
 * Manages a stack of Bootstrap-styled notifications and supports both direct
 * Alpine usage and the global `window.$toast` event API.
 *
 * Usage in BXM:
 *   x-data="globalToast({ duration: 5000, position: 'top-end', maxVisible: 4 })"
 *
 * @typedef {Object} GlobalToastOptions
 * @property {number} [duration=5000] Default display time in milliseconds.
 *   Use `0` or a negative value to keep a toast visible until dismissed.
 * @property {ToastPosition} [position="top-end"] Viewport corner or edge
 *   where the toast stack is rendered.
 * @property {number} [maxVisible=4] Maximum number of toasts retained in the
 *   stack. When exceeded, the oldest toast is removed.
 */

/**
 * @typedef {Object} ToastOptions
 * @property {string} [title] Optional heading. The type name is used when it
 *   is omitted.
 * @property {number} [duration] Overrides the component default for one toast.
 * @property {string} [message] Toast message. Required by `show()` and ignored
 *   when blank; not needed when using the separate `toast()` message argument.
 * @property {"info"|"success"|"warning"|"error"} [type="info"] Toast semantic type.
 */

/**
 * Supported CSS position modifiers. These map to the corresponding
 * `.cb-global-toasts--*` classes in `resources/assets/scss/components/_global-ui.scss`.
 *
 * @typedef {"top-start"|"top-center"|"top-end"|"bottom-start"|"bottom-center"|"bottom-end"} ToastPosition
 */

/**
 * Alpine creates one controller per rendered toast container. Toasts are
 * announced through the `toast:show` browser event and stored in `items` so
 * the markup can render and remove them declaratively. This avoids coupling
 * callers to Bootstrap's imperative Toast API.
 *
 * @param {GlobalToastOptions} [options] Component configuration.
 * @param {number} [options.duration=5000] Default display time in milliseconds.
 * @param {ToastPosition} [options.position="top-end"] Toast stack position.
 * @param {number} [options.maxVisible=4] Maximum number of visible toasts.
 * @returns {Object} Alpine component state and lifecycle methods.
 */
export function globalToast( { duration = 5000, position = "bottom-end", maxVisible = 4 } = {} ) {
	return {
		items   : [],
		_config : { duration, position, maxVisible },
		_nextId : 0,

		/**
		 * Registers the global `toast:show` event listener.
		 *
		 * Alpine calls this method after the toast container enters the DOM.
		 * The listener delegates event payloads to `show()`.
		 *
		 * @returns {void}
		 */
		init() {
			this._onShow = ( event ) => this.show( event.detail || {} );
			window.addEventListener( "toast:show", this._onShow );
		},

		/**
		 * Removes the event listener and clears all pending auto-dismiss timers.
		 *
		 * This prevents detached Alpine components from responding to future
		 * events and avoids timers retaining stale component state.
		 *
		 * @returns {void}
		 */
		destroy() {
			window.removeEventListener( "toast:show", this._onShow );
			this.items.forEach( ( item ) => clearTimeout( item.timer ) );
		},

		/**
		 * Adds a toast to the visible stack and schedules its dismissal.
		 *
		 * Empty messages are ignored. Unknown types are treated as `info`, and
		 * the per-toast duration takes precedence over the component default.
		 * The stack is trimmed from the beginning when `maxVisible` is exceeded.
		 *
		 * @param {ToastOptions} [toastOptions] Message and presentation options.
		 * @param {string} [toastOptions.message] Text displayed in the toast.
		 * @param {"info"|"success"|"warning"|"error"} [toastOptions.type="info"] Semantic type.
		 * @param {string} [toastOptions.title] Optional heading.
		 * @param {number} [toastOptions.duration] Auto-dismiss override in milliseconds.
		 * @returns {void}
		 */
		show( { message = "", type = "info", title = "", duration: itemDuration, ...options } = {} ) {
			if ( !String( message ).trim() ) return;
			const item = {
				id      : ++this._nextId,
				message : String( message ),
				title   : String( title || "" ),
				type    : [
					"info",
					"success",
					"warning",
					"error",
				].includes( type ) ? type : "info",
				duration : Number( itemDuration ?? this._config.duration ),
				...options,
			};
			item.timer = item.duration > 0 ? setTimeout( () => this.dismiss( item.id ), item.duration ) : null;
			this.items = [
				...this.items,
				item,
			].slice( -this._config.maxVisible );
		},

		/**
		 * Removes one toast immediately and cancels its auto-dismiss timer.
		 *
		 * Safe to call with an unknown ID; the current stack is left unchanged
		 * except for the normal filtering operation.
		 *
		 * @param {number} id Unique toast ID returned internally by `show()`.
		 * @returns {void}
		 */
		dismiss( id ) {
			const item = this.items.find( ( current ) => current.id === id );
			if ( item?.timer ) clearTimeout( item.timer );
			this.items = this.items.filter( ( current ) => current.id !== id );
		},

		/**
		 * Maps a semantic toast type to its Phosphor icon class.
		 *
		 * @param {string} type Toast semantic type.
		 * @returns {string} Phosphor icon class name.
		 */
		icon( type ) {
			return { info: "ph-info", success: "ph-check-circle", warning: "ph-warning", error: "ph-x-circle" }[ type ] || "ph-info";
		},

		/**
		 * Maps a semantic toast type to Bootstrap's contextual color name.
		 * `error` becomes Bootstrap's `danger` context.
		 *
		 * @param {string} type Toast semantic type.
		 * @returns {string} Bootstrap contextual color name.
		 */
		bootstrapType( type ) {
			return { info: "info", success: "success", warning: "warning", error: "danger" }[ type ] || "info";
		},
	};
}

/**
 * Announces a toast to every mounted global toast container.
 *
 * This is the public application API exposed as `window.$toast`. It is safe to
 * call from any bundled module after `App.js` has initialized. The event-based
 * API keeps producers independent from Alpine and allows the layout to own
 * rendering, positioning, queue limits, and cleanup.
 *
 * @param {string} message Toast text. Blank or whitespace-only messages are ignored.
 * @param {"info"|"success"|"warning"|"error"} [type="info"] Semantic type.
 * @param {ToastOptions} [options] Optional title and duration override.
 * @returns {void}
 */
export function toast( message, type = "info", options = {} ) {
	window.dispatchEvent( new CustomEvent( "toast:show", { detail: { message, type, ...options } } ) );
}
