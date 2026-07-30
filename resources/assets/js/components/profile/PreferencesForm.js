/**
 * Alpine component for editing user preference name/value pairs.
 *
 * @param {Object|string} initialPreferences Preferences loaded by the server.
 * @returns {Object} Alpine preferences form state and handlers.
 */
export function preferencesForm( initialPreferences = {} ) {

	/**
	 * Parses a JSON string or object into a preference object.
	 *
	 * @param {Object|string} value Preferences to parse.
	 *
	 * @returns {Object} Parsed preference object.
	 */
	function parsePreferences( value ) {
		if ( value && typeof value === "object" && !Array.isArray( value ) ) return value;
		if ( typeof value !== "string" || !value.trim() ) return {};

		try {
			const parsed = JSON.parse( value );
			return parsed && typeof parsed === "object" && !Array.isArray( parsed ) ? parsed : {};
		} catch {
			return {};
		}
	}

	/**
	 * Creates a new preference row object.
	 *
	 * @param {string} name Preference name.
	 * @param {string} value Preference value.
	 * @returns {Object} Preference row object.
	 */
	function createPreference( name = "", value = "" ) {
		return {
			id    : globalThis.crypto?.randomUUID?.() || `${ Date.now() }-${ Math.random() }`,
			name,
			value : typeof value === "string" ? value : JSON.stringify( value ),
		};
	}

	/**
	 * Serializes preference rows into a JSON string.
	 *
	 * @param {Array} rows Preference rows to serialize.
	 * @returns {string} JSON string of preferences.
	 */
	function serializePreferences( rows ) {
		const preferenceObject = {};
		rows.forEach( preference => {
			preferenceObject[ preference.name.trim() ] = preference.value;
		} );
		return JSON.stringify( Object.keys( preferenceObject ).sort().reduce( ( sorted, name ) => {
			sorted[ name ] = preferenceObject[ name ];
			return sorted;
		}, {} ) );
	}

	const initialRows = [];
	Object.entries( parsePreferences( initialPreferences ) ).forEach( entry => {
		initialRows.push( createPreference( entry[ 0 ], entry[ 1 ] ) );
	} );
	let initialPreferencesJson = serializePreferences( initialRows );

	return {
		preferences : initialRows,
		error       : "",
		submitting  : false,

		/**
		 * Indicates whether the editable preferences differ from their saved JSON.
		 *
		 * @returns {boolean} Whether unsaved preference changes exist.
		 */
		get preferencesDirty() {
			return serializePreferences( this.preferences ) !== initialPreferencesJson;
		},

		/**
		 * Adds a blank row and focuses its name field.
		 *
		 * @returns {void}
		 */
		addPreference() {
			this.error = "";
			this.preferences.push( createPreference() );
			this.$nextTick( () => this.$root.querySelector( `[data-preference-id="${ this.preferences.at( -1 ).id }"] input` )?.focus() );
		},

		/**
		 * Removes a preference row.
		 *
		 * @param {string} id Row identifier.
		 * @returns {void}
		 */
		removePreference( id ) {
			this.preferences = this.preferences.filter( preference => preference.id !== id );
			this.error = "";
		},

		/**
		 * Validates and dispatches the JSON-ready preference object.
		 *
		 * @param {SubmitEvent} event Form submit event.
		 * @returns {void}
		 */
		submit( event ) {
			event.preventDefault();
			if ( this.submitting ) return;
			const names = new Set();

			for ( const preference of this.preferences ) {
				const name = preference.name.trim();
				if ( !name ) {
					this.error = "Every preference needs a name.";
					return;
				}
				if ( names.has( name ) ) {
					this.error = `The preference name \"${ name }\" is duplicated.`;
					return;
				}
				names.add( name );
			}

			this.error = "";
			this.submitting = true;
			this.$dispatch( "preferences-submit", {
				form        : event.currentTarget,
				preferences : serializePreferences( this.preferences ),
				markSaved   : () => {
					initialPreferencesJson = serializePreferences( this.preferences );
				},
				setSubmitting : value => {
					this.submitting = value;
				},
			} );
		},
	};
}