/**
 * A cbgenesis basic entity which provides uniformity to all objects
 */
component accessors="true" {

	/**
	 * --------------------------------------------------------------------------
	 * DI
	 * --------------------------------------------------------------------------
	 */
	property name="log" inject="logbox:logger:{this}";
	property name="populator" inject="wirebox:populator";
	property name="validationManager" inject="ValidationManager@cbvalidation";

	/**
	 * --------------------------------------------------------------------------
	 * Properties
	 * --------------------------------------------------------------------------
	 */

	property name="id";
	property name="createdDate";
	property name="modifiedDate";
	property
		name   ="isActive"
		type   ="boolean"
		default="true";

	/**
	 * Constructor
	 */
	function init(){
		variables.isActive    = true;
		variables.id = variables.createdDate = variables.modifiedDate = "";

		return this;
	}

	/**
	 * Do we have a new or loaded entity
	 */
	boolean function isLoaded(){
		return ( !isNull( variables.id ) && len( variables.id ) );
	}

	/**
	 * Get the entity name
	 */
	function getEntityName(){
		if ( isNull( variables.entityName ) ) {
			var md               = getMetadata( this );
			variables.entityName = ( md.keyExists( "entityName" ) ? md.entityName : listLast( md.name, "." ) );
		}

		return variables.entityName;
	}

	/***** Persistence Events : Modeled After ORM Events ******/

	/**
	 * Called before an entity is inserted
	 */
	function preInsert( entity ){
		var now = now();
		// prevent override of explicit stamps from imports
		if ( isNull( variables.createdDate ) ) {
			variables.createdDate = now;
		}
		if ( isNull( variables.modifiedDate ) ) {
			variables.modifiedDate = now;
		}
	}

	/**
	 * Called after an entity is inserted
	 */
	function postInsert( entity ){
	}

	/**
	 * Called before an entity is updated
	 */
	function preUpdate( entity ){
		variables.modifiedDate = now();
	}

	/**
	 * Called after an entity is updated
	 */
	function postUpdate( entity ){
	}

	/**
	 * Called before an entity is deleted
	 */
	function preDelete( entity ){
	}

	/**
	 * Called after an entity is deleted
	 */
	function postDelete( entity ){
	}


}
