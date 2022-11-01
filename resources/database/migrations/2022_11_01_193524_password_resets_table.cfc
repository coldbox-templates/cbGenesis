component {

    function up( schema, qb ) {
		schema.create( "passwordResets", (table)=>{
			table.string( "id", 50 ).primaryKey();
			table.string( "email" );
			table.string( "token" );
			table.datetime( "createdDate" ).withCurrent();
			table.index( "token", "idx_passwordResetTokens" );
		} );
    }

    function down( schema, qb ) {
		schema.dropIfExists( "passwordResets" );
    }

}
