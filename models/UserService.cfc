/**
 * This User Service provider connects to the database configured in your appliction.
 * It also leverages bcrypt for password encryption and the BasicAuthUser from cbSecurity as our Object Model.
 */
component accessors="true" singleton {

	/*********************************************************************************************/
	/** DI **/
	/*********************************************************************************************/

	property name="populator" inject="wirebox:populator";
	property name="wirebox"   inject="wirebox";
	property name="qb"        inject="QueryBuilder@qb";
	property name="bcrypt"    inject="BCrypt@BCrypt";

	/**
	 * Constructor
	 */
	function init(){
		return this;
	}

	/**
	 * Hash the incoming target according to our hashing algorithm and settings
	 *
	 * @target The string target to hash
	 */
	private string function hashSecurely( required string target ){
		return variables.bcrypt.hashPassword( arguments.target );
	}

	/**
	 * New User Dispenser
	 */	w
	BasicAuthUser function new() provider="BasicAuthUser@cbsecurity"{
	}

	/**
	 * Get a new user by id
	 *
	 * @id The id to get the user with
	 *
	 * @return The located user or a new un-loaded user object
	 */
	BasicAuthUser function retrieveUserById( required id ){
		return populator.populateFromStruct(
			new (),
			qb.table( "users" )
				.where( "id", arguments.id )
				.first()
		);
	}

	/**
	 * Get a user by username
	 *
	 * @username The username to get the user with
	 *
	 * @return The valid user object representing the username or an empty user object
	 */
	BasicAuthUser function retrieveUserByUsername( required username ){
		return populator.populateFromStruct(
			new (),
			qb.table( "users" )
				.where( "username", arguments.username )
				.first()
		);
	}

	/**
	 * Verify if the incoming username and password are valid credentials in this user storage
	 *
	 * @username The username to test
	 * @password The password to test
	 *
	 * @return true if valid, else false
	 */
	boolean function isValidCredentials( required username, required password ){
		var oUser = retrieveUserByUsername( arguments.username );
		if ( !oUser.isLoaded() ) {
			return false;
		}

		return variables.bcrypt.checkPassword( hashSecurely( arguments.password ), oUser.getPassword() );
	}

}
