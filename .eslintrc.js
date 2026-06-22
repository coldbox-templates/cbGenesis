module.exports = {
	root : true,

	parserOptions : {
		ecmaVersion : "latest",
		sourceType  : "module"
	},

	env : {
		browser : true,
		es2022  : true
	},

	extends : [ "prettier" ],

	globals : {
		Alpine  : "readonly",
		bootstrap : "readonly",
		tippy   : "readonly",
		ga      : true, // Google Analytics
		cordova : true,
		process : true
	},

	ignorePatterns : [
		"node_modules",
		"public/includes/build",
		".engine"
	],

	// add your custom rules here
	rules : {
		"array-bracket-spacing" : [
			"error",
			"always",
			{
				"singleValue"     : true,
				"arraysInArrays"  : true,
				"objectsInArrays" : true
			}
		],
		"array-bracket-newline" : [
			"error",
			{ "multiline": true }
		],
		"array-element-newline" : [
			"error",
			{ "multiline": true, "minItems": 2 }
		],
		"camelcase" : [
			"error" ,
			{ "properties": "always" }
		],
		"indent" : [
			"error",
			"tab",
			{ ignoredNodes: [ "TemplateLiteral" ] }
		],
		"keyword-spacing" : [
			"error",
			{ "after": true, "before": true }
		],
		"key-spacing" : [
			"error",
			{
				"singleLine" : {
					"beforeColon" : false,
					"afterColon"  : true
				},
				"multiLine" : {
					"beforeColon" : true,
					"afterColon"  : true,
					"align"       : "colon"
				}
			}
		],
		"no-trailing-spaces" : [
			"error",
			{
				"skipBlankLines" : false,
				"ignoreComments" : false
			}
		],
		"no-fallthrough"       : "error",
		// allow debugger during development only
		"no-debugger"          : process.env.NODE_ENV === "production" ? "error" : "off",
		"object-curly-newline" : [
			"error",
			{ "multiline": true }
		],
		"object-curly-spacing" : [
			"error",
			"always",
			{
				"objectsInObjects" : true,
				"arraysInObjects"  : true
			}
		],
		"object-property-newline" : [
			"error",
			{ "allowAllPropertiesOnSameLine": true }
		],
		"prefer-promise-reject-errors" : "off",
		"quotes"                       : [
			"error",
			"double"
		],
		"semi" : [
			"error",
			"always"
		],
		"space-in-parens" : [
			"error",
			"always"
		],
		"space-before-function-paren" : [
			"error",
			{
				"anonymous"  : "never",
				"named"      : "never",
				"asyncArrow" : "never"
			}
		]
		// "vue/html-indent": ["error", "tab"],
		// "vue/html-self-closing": [ "error", {
		// 	"html": {
		// 		"void": "any",
		// 		"normal": "always",
		// 		"component": "always"
		// 	}
		// } ]
	}
};
