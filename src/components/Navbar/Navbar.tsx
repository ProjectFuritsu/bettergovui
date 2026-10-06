import {Children, createContext, useContext, type AnchorHTMLAttributes, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import {toSpacing, type Size} from "../../utils/size";
import styles from "./Navbar.module.css";

// True inside an element that's already a <nav> (ScaffoldNavbar), so a Navbar there doesn't add a second one
export const InsideNavContext = createContext(false);

export interface NavbarProps extends HTMLAttributes<HTMLElement> {
    /** "horizontal": a row, e.g. in a header (the default). "vertical": a column (the default inside a ScaffoldNavbar). */
    orientation?: "horizontal" | "vertical";
    /** Space between the links. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default 2px. */
    gap?: Size;
}

/**
 * A group of NavLinks: a `<nav>` with a list inside, so screen readers say how many links there are.
 * Named "Main" for screen readers; give it another aria-label when a page has more than one.
 * Inside a ScaffoldNavbar (already a `<nav>`) it's just the list, in a column.
 */
export function Navbar({
    orientation,
    gap,
    "aria-label": ariaLabel = "Main",
    className,
    style,
    children,
    ...rest
}: NavbarProps) {
    const insideNav = useContext(InsideNavContext);
    const Root = insideNav ? "div" : "nav";
    const settings = {"--navbar-gap": gap === undefined ? undefined : toSpacing(gap)} as CSSProperties;
    return (
        <Root
            aria-label={insideNav ? undefined : ariaLabel}
            className={cx(styles.navbar, className)}
            data-orientation={orientation ?? (insideNav ? "vertical" : "horizontal")}
            style={{...settings, ...style}}
            {...rest}>
            <ul className={styles.list}>
                {/* Each link goes in an <li>; empty children (null, false) are skipped */}
                {Children.map(children, child => (child == null ? null : <li>{child}</li>))}
            </ul>
        </Root>
    );
}

export interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
    /** The current page: highlighted, and announced as "current page" by screen readers. */
    active?: boolean;
    /** An icon before the label, e.g. from lucide-react. */
    icon?: ReactNode;
    /** Something small after the label, e.g. a count: `badge={3}`. */
    badge?: ReactNode;
    /**
     * Use a router's link instead of `<a>`, e.g. `as={Link}` from next/link or react-router.
     * React Router's NavLink marks the current page by itself, so you don't need `active` with it.
     */
    as?: ElementType;
    /** For React Router links, which use `to` instead of `href`. */
    to?: string;
}

/** A link in a navigation menu. Works in a Navbar, a ScaffoldNavbar, or on its own. */
export function NavLink({active, icon, badge, as: Element = "a", className, children, ...rest}: NavLinkProps) {
    return (
        <Element className={cx(styles.link, className)} aria-current={active ? "page" : undefined} {...rest}>
            {icon && <span className={styles.icon} aria-hidden="true">{icon}</span>}
            <span className={styles.label}>{children}</span>
            {badge !== undefined && badge !== null && <span className={styles.badge}>{badge}</span>}
        </Element>
    );
}
