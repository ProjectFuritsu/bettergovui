import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./ContactBlock.module.css";

// Small line icons (from Lucide) for each kind of detail
const ICONS = {
    address: <><path d="M20 10c0 5-5.5 10.2-7.4 11.8a1 1 0 0 1-1.2 0C9.5 20.2 4 15 4 10a8 8 0 0 1 16 0" /><circle cx="12" cy="10" r="3" /></>,
    phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />,
    email: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-9 5.7a2 2 0 0 1-2 0L2 7" /></>,
    hours: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
};

export interface ContactBlockHours {
    /** e.g. "Monday – Friday" */
    days: ReactNode;
    /** e.g. "8:00 AM – 5:00 PM" or "Closed" */
    time: ReactNode;
}

export interface ContactBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    eyebrow?: ReactNode;
    /** The section's heading (an `<h2>`). Default "Contact us". */
    title?: ReactNode;
    description?: ReactNode;
    /** The office's address. Use line breaks (`<br />`) or several lines of text. */
    address?: ReactNode;
    /** A phone number. It becomes a link that calls it on phones. */
    phone?: string;
    /** An email address. It becomes a link that opens the mail app. */
    email?: string;
    /** Office hours, one row per group of days. */
    hours?: ContactBlockHours[];
    /** A button under the details, e.g. `{ label: "Get directions", href: "https://maps.google.com/?q=…" }`. */
    action?: BlockAction;
    /**
     * A map beside the details: an embed URL (e.g. Google Maps "Embed a map" link), shown in a frame,
     * or your own element.
     */
    map?: string | ReactNode;
    /** What the map shows, for screen readers. Default "Map of the office location". */
    mapTitle?: string;
    /** The small labels above each detail, e.g. `{ phone: "Telepono" }` for a Filipino page. */
    labels?: Partial<Record<keyof typeof ICONS, string>>;
}


function Detail({icon, label, children}: {icon: keyof typeof ICONS; label: string; children: ReactNode}) {
    return (
        <div className={styles.detail}>
            <span className={shared.iconTile} aria-hidden="true">
                <svg viewBox="0 0 24 24" className={styles.icon}>{ICONS[icon]}</svg>
            </span>
            <div className={styles.detailText}>
                <span className={styles.detailLabel}>{label}</span>
                {children}
            </div>
        </div>
    );
}

/** How to reach an office: address, phone, email and hours, with an optional map beside them. */
export function ContactBlock({
    eyebrow,
    title,
    description,
    address,
    phone,
    email,
    hours = [],
    action,
    map,
    mapTitle,
    labels,
    className,
    ...rest
}: ContactBlockProps) {
    const t = useMessages();
    const titleId = useId();
    const hasMap = map !== undefined && map !== null && map !== "";
    const label = {address: t.blocks.contactAddress, phone: t.blocks.contactPhone, email: t.blocks.contactEmail, hours: t.blocks.contactHours, ...labels};

    return (
        <section aria-labelledby={titleId} className={cx(shared.section, className)} {...rest}>
            <Container className={styles.inner} data-has-map={hasMap || undefined}>
                <div className={styles.info}>
                    <div className={styles.intro}>
                        {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                        <h2 id={titleId} className={shared.title}>{title ?? t.blocks.contactTitle}</h2>
                        {description && <p className={shared.description}>{description}</p>}
                    </div>
                    {/* <address> is the HTML element for contact details */}
                    <address className={styles.details}>
                        {address && <Detail icon="address" label={label.address}>{address}</Detail>}
                        {phone && (
                            <Detail icon="phone" label={label.phone}>
                                <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={styles.link}>{phone}</a>
                            </Detail>
                        )}
                        {email && (
                            <Detail icon="email" label={label.email}>
                                <a href={`mailto:${email}`} className={styles.link}>{email}</a>
                            </Detail>
                        )}
                    </address>
                    {hours.length > 0 && (
                        <Detail icon="hours" label={label.hours}>
                            <dl className={styles.hours}>
                                {hours.map((row, index) => (
                                    <div key={index} className={styles.hoursRow}>
                                        <dt>{row.days}</dt>
                                        <dd>{row.time}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Detail>
                    )}
                    {action && <div className={shared.actions}>{renderAction(action, {variant: "outline"})}</div>}
                </div>
                {hasMap && (
                    <div className={styles.map}>
                        {typeof map === "string" ? <iframe src={map} title={mapTitle ?? t.blocks.mapTitle} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : map}
                    </div>
                )}
            </Container>
        </section>
    );
}
