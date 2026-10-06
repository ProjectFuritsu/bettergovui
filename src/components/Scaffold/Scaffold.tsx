import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type HTMLAttributes,
    type MouseEvent,
    type RefObject,
} from "react";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {InsideNavContext} from "../Navbar/Navbar";
import {lockScroll} from "../../utils/scrollLock";
import {toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./Scaffold.module.css";

// Below this width the navbar turns into a slide-in menu (opened with ScaffoldBurger).
// Keep it in sync with Scaffold.module.css.
const PHONE_QUERY = "(width < 48em)";

interface ScaffoldContextValue {
    navbarId: string;
    mainId: string;
    navbarOpen: boolean;
    setNavbarOpen: (open: boolean) => void;
    rootRef: RefObject<HTMLDivElement | null>;
    mainRef: RefObject<HTMLElement | null>;
    burgerRef: RefObject<HTMLButtonElement | null>;
}

const ScaffoldContext = createContext<ScaffoldContextValue | null>(null);

function useScaffold(part: string) {
    const context = useContext(ScaffoldContext);
    if (!context) throw new Error(`<${part}> must be inside a <Scaffold>.`);
    return context;
}

export interface ScaffoldProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The text of the "skip to main content" link: the first thing keyboard and screen reader users reach,
     * so they can jump past the header and navbar. It only shows when it has focus. `false` leaves it out.
     * Default "Skip to main content".
     */
    skipLinkLabel?: string | false;
    /** Whether the navbar is open on phones. Pass this with onNavbarOpenChange to control it yourself. */
    navbarOpen?: boolean;
    /** Called when the navbar opens or closes on phones. */
    onNavbarOpenChange?: (open: boolean) => void;
}

/**
 * The frame of a whole page: a header on top, a navbar on the left, the main content, an aside on the
 * right and a footer at the bottom. Leave out the parts you don't need.
 *
 * On tablets the aside moves under the main content; on phones the navbar becomes a menu that slides
 * in from the left, opened by a ScaffoldBurger in the header.
 */
export function Scaffold({
    skipLinkLabel,
    navbarOpen,
    onNavbarOpenChange,
    className,
    children,
    ...rest
}: ScaffoldProps) {
    const t = useMessages();
    const skipText = skipLinkLabel ?? t.skipToContent;
    const id = useId();
    const rootRef = useRef<HTMLDivElement>(null);
    const mainRef = useRef<HTMLElement>(null);
    const burgerRef = useRef<HTMLButtonElement>(null);
    const [internalOpen, setInternalOpen] = useState(false);
    const open = navbarOpen ?? internalOpen;

    // The latest props, so setNavbarOpen can stay the same function from render to render.
    // (A new one each time would re-run the navbar's open effect, moving focus again.)
    const latest = useRef({navbarOpen, onNavbarOpenChange});
    useLayoutEffect(() => {
        latest.current = {navbarOpen, onNavbarOpenChange};
    });

    const setNavbarOpen = useCallback((next: boolean) => {
        if (latest.current.navbarOpen === undefined) setInternalOpen(next);
        latest.current.onNavbarOpenChange?.(next);
    }, []);

    const context: ScaffoldContextValue = {
        navbarId: `${id}-navbar`,
        mainId: `${id}-main`,
        navbarOpen: open,
        setNavbarOpen,
        rootRef,
        mainRef,
        burgerRef,
    };

    // Moves focus to the main content without changing the URL (a "#…" in the address would confuse routers).
    // The href still works when JavaScript hasn't loaded yet.
    function skipToMain(event: MouseEvent<HTMLAnchorElement>) {
        if (!mainRef.current) return;
        event.preventDefault();
        mainRef.current.focus();
    }

    return (
        <ScaffoldContext.Provider value={context}>
            <div ref={rootRef} className={cx(styles.scaffold, className)} {...rest}>
                {skipText !== false && (
                    <a className={styles.skipLink} href={`#${context.mainId}`} onClick={skipToMain}>
                        {skipText}
                    </a>
                )}
                {children}
            </div>
        </ScaffoldContext.Provider>
    );
}

