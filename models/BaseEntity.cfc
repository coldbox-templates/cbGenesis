/**
 * The cbgenesis basic entity
 */
component accessors="true"{

	property name="id";
	property name="createdDate";
	property name="updatedDate";
	property name="isActive" type="boolean" default="true";

	/**
	 * Constructor
	 */
	function init(){
		variables.id        = "";
		variables.isActive = true;
		variables.createdDate = variables.updatedDate = now();

		return this;
	}

	/**
	 * Verify if this is a valid user or not
	 */
	boolean function isLoaded(){
		return ( !isNull( variables.id ) && len( variables.id ) );
	}


}
