import {useLayoutEffect, useRef, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {renderAction, type BlockAction} from "../action";
import styles from "./FooterBlock.module.css";

export interface FooterBlockLink {
    label: ReactNode;
    href: string;
}

export interface FooterBlockColumn {
    /** The column's heading, e.g. "Services". */
    title: ReactNode;
    links: FooterBlockLink[];
}

export interface FooterBlockProps extends HTMLAttributes<HTMLElement> {
    /** The site name or logo. */
    logo?: ReactNode;
    /** A line under the logo, e.g. the office's address or mission. */
    description?: ReactNode;
    /** Columns of links, e.g. Services, About, Help. */
    columns?: FooterBlockColumn[];
    /** The small print at the bottom, e.g. "© 2026 BetterGov Region Davao". */
    copyright?: ReactNode;
    /** Links next to the copyright, e.g. Privacy and Accessibility. */
    bottomLinks?: FooterBlockLink[];
    /**
     * How the logo and link columns are arranged:
     * - "columns" (default): the logo on the left, the link columns on the right
     * - "centered": everything in the middle, one under the other
     * - "grid": the logo on top, and the link columns in cells with lines between them
     */
    layout?: "columns" | "centered" | "grid";
    /**
     * Its colors: "default" (the page's own), "muted" (a soft gray) or "dark" (dark with light text,
     * in light mode too), so the page ends on a strong band.
     */
    tone?: "default" | "muted" | "dark";
    /** Draw the footer as a rounded box with space around it, instead of edge to edge. */
    card?: boolean;
    /** A big line above the links, e.g. "Need help with your application?". */
    heading?: ReactNode;
    /** A button next to the heading, e.g. `{ label: "Contact us", href: "/contact" }`. */
    action?: BlockAction;
    /**
     * The site's name in very large letters along the bottom, as wide as the footer. It's decoration:
     * screen readers skip it, so keep the real name in `logo` or `copyright`.
     */
    wordmark?: string;
}

// The site's name, grown until it is exactly as wide as the footer
function Wordmark({text}: {text: string}) {
    const boxRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLSpanElement>(null);

    useLayoutEffect(() => {
        const box = boxRef.current;
        const label = textRef.current;
        if (!box || !label) return;
        const fit = () => {
            // Measured at 100px, then scaled: the width of text grows evenly with its size
            label.style.fontSize = "100px";
            const width = label.getBoundingClientRect().width;
            if (width > 0) label.style.fontSize = `${Math.min((box.clientWidth / width) * 100, 320)}px`;
        };
        fit();
        const observer = new ResizeObserver(fit);
        observer.observe(box);
        // Again once the page's font has loaded: its letters have other widths than the fallback's
        void box.ownerDocument.fonts?.ready.then(fit);
        return () => observer.disconnect();
    }, [text]);

    return (
        <div ref={boxRef} className={styles.wordmark} aria-hidden="true">
            <span ref={textRef}>{text}</span>
        </div>
    );
}

/** The bottom of a site: logo, columns of links, and the copyright line. A `<footer>`. */
export function FooterBlock({
    logo,
    description,
    columns = [],
    copyright,
    bottomLinks = [],
    layout = "columns",
    tone = "default",
    card = false,
    heading,
    action,
    wordmark,
    className,
    ...rest
}: FooterBlockProps) {
    const t = useMessages();
    const hasTop = Boolean(logo || description || columns.length > 0);
    return (
        <footer className={cx(styles.footer, className)} data-layout={layout} data-tone={tone} data-card={card || undefined} {...rest}>
            <Container>
                <div className={styles.panel}>
                {(heading || action) && (
                    <div className={styles.cta}>
                        {heading && <p className={styles.heading}>{heading}</p>}
                        {action && renderAction(action, {size: "lg"})}
                    </div>
                )}
                {hasTop && <div className={styles.top}>
                    {(logo || description) && (
                        <div className={styles.brand}>
                            {logo && <div className={styles.logo}>{logo}</div>}
                            {description && <p className={styles.description}>{description}</p>}
                        </div>
                    )}
                    {columns.length > 0 && (
                        <nav aria-label={t.footerNavigation} className={styles.columns}>
                            {columns.map((column, index) => (
                                <div key={index}>
                                    <h2 className={styles.columnTitle}>{column.title}</h2>
                                    <ul className={styles.list}>
                                        {column.links.map(link => (
                                            <li key={link.href}><a href={link.href} className={styles.link}>{link.label}</a></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </nav>
                    )}
                </div>}
                {(copyright || bottomLinks.length > 0) && (
                    <div className={styles.bottom}>
                        {copyright && <p className={styles.copyright}>{copyright}</p>}
                        {bottomLinks.length > 0 && (
                            <ul className={cx(styles.list, styles.bottomLinks)}>
                                {bottomLinks.map(link => (
                                    <li key={link.href}><a href={link.href} className={styles.link}>{link.label}</a></li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
                {wordmark && <Wordmark text={wordmark} />}
                </div>
            </Container>
        </footer>
    );
}
