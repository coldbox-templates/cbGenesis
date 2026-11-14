/**
 * Replaces native title popups with one themed tooltip shared by the site.
 * Existing title text is also retained as an accessible description.
 */
( function() {
	const tooltip = document.createElement( "div" );
	tooltip.className = "bxsites-tooltip";
	tooltip.id = "bxsites-tooltip";
	tooltip.setAttribute( "role", "tooltip" );
	tooltip.hidden = true;
	document.body.appendChild( tooltip );

	let hoveredTarget = null;
	let focusedTarget = null;
	let activeTarget = null;
	let hideTimer = null;

	/** Migrates title attributes so the browser does not show its own popup. */
	function prepareTitles( root ) {
		const titledElements = [];
		if ( root instanceof Element && root.hasAttribute( "title" ) ) {
			titledElements.push( root );
		}
		if ( root.querySelectorAll ) {
			titledElements.push( ...root.querySelectorAll( "[title]" ) );
		}

		for ( const element of titledElements ) {
			const title = element.getAttribute( "title" ).trim();
			if ( !title ) {
				element.removeAttribute( "title" );
				continue;
			}

			element.setAttribute( "data-tooltip", title );
			if (
				!element.hasAttribute( "aria-description" ) &&
				element.getAttribute( "aria-label" )?.trim() !== title
			) {
				element.setAttribute( "aria-description", title );
			}
			element.removeAttribute( "title" );
		}
	}

	/** Finds the nearest element with tooltip content for a pointer or focus event. */
	function findTooltipTarget( target ) {
		return target instanceof Element ? target.closest( "[data-tooltip]" ) : null;
	}

	/** Places the tooltip above its target, or below when there is not enough room. */
	function positionTooltip( target ) {
		const targetRect = target.getBoundingClientRect();
		const tooltipRect = tooltip.getBoundingClientRect();
		const margin = 8;
		const gap = 9;
		const left = Math.min(
			Math.max( targetRect.left + targetRect.width / 2, margin + tooltipRect.width / 2 ),
			window.innerWidth - margin - tooltipRect.width / 2
		);
		const fitsAbove = targetRect.top >= tooltipRect.height + gap + margin;
		const top = fitsAbove
			? targetRect.top - tooltipRect.height - gap
			: Math.min( targetRect.bottom + gap, window.innerHeight - tooltipRect.height - margin );

		tooltip.dataset.placement = fitsAbove ? "top" : "bottom";
		tooltip.style.left = `${left}px`;
		tooltip.style.top = `${Math.max( margin, top )}px`;
	}

	/** Shows the shared tooltip for the current pointer or keyboard target. */
	function showTooltip( target ) {
		const message = target?.getAttribute( "data-tooltip" )?.trim();
		if ( !target || !message ) {
			hideTooltip();
			return;
		}

		clearTimeout( hideTimer );
		activeTarget = target;
		tooltip.textContent = message;
		tooltip.hidden = false;
		tooltip.classList.remove( "is-visible" );
		positionTooltip( target );
		requestAnimationFrame( () => {
			if ( activeTarget === target ) {
				tooltip.classList.add( "is-visible" );
			}
		} );
	}

	/** Hides the tooltip after its short fade-out transition. */
	function hideTooltip() {
		activeTarget = null;
		tooltip.classList.remove( "is-visible" );
		clearTimeout( hideTimer );
		hideTimer = window.setTimeout( () => {
			if ( !activeTarget ) {
				tooltip.hidden = true;
			}
		}, 160 );
	}

	/** Chooses keyboard focus over pointer hover when both are active. */
	function refreshTooltip() {
		const target = focusedTarget || hoveredTarget;
		if ( target ) {
			showTooltip( target );
		} else {
			hideTooltip();
		}
	}

	prepareTitles( document );

	document.addEventListener( "pointerover", ( event ) => {
		const target = findTooltipTarget( event.target );
		if ( target && !target.contains( event.relatedTarget ) ) {
			hoveredTarget = target;
			refreshTooltip();
		}
	} );

	document.addEventListener( "pointerout", ( event ) => {
		const target = findTooltipTarget( event.target );
		if ( target && !target.contains( event.relatedTarget ) && hoveredTarget === target ) {
			hoveredTarget = null;
			refreshTooltip();
		}
	} );

	document.addEventListener( "focusin", ( event ) => {
		focusedTarget = findTooltipTarget( event.target );
		refreshTooltip();
	} );

	document.addEventListener( "focusout", ( event ) => {
		const target = findTooltipTarget( event.target );
		if ( target && !target.contains( event.relatedTarget ) && focusedTarget === target ) {
			focusedTarget = null;
			refreshTooltip();
		}
	} );

	document.addEventListener( "keydown", ( event ) => {
		if ( event.key === "Escape" && focusedTarget ) {
			focusedTarget = null;
			refreshTooltip();
		}
	} );

	window.addEventListener( "resize", () => {
		if ( activeTarget ) {
			positionTooltip( activeTarget );
		}
	} );
	window.addEventListener( "scroll", () => {
		if ( activeTarget ) {
			positionTooltip( activeTarget );
		}
	}, true );

	new MutationObserver( ( mutations ) => {
		for ( const mutation of mutations ) {
			if ( mutation.type === "attributes" ) {
				prepareTitles( mutation.target );
			} else {
				for ( const node of mutation.addedNodes ) {
					if ( node instanceof Element ) {
						prepareTitles( node );
					}
				}
			}
		}
	} ).observe( document.documentElement, {
		attributes : true,
		attributeFilter : [ "title" ],
		childList : true,
		subtree : true
	} );
} )();