/**
 * Global progress controller for the fixed application loading bar.
 *
 * Listens for `progress:start`, `progress:stop`, and `progress:set` events.
 * The public `window.$progress` API and Alpine `$progress` magic property use
 * the same event contract, so any component can control the indicator.
 *
 * @returns {Object} Alpine component state and lifecycle methods.
 */
export function globalProgress() {
	return {
		visible   : false,
		value     : 0,
		_message  : "Working...",
		_requests : 0,

		init() {
			this._onStart = ( event ) => this.start( event.detail || {} );
			this._onStop = () => this.stop();
			this._onSet = ( event ) => this.set( event.detail?.value ?? event.detail ?? 0 );
			window.addEventListener( "progress:start", this._onStart );
			window.addEventListener( "progress:stop", this._onStop );
			window.addEventListener( "progress:set", this._onSet );
		},

		destroy() {
			window.removeEventListener( "progress:start", this._onStart );
			window.removeEventListener( "progress:stop", this._onStop );
			window.removeEventListener( "progress:set", this._onSet );
		},

		start( { message = "Working..." } = {} ) {
			this._requests += 1;
			this._message = message;
			this.visible = true;
			this.value = Math.max( this.value, 8 );
		},

		stop() {
			this._requests = Math.max( 0, this._requests - 1 );
			if ( this._requests > 0 ) return;
			this.value = 100;
			setTimeout( () => {
				if ( this._requests === 0 ) {
					this.visible = false;
					this.value = 0;
				}
			}, 180 );
		},

		set( value ) {
			this.value = Math.min( 100, Math.max( 0, Number( value ) || 0 ) );
			this.visible = this.value < 100 || this._requests > 0;
		},
	};
}

/**
 * Dispatches a global progress event.
 *
 * @param {string} action Progress action: start, stop, or set.
 * @param {Object|number} detail Action details or percentage value.
 * @returns {void}
 */
export function progress( action, detail = {} ) {
	window.dispatchEvent( new CustomEvent( `progress:${ action }`, { detail } ) );
}