export interface ScaffoldHeaderProps extends HTMLAttributes<HTMLElement> {
    /** Keep the header at the top of the screen while the page scrolls. */
    sticky?: boolean;
}

/** The bar across the top of the page: logo, site name, ScaffoldBurger, search, sign in… A `<header>`. */
export function ScaffoldHeader({sticky = false, className, ...rest}: ScaffoldHeaderProps) {
    const {rootRef} = useScaffold("ScaffoldHeader");
    const ref = useRef<HTMLElement>(null);

    // A sticky header covers the top of the page, so the navbar and aside stick just below it.
    // The header's height can change (e.g. it wraps onto two lines), so keep measuring it.
    useLayoutEffect(() => {
        const header = ref.current;
        const root = rootRef.current;
        if (!sticky || !header || !root) return;

        const update = () => root.style.setProperty("--scaffold-sticky-top", `${header.getBoundingClientRect().height}px`);
        update();
        const observer = new ResizeObserver(update);
        observer.observe(header);
        return () => {
            observer.disconnect();
            root.style.removeProperty("--scaffold-sticky-top");
        };
    }, [sticky, rootRef]);

    return <header ref={ref} className={cx(styles.header, className)} data-sticky={sticky || undefined} {...rest} />;
}

export interface ScaffoldNavbarProps extends HTMLAttributes<HTMLElement> {
    /** The navbar's width. A number in pixels or any CSS length. Default "16rem" (256px). */
    width?: number | string;
    /** The label of the button that closes the navbar on phones. Default "Close menu". */
    closeLabel?: string;
}

/**
 * The side menu on the left: a `<nav>`, named "Main" for screen readers (change it with aria-label).
 * Links inside it get menu styling; mark the current page with `aria-current="page"` (React Router's
 * NavLink does this for you). On phones it slides in from the left when the ScaffoldBurger is pressed.
 */
export function ScaffoldNavbar({
    width,
    closeLabel,
    "aria-label": ariaLabel,
    className,
    style,
    children,
    onClick,
    onBlur,
    ...rest
}: ScaffoldNavbarProps) {
    const t = useMessages();
    const {navbarId, navbarOpen, setNavbarOpen, burgerRef} = useScaffold("ScaffoldNavbar");
    const navRef = useRef<HTMLElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);

    const close = useCallback(
        (returnFocus: boolean) => {
            setNavbarOpen(false);
            if (returnFocus) burgerRef.current?.focus();
        },
        [setNavbarOpen, burgerRef],
    );

    // While it's open on a phone: the page behind can't scroll, focus goes into the menu, Escape closes it,
    // and turning the phone (or widening the window) past the breakpoint closes it too.
    useEffect(() => {
        if (!navbarOpen) return;
        const phone = window.matchMedia(PHONE_QUERY);
        if (!phone.matches) {
            setNavbarOpen(false);
            return;
        }

        const unlock = lockScroll(document);
        closeRef.current?.focus();

        function onKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") close(true);
        }
        function onBreakpoint() {
            if (!phone.matches) close(false);
        }

        document.addEventListener("keydown", onKeyDown);
        phone.addEventListener("change", onBreakpoint);
        return () => {
            unlock();
            document.removeEventListener("keydown", onKeyDown);
            phone.removeEventListener("change", onBreakpoint);
        };
    }, [navbarOpen, setNavbarOpen, close]);

    const settings = {"--scaffold-navbar-width": width === undefined ? undefined : toCssLength(width)} as CSSProperties;

    return (
        <>
            {/* The dark layer behind the open menu on phones; tapping it closes the menu */}
            <div className={styles.backdrop} data-open={navbarOpen || undefined} aria-hidden="true" onClick={() => close(true)} />
            <nav
                ref={navRef}
                id={navbarId}
                aria-label={ariaLabel ?? t.mainNavigation}
                className={cx(styles.navbar, className)}
                data-open={navbarOpen || undefined}
                style={{...settings, ...style}}
                // Following a link closes the menu, so the new page isn't hidden behind it
                onClick={event => {
                    onClick?.(event);
                    if (navbarOpen && (event.target as Element).closest("a")) close(false);
                }}
                // So does tabbing out of it: the menu covers the page, so focus shouldn't be behind it
                onBlur={event => {
                    onBlur?.(event);
                    const next = event.relatedTarget;
                    if (navbarOpen && next && !navRef.current?.contains(next)) close(false);
                }}
                {...rest}>
                <div className={styles.navbarInner}>
                    <div className={styles.navbarTop}>
                        <button
                            ref={closeRef}
                            type="button"
                            className={styles.iconButton}
                            aria-label={closeLabel ?? t.closeMenu}
                            onClick={() => close(true)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                        </button>
                    </div>
                    <InsideNavContext.Provider value={true}>{children}</InsideNavContext.Provider>
                </div>
            </nav>
        </>
    );
}

