import { fetchWithCsrf } from "../../utils/csrf.js";

/**
 * Rate limiting admin page: overview, blocked IPs, exclusions and settings.
 *
 * Every number on the page comes from the /ratelimiting JSON endpoints; the page itself
 * renders no data, so a refresh never needs a full reload. Reads are plain GETs. Every write
 * goes through fetchWithCsrf() and is only offered to users who hold the permission, which
 * the server checks again.
 *
 * @param {Object} initialData Server-rendered flags: `canWrite` (settings:write) and `canAdmin` (settings:admin).
 * @param {string} csrfToken CSRF token for mutation requests.
 * @returns {Object} Alpine component state and actions.
 */
export function rateLimitAdmin( initialData = {}, csrfToken = "" ) {
	return {
		csrfToken,
		canWrite : !!initialData.canWrite,
		canAdmin : !!initialData.canAdmin,
		tab      : "overview",
		loading  : true,
		busy     : false,
		error    : "",
		notice   : "",

		// Overview
		hours    : 24,
		latest   : 25,
		overview : {
			status       : { enabled: true, paused: false, indefinite: false, disabledByEnvironment: false },
			counters     : { total: 0, throttled: 0, rows: [] },
			topOffenders : [],
			hourly       : [],
			latest       : [],
			totals       : { blockedRequests: 0, blockedWindows: 0, blocks: 0, exclusions: 0 },
		},

		// Pause control
		pauseMinutes : "60",

		// Blocked IPs
		blocks    : [],
		blockForm : { address: "", hours: "24", reason: "" },

		// Exclusions
		exclusions    : [],
		exclusionForm : { type: "ip", value: "", label: "" },

		// Settings
		settings : {},

		// Confirmation dialog: `type` is "clearAll", "clearOne" or "unblock"
		confirm : { open: false, type: "", target: null, title: "", body: "" },

		/**
		 * Loads the overview and the three lists when the page opens.
		 *
		 * @returns {Promise<void>}
		 */
		async init() {
			await this.refresh();
		},

		/**
		 * Reloads everything the page shows. Failures set `error` and keep the old data.
		 *
		 * @returns {Promise<void>}
		 */
		async refresh() {
			this.loading = true;
			try {
				const [
					overview,
					blocks,
					exclusions,
					settings
				] = await Promise.all( [
					this.get( `/ratelimiting/overview?hours=${ this.hours }&latest=${ this.latest }` ),
					this.get( "/ratelimiting/blocks" ),
					this.get( "/ratelimiting/exclusions" ),
					this.get( "/ratelimiting/settings" ),
				] );
				this.overview     = overview;
				this.ceilingLimit = overview.ceiling.limit;
				this.blocks     = blocks;
				this.exclusions = exclusions;
				this.settings   = this.normalizeSettings( settings );
				this.error      = "";
			} catch ( error ) {
				this.error = error.message || "The rate limiting data could not be loaded.";
			} finally {
				this.loading = false;
			}
		},

		/**
		 * Turns the boolean settings, which arrive as true/false or "true"/"false", into real
		 * booleans so the checkboxes bind correctly.
		 *
		 * @param {Object} settings The settings returned by the server.
		 * @returns {Object} A copy with `cbTrustProxyHeaders` and `cbRateLimitAutoBlock` as booleans.
		 */
		normalizeSettings( settings ) {
			const flag = ( value ) => value === true || String( value ).toLowerCase() === "true";
			return {
				...settings,
				cbTrustProxyHeaders  : flag( settings.cbTrustProxyHeaders ),
				cbRateLimitAutoBlock : flag( settings.cbRateLimitAutoBlock ),
			};
		},

		/**
		 * Sends a GET request and returns the response `data`.
		 *
		 * @param {string} url Endpoint to read.
		 * @returns {Promise<*>} The `data` of the API response.
		 * @throws {Error} With the server's message when the response is an error.
		 */
		async get( url ) {
			const response = await fetch( url, { headers: { Accept: "application/json" } } );
			return this.unwrap( response );
		},

		/**
		 * Sends a write request with the CSRF token and returns the response `data`.
		 *
		 * @param {string} url Endpoint to call.
		 * @param {string} method HTTP method.
		 * @param {Object} fields Form fields to send besides the CSRF token.
		 * @returns {Promise<*>} The `data` of the API response.
		 * @throws {Error} With the server's message when the response is an error.
		 */
		async write( url, method, fields = {} ) {
			const response = await fetchWithCsrf( this, url, method, ( csrf ) => ( {
				headers : { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
				body    : new URLSearchParams( { ...fields, csrf } ),
			} ) );
			return this.unwrap( response );
		},

		/**
		 * Reads a JSON API response and throws its message when it failed.
		 *
		 * @param {Response} response The fetch response.
		 * @returns {Promise<*>} The `data` of the API response.
		 * @throws {Error} With the server's message when the response is an error.
		 */
		async unwrap( response ) {
			let result = {};
			try {
				result = await response.json();
			} catch ( error ) {
				throw new Error( "The server sent an unexpected response." );
			}
			if ( !response.ok || result.error ) {
				const messages = Array.isArray( result.messages ) ? result.messages.join( " " ) : result.messages;
				throw new Error( messages || "The request failed." );
			}
			this.lastMessage = Array.isArray( result.messages ) ? result.messages[ 0 ] : result.messages;
			return result.data;
		},

		/**
		 * Runs a write, then refreshes and shows the server's message as a toast.
		 *
		 * @param {Function} action Async function that performs the write.
		 * @returns {Promise<boolean>} True when the write succeeded.
		 */
		async run( action ) {
			if ( this.busy ) return false;
			this.busy  = true;
			this.error = "";
			try {
				await action();
				if ( this.lastMessage ) window.$toast?.( this.lastMessage, "success" );
				await this.refresh();
				return true;
			} catch ( error ) {
				this.error = error.message || "The change could not be saved.";
				return false;
			} finally {
				this.busy = false;
			}
		},

		// ---------- Overview ----------

		/**
		 * The highest blocked-request count in the hourly history, used to scale the bars.
		 *
		 * @returns {number} At least 1, so a division never hits zero.
		 */
		get hourlyPeak() {
			return Math.max( 1, ...this.overview.hourly.map( ( row ) => row.blockedRequests ) );
		},

		/**
		 * The blocked-request count of the busiest offender, used to scale the offender bars.
		 *
		 * @returns {number} At least 1.
		 */
		get offenderPeak() {
			return Math.max( 1, ...this.overview.topOffenders.map( ( row ) => row.blockedRequests ) );
		},

		/**
		 * A bar width as a percentage of a peak.
		 *
		 * @param {number} value The bar's value.
		 * @param {number} peak The largest value shown.
		 * @returns {string} A CSS width, never below 2% for a non-zero value so it stays visible.
		 */
		barWidth( value, peak ) {
			return value > 0 ? `${ Math.max( 2, Math.round( ( value / peak ) * 100 ) ) }%` : "0%";
		},

		/**
		 * Changes how far back the history looks and reloads.
		 *
		 * @param {number} hours Hours of history, 1 to 168.
		 * @returns {Promise<void>}
		 */
		async setHours( hours ) {
			this.hours = hours;
			await this.refresh();
		},

		/**
		 * Formats a duration in seconds for the "retry in" column.
		 *
		 * @param {number} seconds Seconds to wait.
		 * @returns {string} For example "45s" or "4m 10s".
		 */
		retryLabel( seconds ) {
			if ( seconds < 60 ) return `${ seconds }s`;
			return `${ Math.floor( seconds / 60 ) }m ${ seconds % 60 }s`;
		},

		// ---------- Pause / resume ----------

		/**
		 * Pauses rate limiting for the chosen number of minutes, or until resumed when 0.
		 *
		 * @returns {Promise<void>}
		 */
		async pause() {
			await this.run( () => this.write( "/ratelimiting/pause", "POST", { minutes: this.pauseMinutes } ) );
		},

		/**
		 * Resumes rate limiting.
		 *
		 * @returns {Promise<void>}
		 */
		async resume() {
			await this.run( () => this.write( "/ratelimiting/resume", "POST" ) );
		},

		// ---------- Counters ----------

		/**
		 * Opens the confirmation for clearing every counter.
		 *
		 * @returns {void}
		 */
		askClearAll() {
			this.confirm = {
				open   : true,
				type   : "clearAll",
				target : null,
				title  : "Clear every counter?",
				body   : "Every client starts a fresh window, including clients that are throttled right now. Blocked IPs, exclusions and history are not touched.",
			};
		},

		/**
		 * Opens the confirmation for clearing one client's counter.
		 *
		 * @param {Object} row A counters row with `key`, `endpoint` and `ipAddress`.
		 * @returns {void}
		 */
		askClearOne( row ) {
			this.confirm = {
				open   : true,
				type   : "clearOne",
				target : row,
				title  : "Clear this counter?",
				body   : `${ row.ipAddress } starts a fresh window on ${ row.endpoint }.`,
			};
		},

		/**
		 * Opens the confirmation for removing a block.
		 *
		 * @param {Object} block A block row with `blockId` and `address`.
		 * @returns {void}
		 */
		askUnblock( block ) {
			this.confirm = {
				open   : true,
				type   : "unblock",
				target : block,
				title  : "Unblock this address?",
				body   : `${ block.address } can reach the application again.`,
			};
		},

		/**
		 * Closes the confirmation dialog unless a request is in flight.
		 *
		 * @returns {void}
		 */
		cancelConfirm() {
			if ( this.busy ) return;
			this.confirm.open = false;
		},

		/**
		 * Performs the action the confirmation dialog asked about, then closes it.
		 *
		 * @returns {Promise<void>}
		 */
		async doConfirm() {
			const { type, target } = this.confirm;
			const actions = {
				clearAll : () => this.write( "/ratelimiting/counters", "DELETE" ),
				clearOne : () => this.write( `/ratelimiting/counters/${ encodeURIComponent( target?.key ) }`, "DELETE" ),
				unblock  : () => this.write( `/ratelimiting/blocks/${ encodeURIComponent( target?.blockId ) }`, "DELETE" ),
			};
			if ( !actions[ type ] ) return;
			if ( await this.run( actions[ type ] ) ) this.confirm.open = false;
		},

		/**
		 * Blocks an address straight from a counters row, for 24 hours.
		 *
		 * @param {Object} row A counters row with `ipAddress`.
		 * @returns {Promise<void>}
		 */
		async blockFromRow( row ) {
			await this.run( () => this.write( "/ratelimiting/blocks", "POST", {
				address : row.ipAddress,
				hours   : 24,
				reason  : `Throttled on ${ row.endpoint }`,
			} ) );
		},

		/**
		 * Excludes an address straight from a counters row.
		 *
		 * @param {Object} row A counters row with `ipAddress`.
		 * @returns {Promise<void>}
		 */
		async excludeFromRow( row ) {
			await this.run( () => this.write( "/ratelimiting/exclusions", "POST", {
				type  : "ip",
				value : row.ipAddress,
				label : "Excluded from the overview",
			} ) );
		},

		// ---------- Blocked IPs ----------

		/**
		 * Adds a block from the form, then clears the form on success.
		 *
		 * @returns {Promise<void>}
		 */
		async addBlock() {
			const ok = await this.run( () => this.write( "/ratelimiting/blocks", "POST", { ...this.blockForm } ) );
			if ( ok ) this.blockForm = { address: "", hours: "24", reason: "" };
		},

		/**
		 * A readable "until" label for a block.
		 *
		 * @param {Object} block A block row with an optional `expiresAt`.
		 * @returns {string} "Permanent" or a formatted date and time.
		 */
		blockUntil( block ) {
			return block.expiresAt ? this.$formatDateTime?.( block.expiresAt ) ?? block.expiresAt : "Permanent";
		},

		// ---------- Exclusions ----------

		/**
		 * The exclusions that are IPs or ranges.
		 *
		 * @returns {Object[]} Exclusion rows of type "ip".
		 */
		get ipExclusions() {
			return this.exclusions.filter( ( row ) => row.type === "ip" );
		},

		/**
		 * The exclusions that are users.
		 *
		 * @returns {Object[]} Exclusion rows of type "user".
		 */
		get userExclusions() {
			return this.exclusions.filter( ( row ) => row.type === "user" );
		},

		/**
		 * Adds an exclusion from the form, then clears the value and label on success.
		 *
		 * @returns {Promise<void>}
		 */
		async addExclusion() {
			const ok = await this.run( () => this.write( "/ratelimiting/exclusions", "POST", { ...this.exclusionForm } ) );
			if ( ok ) this.exclusionForm = { ...this.exclusionForm, value: "", label: "" };
		},

		/**
		 * Removes an exclusion.
		 *
		 * @param {Object} row An exclusion row with `exclusionId`.
		 * @returns {Promise<void>}
		 */
		async removeExclusion( row ) {
			await this.run( () => this.write( `/ratelimiting/exclusions/${ encodeURIComponent( row.exclusionId ) }`, "DELETE" ) );
		},

		// ---------- Settings ----------

		/**
		 * Saves the settings form. A bad value shows the server's message and saves nothing.
		 *
		 * @returns {Promise<void>}
		 */
		async saveSettings() {
			await this.run( () => this.write( "/ratelimiting/settings", "PUT", this.settings ) );
		},
		// ---------- Server ceiling ----------

		/**
		 * How full the server ceiling's address tracking is, as a percentage.
		 *
		 * @returns {number} 0 to 100.
		 */
		get ceilingCapacityPercent() {
			const { trackedIps, maxTrackedIps } = this.overview.ceiling;
			return Math.min( 100, Math.round( ( trackedIps / Math.max( 1, maxTrackedIps ) ) * 100 ) );
		},

		/**
		 * Saves the server ceiling limit. A value outside the allowed range shows the server's message.
		 *
		 * @returns {Promise<void>}
		 */
		async saveCeiling() {
			await this.run( () => this.write( "/ratelimiting/ceiling", "PUT", { limit: this.ceilingLimit } ) );
		},

		/**
		 * Turns lockdown on or off. While on, every IP is held to the minimum limit.
		 *
		 * @param {boolean} enabled True to turn lockdown on.
		 * @returns {Promise<void>}
		 */
		async setLockdown( enabled ) {
			await this.run( () => this.write( "/ratelimiting/ceiling", "PUT", { lockdown: enabled } ) );
		},
	};
}
