"use strict";

/** Converts WebAuthn base64url JSON values to browser buffers. */
function fromBase64Url( value ) {
	const padded = value.replace( /-/g, "+" ).replace( /_/g, "/" ) + "==".slice( 0, ( 4 - value.length % 4 ) % 4 );
	const decoded = atob( padded );
	return Uint8Array.from( decoded, character => character.charCodeAt( 0 ) ).buffer;
}

/** Converts browser buffers to WebAuthn base64url JSON values. */
function toBase64Url( value ) {
	const bytes = new Uint8Array( value );
	let binary = "";
	bytes.forEach( byte => binary += String.fromCharCode( byte ) );
	return btoa( binary ).replace( /\+/g, "-" ).replace( /\//g, "_" ).replace( /=+$/, "" );
}

function convertRequest( value ) {
	if ( Array.isArray( value ) ) return value.map( convertRequest );
	if ( value && typeof value === "object" ) {
		const output = { ...value };
		if ( output.challenge ) output.challenge = fromBase64Url( output.challenge );
		if ( output.publicKey?.challenge ) output.publicKey.challenge = fromBase64Url( output.publicKey.challenge );
		if ( output.publicKey?.user?.id ) output.publicKey.user.id = fromBase64Url( output.publicKey.user.id );
		if ( output.publicKey?.excludeCredentials ) output.publicKey.excludeCredentials = output.publicKey.excludeCredentials.map( item => ( { ...item, id: fromBase64Url( item.id ) } ) );
		if ( output.publicKey?.allowCredentials ) output.publicKey.allowCredentials = output.publicKey.allowCredentials.map( item => ( { ...item, id: fromBase64Url( item.id ) } ) );
		return output;
	}
	return value;
}

function convertResponse( value ) {
	const response = value.response;
	const responseFields = [
		"clientDataJSON",
		"attestationObject",
		"authenticatorData",
		"signature",
		"userHandle",
	];
	const responseJson = {};
	responseFields.forEach( field => {
		if ( field in response ) responseJson[ field ] = response[ field ] === null ? null : toBase64Url( response[ field ] );
	} );
	if ( typeof response.getTransports === "function" ) responseJson.transports = response.getTransports();

	return {
		type                   : value.type,
		id                     : value.id,
		rawId                  : toBase64Url( value.rawId ),
		response               : responseJson,
		clientExtensionResults : value.getClientExtensionResults?.() || {},
	};
}

const webauthnJSON = {
	async create( options ) {
		return convertResponse( await navigator.credentials.create( convertRequest( options ) ) );
	},
	async get( options ) {
		return convertResponse( await navigator.credentials.get( convertRequest( options ) ) );
	},
};

window.webauthnJSON = webauthnJSON;

const passkeys = {
	supported : null,
	async isSupported() {
		if ( this.supported !== null ) return this.supported;
		this.supported = Boolean( window.PublicKeyCredential && navigator.credentials?.create && navigator.credentials?.get );
		return this.supported;
	},
	async login( username, redirectLocation = "/", additionalParams = {} ) {
		const response = await fetch( "/cbsecurity/passkeys/authentication/new?" + new URLSearchParams( { ...additionalParams, username: username || "" } ) );
		const payload = await response.json();
		if ( !response.ok ) throw new Error( payload.message || "Passkey sign-in could not start." );
		const options = typeof payload === "string" ? JSON.parse( payload ) : payload;
		const credential = await webauthnJSON.get( options );
		const authenticationResponse = await fetch( "/cbsecurity/passkeys/authentication", {
			method      : "POST",
			credentials : "same-origin",
			headers     : { "Content-Type": "application/json", Accept: "application/json" },
			body        : JSON.stringify( { ...additionalParams, publicKeyCredentialJson: JSON.stringify( credential ) } ),
		} );
		if ( !authenticationResponse.ok ) throw new Error( "Passkey sign-in failed." );
		window.location = redirectLocation;
	},
};

window.cbSecurity = window.cbSecurity || {};
window.cbSecurity.passkeys = passkeys;
