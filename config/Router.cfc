component {

	function configure(){
		// Set Full Rewrites
		setFullRewrites( true );

		/**
		 * --------------------------------------------------------------------------
		 * App Routes
		 * --------------------------------------------------------------------------
		 *
		 * Here is where you can register the routes for your web application!
		 * Go get Funky!
		 *
		 */

		// A nice healthcheck
		route( "/healthcheck", ( event, rc, prc ) => {
			return "Ok!";
		} );

		// Login + Logout
		get( pattern: "/login", name: "login" ).to( "Sessions.index" );
		post( pattern: "/login", name: "login.create" ).to( "Sessions.create" );
		post( pattern: "/logout", name: "logout" ).to( "Sessions.delete" );

		// User Registration
		get( pattern: "/register", name: "register.request" ).to( "Registration.index" );
		post( pattern: "/register", name: "register.create" )to( "Registration.create" );

		// User Verification
		get( pattern: "/verify-registration/:token", name: "verification.validate" ).to( "VerifyRegistration.index" );
		post( pattern: "/verify-registration", name: "verification.create" )to( "VerifyRegistration.create" );

		// Forgot Password
		get( pattern: "/forgot-password", name: "password.request" ).to( "ForgetPassword.index" );
		post( pattern: "/forgot-password", name: "password.reminder" )to( "ForgetPassword.create" );

		// Reset Password
		get( pattern: "/reset-password/:token", name: "password.reset" ).to( "ResetPassword.index" );
		post( pattern: "/reset-password", name: "password.update" ).to( "ResetPassword.create" );

		// Dashboard
		route( pattern: "/dashboard", name: "dashboard" ).to( "Dashboard.index" );

		// Welcome View
		route( pattern: "/", name: "welcome" ).toView( "main/welcome" );

		// Conventions based routing
		route( ":handler/:action?" ).end();
	}

}
