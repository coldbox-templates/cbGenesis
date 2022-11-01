const defaultTheme = require( "tailwindcss/defaultTheme" );

/** @type {import('tailwindcss').Config} */
module.exports = {
	content : [
		// App resources
		"./resources/**/*.vue",
		"./resources/**/*.js",
		// App Layouts and views
		"./layouts/*.cfm",
		"./views/*.cfm",
		// Any Module Views
		"./modules_app/**/*.cfm",
		// Any model templates
		"./models/**/*.cfm"
	],
	theme : {
		extend : {
			fontFamily : {
				sans : [
					"Source Sans",
					...defaultTheme.fontFamily.sans
				],
				mono : [
					"Menlo",
					"Monaco",
					"Consolas",
					"Liberation Mono",
					"Courier New",
					...defaultTheme.fontFamily.mono
				],
				serif : [
					"Georgia",
					"Cambria",
					"Times New Roman",
					...defaultTheme.fontFamily.serif
				]
	  		},
		}
	},
	plugins : [ require( "@tailwindcss/forms" ), ]
};
