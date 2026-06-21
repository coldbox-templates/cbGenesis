import Alpine from "alpinejs";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import * as bootstrap from "bootstrap";
import "@phosphor-icons/web/regular";

import { passwordStrength } from "./components/PasswordStrength.js";
import { authForm }         from "./components/AuthForm.js";
import { messageBox }       from "./components/MessageBox.js";

// ============================================================
// Alpine Components
// ============================================================

Alpine.data( "passwordStrength", passwordStrength );
Alpine.data( "authForm",         authForm );
Alpine.data( "messageBox",       messageBox );

// ============================================================
// Alpine Store: theme
// Manages light/dark mode with localStorage persistence.
// The layout's inline FOUC-prevention script sets data-bs-theme
// before CSS loads; this store keeps Alpine's state in sync.
// ============================================================

Alpine.store( "theme", {
    mode: "light",

    init() {
        const saved      = localStorage.getItem( "theme" );
        const prefersDark = window.matchMedia( "(prefers-color-scheme: dark)" ).matches;
        this.mode = saved ?? ( prefersDark ? "dark" : "light" );
        this._apply();
    },

    toggle() {
        this.mode = this.mode === "dark" ? "light" : "dark";
        localStorage.setItem( "theme", this.mode );
        this._apply();
    },

    _apply() {
        document.documentElement.setAttribute( "data-bs-theme", this.mode );
    },
} );

// ============================================================
// Alpine Store: sidebar
// Desktop: collapses to icon-only strip (width transition).
// Mobile:  toggles as a slide-in drawer with overlay.
// Collapse state persisted to localStorage.
// ============================================================

Alpine.store( "sidebar", {
    collapsed: false,
    open:      false,

    init() {
        const saved = localStorage.getItem( "sidebar-collapsed" );
        if ( saved !== null ) {
            this.collapsed = saved === "true";
        }
    },

    toggle() {
        if ( window.innerWidth >= 992 ) {
            this.collapsed = !this.collapsed;
            localStorage.setItem( "sidebar-collapsed", String( this.collapsed ) );
        } else {
            this.open = !this.open;
        }
    },

    close() {
        this.open = false;
    },
} );

window.Alpine    = Alpine;
window.tippy     = tippy;
window.bootstrap = bootstrap;

Alpine.start();
