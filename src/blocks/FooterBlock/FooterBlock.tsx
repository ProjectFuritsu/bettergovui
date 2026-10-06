import type {HTMLAttributes, ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
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
}

/** The bottom of a site: logo, columns of links, and the copyright line. A `<footer>`. */
export function FooterBlock({logo, description, columns = [], copyright, bottomLinks = [], className, ...rest}: FooterBlockProps) {
    const t = useMessages();
    return (
        <footer className={cx(styles.footer, className)} {...rest}>
            <Container>
                <div className={styles.top}>
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
                </div>
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
            </Container>
        </footer>
    );
}
