import { createRemoteListing } from "../../utils/listing.js";

/**
 * Maps an audit log severity to its badge/chip CSS class.
 *
 * @param {string} severity Severity value returned by the server.
 * @returns {string} A `cb-chip-*` modifier class.
 */
function severityChipClass( severity ) {
	const classes = {
		debug: "cb-chip-muted",
		info : "cb-chip-info",
		warn : "cb-chip-warning",
		error: "cb-chip-danger",
		fatal: "cb-chip-fatal",
	};
	return classes[ String( severity || "" ).toLowerCase() ] || "cb-chip-muted";
}

/**
 * Normalizes a single server-supplied audit log record for display, adding
 * the derived severity badge class used by the listing template.
 *
 * @param {Object} entry Audit log entry supplied by the server.
 * @returns {Object} Entry with display-only fields appended.
 */
function normalizeEntry( entry = {} ) {
	return {
		...entry,
		severityChipClass: severityChipClass( entry.severity ),
	};
}

/**
 * Alpine component for the admin audit log listing: filtering, pagination,
 * the entry detail drawer, CSV export, and the destructive "clear all" action.
 *
 * @param {Object} payload Initial server-rendered payload (records, count, counts, severities, categories).
 * @param {string} csrfToken CSRF token used for the clear-all mutation.
 * @returns {Object} Alpine audit log listing state and methods.
 */
export function auditLogForm( payload = {}, csrfToken = "" ) {
	const initialPayload = payload && !Array.isArray( payload ) ? payload : { records: payload };

	return {
		...createRemoteListing( {
			endpoint     : "/auditlog/search",
			recordsKey   : "entries",
			responseKey  : "records",
			refreshMethod: "refreshEntries",
			defaultSort  : "createdDate desc",
			normalize    : normalizeEntry,
			buildParams  : ( state ) => {
				const params = {
					page     : String( state.page ),
					limit    : String( state.limit ),
					search   : state.query.trim(),
					sortOrder: state.sortOrder,
				};
				if ( state.severityFilter !== "all" ) params.severity = state.severityFilter;
				if ( state.categoryFilter ) params.category = state.categoryFilter;
				return params;
			},
		} ),
		entries       : ( initialPayload.records || [] ).map( normalizeEntry ),
		total         : Number( initialPayload.count || 0 ),
		counts        : initialPayload.counts || { all: 0, debug: 0, info: 0, warn: 0, error: 0, fatal: 0 },
		severities    : initialPayload.severities || [ "debug", "info", "warn", "error", "fatal" ],
		categories    : initialPayload.categories || [ "auth", "security", "data", "system" ],
		csrfToken,
		severityFilter: "all",
		categoryFilter: "",
		detailTarget  : null,
		detailLoading : false,
		detailError   : "",
		clearOpen     : false,
		clearing      : false,
		error         : "",
		notice        : "",

		/**
		 * Returns the highest-priority feedback message for the page.
		 *
		 * @returns {string} Current error or success message for the page.
		 */
		get feedbackMessage() {
			return this.error || this.notice;
		},

		/**
		 * Selects the messagebox style for the current feedback state.
		 *
		 * @returns {string} Messagebox style based on the current feedback state.
		 */
		get feedbackType() {
			return this.error ? "error" : "success";
		},

		/**
		 * Clears the current page error and success messages.
		 *
		 * @returns {void}
		 */
		clearFeedback() {
			this.error = "";
			this.notice = "";
		},

		/**
		 * Selects a severity tab and reloads its first page.
		 *
		 * @param {string} severity Severity value, or "all" for every severity.
		 * @returns {void}
		 */
		setSeverityFilter( severity ) {
			this.severityFilter = severity;
			this.page = 1;
			this.refreshEntries();
		},

		/**
		 * Selects a category filter and reloads its first page.
		 *
		 * @param {string} category Category value, or an empty string for all categories.
		 * @returns {void}
		 */
		setCategoryFilter( category ) {
			this.categoryFilter = category;
			this.page = 1;
			this.refreshEntries();
		},

		/**
		 * Opens the detail drawer for an entry and fetches its full payload
		 * (including IP, user agent, and parsed metadata) from the server.
		 *
		 * @param {Object} entry Audit log entry selected from the listing.
		 * @returns {Promise<void>}
		 */
		async openDetail( entry ) {
			this.detailTarget = entry;
			this.detailLoading = true;
			this.detailError = "";
			try {
				const response = await fetch( `/auditlog/${ encodeURIComponent( entry.auditLogId ) }`, {
					headers: { Accept: "application/json" },
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Audit log entry could not be loaded." );
				this.detailTarget = { ...entry, ...result.data };
			} catch ( error ) {
				this.detailError = error.message || "Audit log entry could not be loaded.";
			} finally {
				this.detailLoading = false;
			}
		},

		/**
		 * Closes the detail drawer.
		 *
		 * @returns {void}
		 */
		closeDetail() {
			this.detailTarget = null;
			this.detailError = "";
		},

		/**
		 * Opens the "clear all" confirmation dialog.
		 *
		 * @returns {void}
		 */
		confirmClear() {
			this.clearOpen = true;
			this.error = "";
		},

		/**
		 * Closes the "clear all" confirmation dialog unless a clear is in progress.
		 *
		 * @param {boolean} force Whether to close during an active clear.
		 * @returns {void}
		 */
		cancelClear( force = false ) {
			if ( this.clearing && !force ) return;
			this.clearOpen = false;
		},

		/**
		 * Permanently deletes every audit log entry and refreshes the listing.
		 * Requires the "auditlog:admin" permission server-side; the button that
		 * triggers this is itself hidden from users without that permission.
		 *
		 * @returns {Promise<void>}
		 */
		async clearAll() {
			if ( this.clearing ) return;
			this.clearing = true;
			this.error = "";
			try {
				const response = await fetch( "/auditlog/clear", {
					method : "DELETE",
					headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
					body   : new URLSearchParams( { csrf: this.csrfToken } ),
				} );
				const result = await response.json();
				if ( !response.ok || result.error ) throw new Error( result.messages || "Audit log could not be cleared." );
				this.cancelClear( true );
				this.page = 1;
				this.notice = result.messages || "Audit log cleared.";
				window.$toast?.( this.notice, "success", { title: "Audit log cleared" } );
				await this.refreshEntries();
			} catch ( error ) {
				this.error = error.message || "Audit log could not be cleared.";
			} finally {
				this.clearing = false;
			}
		},

		/**
		 * Navigates the browser to the CSV export endpoint using the current
		 * filters, letting the browser handle the resulting file download.
		 *
		 * @returns {void}
		 */
		exportCsv() {
			const params = new URLSearchParams( { search: this.query.trim() } );
			if ( this.severityFilter !== "all" ) params.set( "severity", this.severityFilter );
			if ( this.categoryFilter ) params.set( "category", this.categoryFilter );
			window.location.href = `/auditlog/export?${ params.toString() }`;
		},
	};
}
