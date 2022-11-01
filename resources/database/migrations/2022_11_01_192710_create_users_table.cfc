component {

    function up( schema, qb ) {
		schema.create( "users", (table)=>{
			table.string( "userId", 50 ).primaryKey();
			table.string( "firstName" );
			table.string( "lastName" );
			table.string( "email" );
			table.string( "password" );
			table.datetime( "createdDate" ).withCurrent();
			table.datetime( "updatedDate" ).withCurrent();
			table.boolean( "isActive" ).default( true );
			table.datetime( "verifiedAt" ).nullable();
			table.datetime( "lastLogin" ).nullable();
			table.index( "email", "idx_userEmail" );
			table.index( "verifiedAt", "idx_userVerifiedAt" );
			table.index( "isActive", "idx_userActive" );
		} );
    }

    function down( schema, qb ) {
		schema.dropIfExists( "users" );
    }

}
