/**
 * Copyright 2005-2007 ColdBox Framework by Luis Majano and Ortus Solutions, Corp
 * www.ortussolutions.com
 * ---
 */
component {

	/**
	 * --------------------------------------------------------------------------
	 * Application Properties: Modify as you see fit!
	 * --------------------------------------------------------------------------
	 */
	this.name              = "Genesis Starter App";
	this.sessionManagement = true;
	this.sessionTimeout    = createTimespan( 0, 0, 30, 0 );
	this.setClientCookies  = true;
	this.setDomainCookies  = true;
	this.scriptProtect     = false;
	this.secureJSON        = false;
	this.timezone          = "UTC";

	/**
	 * --------------------------------------------------------------------------
	 * Lucee Specific Settings
	 * --------------------------------------------------------------------------
	 */
	// buffer the output of a tag/function body to output in case of a exception
	this.bufferOutput                   = true;
	// Activate Gzip Compression
	this.compression                    = false;
	// Turn on/off white space management
	this.whiteSpaceManagement           = "smart";
	// Turn on/off remote cfc content whitespace
	this.suppressRemoteComponentContent = false;

	/**
	 * --------------------------------------------------------------------------
	 * ColdBox Bootstrap Settings
	 * --------------------------------------------------------------------------
	 * Modify only if you need to, else default them.
	 */
	// COLDBOX STATIC PROPERTY, DO NOT CHANGE UNLESS THIS IS NOT THE ROOT OF YOUR COLDBOX APP
	COLDBOX_APP_ROOT_PATH = getDirectoryFromPath( getCurrentTemplatePath() );
	// The web server mapping to this application. Used for remote purposes or static purposes
	COLDBOX_APP_MAPPING   = "";
	// COLDBOX PROPERTIES
	COLDBOX_CONFIG_FILE   = "";
	// COLDBOX APPLICATION KEY OVERRIDE
	COLDBOX_APP_KEY       = "";
	// Fail fast when reiniting
	COLDBOX_FAIL_FAST     = true;

	/**
	 * --------------------------------------------------------------------------
	 * Location Mappings
	 * --------------------------------------------------------------------------
	 * - cbgenesis : Quick reference to root application
	 * - coldbox : Where ColdBox library is installed
	 */
	this.mappings[ "/cbgenesis" ] = COLDBOX_APP_ROOT_PATH;
	this.mappings[ "/coldbox" ]   = COLDBOX_APP_ROOT_PATH & "coldbox";

	/**
	 * --------------------------------------------------------------------------
	 * ORM + Datasource Settings
	 * --------------------------------------------------------------------------
	 * - Please update the cfcLocation as needed to locate more ORM entities for your app
	 * - Dialect is incredibly important! Do not let Hibernate auto configur it, you can get nasty errors.
	 * So Make sure you select one.
	 */
	// Default Datasource
	this.datasource = "coldbox";

	// application start
	public boolean function onApplicationStart(){
		setting requestTimeout ="300";
		application.cbBootstrap= new coldbox.system.Bootstrap(
			COLDBOX_CONFIG_FILE,
			COLDBOX_APP_ROOT_PATH,
			COLDBOX_APP_KEY,
			COLDBOX_APP_MAPPING
		);
		application.cbBootstrap.loadColdbox();
		return true;
	}

	// application end
	public void function onApplicationEnd( struct appScope ){
		arguments.appScope.cbBootstrap.onApplicationEnd( arguments.appScope );
	}

	// request start
	public boolean function onRequestStart( string targetPage ){
		// In case bootstrap or controller are missing, perform a manual restart
		if (
			isNull( application.cbBootstrap )
			||
			isNull( application.cbController )
		) {
			onApplicationStart();
		}

		// Process ColdBox Request
		application.cbBootstrap.onRequestStart( arguments.targetPage );

		return true;
	}

	public void function onSessionStart(){
		if( !isNull( application.cbBootstrap ) ){
			application.cbBootStrap.onSessionStart();
		}
	}

	public void function onSessionEnd( struct sessionScope, struct appScope ){
		arguments.appScope.cbBootStrap.onSessionEnd( argumentCollection = arguments );
	}

	public boolean function onMissingTemplate( template ){
		return application.cbBootstrap.onMissingTemplate( argumentCollection = arguments );
	}

}
