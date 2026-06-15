/**
 * A system user
 *
 * It implements the following interfaces
 * - cbsecurity.interfaces.jwt.IJwtSubject
 * - cbsecurity.interfaces.IAuthUser
 */
component accessors="true" extends="BaseEntity" {

	/**
	 * --------------------------------------------------------------------------
	 * Properties
	 * --------------------------------------------------------------------------
	 */

	property name="firstName";
	property name="lastName";
	property name="email";
	property name="password";
	property name="permissions";
	property name="verifiedAt";
	property name="lastLogin";

	/**
	 * --------------------------------------------------------------------------
	 * Validation Constraints
	 * --------------------------------------------------------------------------
	 * https://coldbox-validation.ortusbooks.com/overview/valid-constraints
	 */
	this.constraints = {
		firstName : { required : true },
		lastName  : { required : true },
		email     : {
			required : true,
			unique   : { table : "users", column : "email" }
		},
		password : { required : true }
	};
	// https://coldbox-validation.ortusbooks.com/overview/validating-constraints/validating-with-profiles
	this.constraintProfiles = { "update" : "firstName,lastName,email" };

	/**
	 * --------------------------------------------------------------------------
	 * Population Options
	 * --------------------------------------------------------------------------
	 */
	this.population = {
		exclude : [ "id", "lastLogin", "verifiedAt", "isActive" ]
	}

	/**
	 * --------------------------------------------------------------------------
	 * Mementifier Options
	 * --------------------------------------------------------------------------
	 * https://forgebox.io/view/mementifier
	 */
	this.memento = {
		// Default properties to serialize
		defaultIncludes : [ "*" ],
		// Default Exclusions
		defaultExcludes : [],
		// Never Include
		neverInclude    : [ "password" ]
	};

	/**
	 * Constructor
	 */
	function init(){
		super.init();
		variables.firstName  = "";
		variables.lastName   = "";
		variables.username   = "";
		variables.password   = "";
		variables.lastLogin  = "";
		variables.verifiedAt = "";
		setPermissions( [] );

		return this;
	}

	/**
	 * Has the user been verified via email or not
	 */
	boolean function isEmailVerified(){
		return len( variables.verifiedAt ) && isDate( variables.verifiedAt );
	}

	/**
	 * Permissions are stored as json
	 *
	 * @permission The list or array of permissions to store
	 */
	function setPermissions( permissions ){
		if ( isSimpleValue( arguments.permissions ) ) {
			arguments.permissions = listToArray( arguments.permissions );
		}
		variables.permissions = serializeJSON( arguments.permissions );
		return this;
	}

	/**
	 * Get the permissions for this user
	 */
	array function getPermissions(){
		return deserializeJSON( variables.permissions );
	}

	/**
	 * A struct of custom claims to add to the JWT token
	 */
	struct function getJWTCustomClaims( required struct payload ){
		return {};
	}

	/**
	 * This function returns an array of all the scopes that should be attached to the JWT token that will be used for authorization.
	 */
	array function getJWTScopes(){
		return getPermissions();
	}

	/**
	 * Retrieve the user's full name
	 */
	string function getFullName(){
		return getFirstname() & " " & getLastName();
	}

	/**
	 * Verify if the user has one or more of the passed in permissions
	 *
	 * @permission One or a list of permissions to check for access
	 */
	boolean function hasPermission( required permission ){
		if ( isSimpleValue( arguments.permission ) ) {
			arguments.permission = listToArray( arguments.permission );
		}

		var localPermissions = getPermissions();

		return arguments.permission
			.filter( function( item ){
				return ( localPermissions.findNoCase( item ) );
			} )
			.len();
	}

}
