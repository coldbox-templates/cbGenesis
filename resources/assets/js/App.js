import Alpine from "alpinejs";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import * as bootstrap from "bootstrap";
import "@phosphor-icons/web/duotone";

// ============================================================
// Alpine Stores Registration
// ============================================================
import "./stores/theme.js";
import "./stores/sidebar.js";

// ============================================================
// Alpine Component Registrations
// ============================================================

// App Components
import { sidebarBrand }     from "./components/app/SidebarBrand.js";
import { footer }           from "./components/app/Footer.js";
import { adminBody }        from "./components/app/AdminBody.js";
Alpine.data( "adminBody", adminBody );
Alpine.data( "sidebarBrand", sidebarBrand );
Alpine.data( "footer", footer );

// Auth Components
import { passwordStrength } from "./components/ui/PasswordStrength.js";
import { authForm }         from "./components/auth/AuthForm.js";
import { registerForm }     from "./components/auth/RegisterForm.js";
import { forgotPasswordForm } from "./components/auth/ForgotPasswordForm.js";
import { passwordResetForm } from "./components/auth/PasswordResetForm.js";
Alpine.data( "passwordStrength", passwordStrength );
Alpine.data( "authForm", authForm );
Alpine.data( "registerForm", registerForm );
Alpine.data( "forgotPasswordForm", forgotPasswordForm );
Alpine.data( "passwordResetForm", passwordResetForm );


// UI Components
import { messageBox }       from "./components/ui/MessageBox.js";
import { passwordMeter }    from "./components/ui/PasswordMeter.js";
import { switchComponent }  from "./components/ui/Switch.js";
Alpine.data( "messageBox", messageBox );
Alpine.data( "passwordMeter", passwordMeter );
Alpine.data( "switchComponent", switchComponent );

// ============================================================
// Global Alpine Initialization
// ============================================================
window.Alpine    = Alpine;
window.tippy     = tippy;
window.bootstrap = bootstrap;

Alpine.start();
