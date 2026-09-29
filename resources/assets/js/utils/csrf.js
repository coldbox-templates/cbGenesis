/**
 * Central CSRF handling for every mutating request in the admin UI.
 *
 * `csrfField()` (cbcsrf's `Mixins.cfm`) force-rotates the session's token on its first use
 * in each request, so any page that renders it (Settings, the passkey-required page, the
 * auth pages) silently invalidates the token embedded in every other open tab. Tokens also
 * expire a fixed time after they are *created*, not after the page loaded, so a page
 * rendered late in a token's life can be served one with only seconds left. Either way, the
 * component's `csrfToken` can go stale while the page is still open.
 *
 * `fetchWithCsrf()` is the one place that recovers from that: on a 403 it fetches the
 * session's current token and replays the request once with a freshly-built body, so a
 * user's input is never lost to an expired token. Every component that mutates
 * server state should send its request through this helper instead of calling `fetch()`
 * directly, so the retry behavior - and anything added here later (request/response
 * hooks, global headers, telemetry) - lives in one place.
 */

/**
 * Sends a request carrying the current CSRF token, recovering once from a stale token.
 *
 * @param {Object} component Alpine component instance exposing a mutable `csrfToken` property.
 * @param {string} url Endpoint to send the request to.
 * @param {string} method HTTP method to use.
 * @param {(csrfToken: string) => RequestInit} buildRequest Builds the method-specific parts of
 * the request (headers, body, etc.) for the given CSRF token. Called again on retry so the
 * request carries the refreshed token.
 * @returns {Promise<Response>} The final fetch response.
 */
export async function fetchWithCsrf( component, url, method, buildRequest ) {
	const send = () => fetch( url, { method, ...buildRequest( component.csrfToken ) } );

	const response = await send();
	if ( response.status !== 403 || !( await refreshCsrfToken( component ) ) ) {
		return response;
	}
	return send();
}

/**
 * Replaces the component's CSRF token with the session's current one.
 *
 * Side effect: updates `component.csrfToken`, which also refreshes any hidden `csrf` field
 * bound to it.
 *
 * @param {Object} component Alpine component instance exposing a mutable `csrfToken` property.
 * @returns {Promise<boolean>} True when a new token was obtained; false if the endpoint was
 * unavailable (e.g. the session itself expired and the request was redirected to login).
 */
export async function refreshCsrfToken( component ) {
	try {
		const response = await fetch( "/cbcsrf/generate", { headers: { Accept: "text/plain" } } );
		const token = ( await response.text() ).trim();
		// A redirect to the login page yields HTML, never a bare alphanumeric token.
		if ( !response.ok || response.redirected || !/^[A-Za-z0-9]+$/.test( token ) || token === component.csrfToken ) {
			return false;
		}
		component.csrfToken = token;
		return true;
	} catch ( error ) {
		return false;
	}
}
