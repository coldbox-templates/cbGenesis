import Alpine from "alpinejs";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import * as bootstrap from "bootstrap";
import "@phosphor-icons/web/duotone";

// ============================================================
// Alpine Plugins Registration
// ============================================================
import "./AlpinePlugins.js";

// ============================================================
// Alpine Stores Registration
// ============================================================
import "./stores/theme.js";
import "./stores/sidebar.js";

// ============================================================
// Alpine Global Component Registrations
// ============================================================
import { sidebarBrand }     from "./components/app/SidebarBrand.js";
import { footer }           from "./components/app/Footer.js";
import { adminBody }        from "./components/app/AdminBody.js";
Alpine.data( "adminBody", adminBody );
Alpine.data( "sidebarBrand", sidebarBrand );
Alpine.data( "footer", footer );

// ============================================================
// Alpine Form Components Registration
// ============================================================
import { authForm }         from "./components/auth/AuthForm.js";
import { registerForm }     from "./components/auth/RegisterForm.js";
import { forgotPasswordForm } from "./components/auth/ForgotPasswordForm.js";
import { passwordResetForm } from "./components/auth/PasswordResetForm.js";
import { settingsForm }   from "./components/settings/SettingsForm.js";
import { settingsRegistryForm } from "./components/settings/SettingsRegistryForm.js";
import { permissionsForm } from "./components/security/permissionsForm.js";
import { rolesForm }         from "./components/security/RolesForm.js";
import { usersForm }         from "./components/security/UsersForm.js";
import { profileForm }       from "./components/profile/ProfileForm.js";
Alpine.data( "authForm", authForm );
Alpine.data( "registerForm", registerForm );
Alpine.data( "forgotPasswordForm", forgotPasswordForm );
Alpine.data( "passwordResetForm", passwordResetForm );
Alpine.data( "settingsForm", settingsForm );
Alpine.data( "settingsRegistryForm", settingsRegistryForm );
Alpine.data( "permissionsForm", permissionsForm );
Alpine.data( "rolesForm", rolesForm );
Alpine.data( "usersForm", usersForm );
Alpine.data( "profileForm", profileForm );

// ============================================================
// Alpine UI Components Registration
// ============================================================
import { messageBox }       from "./components/ui/MessageBox.js";
import { passwordMeter }    from "./components/ui/PasswordMeter.js";
import { switchComponent }  from "./components/ui/Switch.js";
import { drawer }           from "./components/ui/Drawer.js";
import { passwordStrength } from "./components/ui/PasswordStrength.js";
import { globalProgress, progress } from "./components/ui/GlobalProgress.js";
import { globalToast, toast } from "./components/ui/GlobalToast.js";
Alpine.data( "messageBox", messageBox );
Alpine.data( "passwordMeter", passwordMeter );
Alpine.data( "switchComponent", switchComponent );
Alpine.data( "drawer", drawer );
Alpine.data( "passwordStrength", passwordStrength );
Alpine.data( "globalProgress", globalProgress );
Alpine.data( "globalToast", globalToast );

// ============================================================
// Alpine Magic Properties Registration
// ============================================================
import { formatDate, formatDateTime, formatRelativeDate } from "./utils/dateFormat.js";
import { countLabel } from "./utils/countLabel.js";
import { passwordMeetsPolicy } from "./utils/passwordPolicy.js";
import { sortClass, sortIcon } from "./utils/sort.js";
Alpine.magic( "formatDate", () => formatDate );
Alpine.magic( "formatDateTime", () => formatDateTime );
Alpine.magic( "relativeDate", () => formatRelativeDate );
Alpine.magic( "countLabel", () => countLabel );
Alpine.magic( "sortClass", () => sortClass );
Alpine.magic( "sortIcon", () => sortIcon );
Alpine.magic( "isEmail", () => ( value ) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test( String( value ?? "" ).trim() ) );
Alpine.magic( "passwordMeetsPolicy", () => passwordMeetsPolicy );
Alpine.magic( "toast", () => toast );
Alpine.magic( "progress", () => ( {
	start : ( detail = {} ) => progress( "start", detail ),
	stop  : () => progress( "stop" ),
	set   : ( value ) => progress( "set", value ),
} ) );

/**
 * Focuses a descendant after Alpine has applied the current state change.
 *
 * @param {Element} element Element from which the Alpine component root is resolved.
 * @returns {Function} Focus helper accepting a descendant selector.
 */
Alpine.magic( "focus", ( element ) => ( selector ) => {
	const root = element.closest( "[x-data]" ) || element;
	Alpine.nextTick( () => root.querySelector( selector )?.focus() );
} );

/**
 * Copies text through the browser clipboard API when it is available.
 *
 * @param {string} value Text to copy.
 * @returns {Promise<boolean>} Whether the text was copied successfully.
 */
Alpine.magic( "copy", () => async( value ) => {
	if ( !value || !navigator.clipboard ) return false;

	try {
		await navigator.clipboard.writeText( value );
		return true;
	} catch {
		return false;
	}
} );

// ============================================================
// Global Alpine Initialization
// ============================================================
window.Alpine    = Alpine;
window.tippy     = tippy;
window.bootstrap = bootstrap;
window.$toast = toast;
window.$progress = {
	start : ( detail = {} ) => progress( "start", detail ),
	stop  : () => progress( "stop" ),
	set   : ( value ) => progress( "set", value ),
};


// ============================================================
// Global Tooltip Initialization
// ============================================================

/**
 * Initializes or refreshes Tippy instances declared with data-tooltip.
 *
 * @param {Document|HTMLElement} root Root whose descendant tooltips should be processed.
 * @returns {void}
 */
function initializeTooltips( root = document ) {
	root.querySelectorAll( "[data-tooltip]" ).forEach( ( element ) => {
		if ( element._tippy ) {
			element._tippy.setContent( element.getAttribute( "data-tooltip" ) );
			return;
		}
		tippy( element, { content: element.getAttribute( "data-tooltip" ), placement: "top" } );
	} );
}

window.initializeTooltips = initializeTooltips;

/**
 * Watches Alpine-rendered DOM for tooltip elements and content updates.
 *
 * @type {MutationObserver}
 */
const tooltipObserver = new MutationObserver( ( mutations ) => {
	mutations.forEach( ( mutation ) => {
		if ( mutation.type === "attributes" ) {
			initializeTooltips( mutation.target.parentElement || mutation.target );
			return;
		}
		mutation.addedNodes.forEach( ( node ) => {
			if ( node.nodeType !== Node.ELEMENT_NODE ) return;
			if ( node.matches( "[data-tooltip]" ) ) initializeTooltips( node.parentElement );
			initializeTooltips( node );
		} );
	} );
} );

tooltipObserver.observe( document.body, {
	childList       : true,
	subtree         : true,
	attributes      : true,
	attributeFilter : [ "data-tooltip" ]
} );


// ============================================================
// Now we can start up the engines
// ============================================================
Alpine.start();