export interface ScaffoldMainProps extends HTMLAttributes<HTMLElement> {
    /** Space around the content. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "lg" (16px), "md" (12px) on phones. */
    padding?: Size;
}

/** The page's own content, the part that changes from page to page. A `<main>`: use one per page. */
export function ScaffoldMain({padding, className, style, ...rest}: ScaffoldMainProps) {
    const {mainId, mainRef} = useScaffold("ScaffoldMain");
    const settings = {"--scaffold-main-padding": padding === undefined ? undefined : toSpacing(padding)} as CSSProperties;
    return (
        <main
            ref={mainRef}
            id={mainId}
            // So the skip link can move focus here
            tabIndex={-1}
            className={cx(styles.main, className)}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}

export interface ScaffoldAsideProps extends HTMLAttributes<HTMLElement> {
    /** The aside's width on wide screens. A number in pixels or any CSS length. Default "18rem" (288px). */
    width?: number | string;
}

/**
 * Side content on the right, e.g. help, related links or a summary. An `<aside>`.
 * On tablets and phones it moves under the main content.
 */
export function ScaffoldAside({width, className, style, children, ...rest}: ScaffoldAsideProps) {
    useScaffold("ScaffoldAside");
    const settings = {"--scaffold-aside-width": width === undefined ? undefined : toCssLength(width)} as CSSProperties;
    return (
        <aside className={cx(styles.aside, className)} style={{...settings, ...style}} {...rest}>
            <div className={styles.asideInner}>{children}</div>
        </aside>
    );
}

/** The bar across the bottom of the page: contact details, links, copyright. A `<footer>`. */
export function ScaffoldFooter({className, ...rest}: HTMLAttributes<HTMLElement>) {
    useScaffold("ScaffoldFooter");
    return <footer className={cx(styles.footer, className)} {...rest} />;
}

export interface ScaffoldBurgerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /** What screen readers call the button. Default "Menu". */
    label?: string;
}

/**
 * The ☰ button that opens the navbar on phones. Put it in the ScaffoldHeader; it hides itself on
 * wider screens, where the navbar is always shown.
 */
export function ScaffoldBurger({label, className, onClick, ...rest}: ScaffoldBurgerProps) {
    const t = useMessages();
    const {navbarId, navbarOpen, setNavbarOpen, burgerRef} = useScaffold("ScaffoldBurger");
    return (
        <button
            ref={burgerRef}
            type="button"
            className={cx(styles.iconButton, styles.burger, className)}
            aria-label={label ?? t.menu}
            aria-expanded={navbarOpen}
            aria-controls={navbarId}
            onClick={event => {
                onClick?.(event);
                if (!event.defaultPrevented) setNavbarOpen(!navbarOpen);
            }}
            {...rest}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
    );
}
