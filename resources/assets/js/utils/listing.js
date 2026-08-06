/**
 * Creates the shared state and lifecycle methods used by remote admin listings.
 * Domain components remain responsible for record normalization, filters, and
 * actions while this utility owns request state, pagination, and sorting.
 *
 * @param {Object} options Listing configuration.
 * @param {string} options.endpoint Endpoint used to load records.
 * @param {string} [options.recordsKey="records"] Property containing records.
 * @param {string} [options.responseKey] Property containing records in the response.
 * @param {string} [options.refreshMethod="refresh"] Public refresh method name.
 * @param {string} [options.defaultSort=""] Initial sort order.
 * @param {Function} [options.buildParams] Builds endpoint parameters.
 * @param {Function} [options.normalize] Normalizes each returned record.
 * @returns {Object} Alpine-compatible listing state and methods.
 */
export function createRemoteListing( options = {} ) {
	const {
		endpoint,
		recordsKey = "records",
		responseKey = recordsKey,
		refreshMethod = "refresh",
		defaultSort = "",
		buildParams = () => ( {} ),
		normalize = ( record ) => record,
	} = options;

	return {
		[ recordsKey ] : [],
		total          : 0,
		query          : "",
		sortOrder      : defaultSort,
		page           : 1,
		limit          : 25,
		loading        : false,
		error          : "",
		_requestId     : 0,

		get pageCount() {
			return Math.max( 1, Math.ceil( this.total / this.limit ) );
		},

		/** Loads the current page and ignores responses from older requests. */
		[ refreshMethod ] : async function() {
			const requestId = ++this._requestId;
			this.loading = true;
			this.error = "";

			try {
				const params = new URLSearchParams( buildParams( this ) );
				const response = await fetch( `${ endpoint }?${ params.toString() }`, { headers: { Accept: "application/json" }, } );
				const result = await response.json();
				if ( !response.ok || result.error ) {
					throw new Error( result.messages || "Records could not be loaded." );
				}
				if ( requestId !== this._requestId ) return;

				const data = result.data || {};
				this[ recordsKey ] = ( data[ responseKey ] || [] ).map( normalize );
				this.total = Number( data.count || 0 );
				if ( data.counts ) this.counts = data.counts;
			} catch ( error ) {
				if ( requestId === this._requestId ) this.error = error.message || "Records could not be loaded.";
			} finally {
				if ( requestId === this._requestId ) this.loading = false;
			}
		},

		/** Moves to the previous page when one is available. */
		previousPage() {
			if ( this.page <= 1 ) return;
			this.page--;
			this[ refreshMethod ]();
		},

		/** Moves to the next page when one is available. */
		nextPage() {
			if ( this.page >= this.pageCount ) return;
			this.page++;
			this[ refreshMethod ]();
		},

		/** Changes the sort column and reloads the first page. */
		sortBy( column ) {
			const [
				currentColumn,
				currentDirection
			] = this.sortOrder.split( " " );
			const direction = currentColumn === column && currentDirection === "asc" ? "desc" : "asc";
			this.sortOrder = `${ column } ${ direction }`;
			this.page = 1;
			this[ refreshMethod ]();
		},
	};
}