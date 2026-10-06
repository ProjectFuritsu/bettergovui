import {useId, useState, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {Navbar, NavLink} from "../../components/Navbar/Navbar";
import {cx} from "../../utils/cx";
import {renderAction, type BlockAction} from "../action";
import styles from "./HeaderBlock.module.css";

export interface HeaderBlockLink {
    label: ReactNode;
    href: string;
    /** The current page. */
    active?: boolean;
}

export interface HeaderBlockProps extends HTMLAttributes<HTMLElement> {
    /** The site name or logo, e.g. "BetterGov Davao" or `<img src="/logo.svg" alt="BetterGov Davao" />`. */
    logo?: ReactNode;
    /** Where the logo goes. Default "/" (the home page). */
    logoHref?: string;
    /** The navigation links. On phones they move into a ☰ menu. */
    links?: HeaderBlockLink[];
    /** A button on the right, e.g. "Sign in" or `{ label: "Apply now", href: "/apply" }`. */
    action?: BlockAction;
    /** Keep the header at the top of the screen while the page scrolls. */
    sticky?: boolean;
    /** What screen readers call the ☰ button. Default "Menu". */
    menuLabel?: string;
}

/** A site header: logo on the left, links in the middle, a button on the right. A `<header>`. */
export function HeaderBlock({
    logo,
    logoHref = "/",
    links = [],
    action,
    sticky = false,
    menuLabel = "Menu",
    className,
    onKeyDown,
    ...rest
}: HeaderBlockProps) {
    const menuId = useId();
    const [open, setOpen] = useState(false);
    const navLinks = links.map(link => (
        <NavLink key={link.href} href={link.href} active={link.active} onClick={() => setOpen(false)}>
            {link.label}
        </NavLink>
    ));

    return (
        <header
            className={cx(styles.header, className)}
            data-sticky={sticky || undefined}
            onKeyDown={event => {
                onKeyDown?.(event);
                if (event.key === "Escape" && open) setOpen(false);
            }}
            {...rest}>
            <Container className={styles.bar}>
                {logo && <a href={logoHref} className={styles.logo}>{logo}</a>}
                {links.length > 0 && <Navbar className={styles.links}>{navLinks}</Navbar>}
                <div className={styles.end}>
                    {renderAction(action, {size: "sm"})}
                    {links.length > 0 && (
                        <button
                            type="button"
                            className={styles.menuButton}
                            aria-label={menuLabel}
                            aria-expanded={open}
                            aria-controls={menuId}
                            onClick={() => setOpen(current => !current)}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d={open ? "M18 6 6 18M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    )}
                </div>
            </Container>
            {/* The phone menu: the same links in a column, under the bar */}
            {links.length > 0 && (
                <div id={menuId} className={styles.menu} hidden={!open}>
                    <Container>
                        <Navbar orientation="vertical">{navLinks}</Navbar>
                    </Container>
                </div>
            )}
        </header>
    );
}
