import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Badge} from "../../components/Badge/Badge";
import {Card, CardDescription, CardSection, CardTitle} from "../../components/Card/Card";
import {Container} from "../../components/Container/Container";
import {Grid} from "../../components/Grid/Grid";
import {cx} from "../../utils/cx";
import {dateLocale, useLanguage, useMessages} from "../../i18n/LanguageProvider";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./NewsBlock.module.css";

export interface NewsBlockItem {
    title: ReactNode;
    /** The full story's page. The whole card links there. */
    href: string;
    /** When it was posted: a Date, or text like "2026-10-01". */
    date?: Date | string;
    /** A tag above the title, e.g. "Advisory" or "Event". */
    category?: ReactNode;
    /** A sentence or two from the story. */
    excerpt?: ReactNode;
    /** A picture URL shown at the top of the card. */
    image?: string;
    /** Describes the picture. Leave empty ("") when it's only decoration. */
    imageAlt?: string;
}

export interface NewsBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    eyebrow?: ReactNode;
    /** The section's heading (an `<h2>`). Default "Latest news". */
    title?: ReactNode;
    description?: ReactNode;
    /** The posts, newest first. */
    items: NewsBlockItem[];
    /** A button beside the title, e.g. `{ label: "All news", href: "/news" }`. */
    action?: BlockAction;
    /** The most columns on wide screens. Default 3. */
    columns?: number;
    /** The language for dates, e.g. "fil-PH". Default: the LanguageProvider's language ("en-PH" without one). */
    locale?: string;
}

// "2026-10-01" is read as a local date (new Date("2026-10-01") would be UTC, which can be the day before)
function toDate(date: Date | string) {
    if (date instanceof Date) return date;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : new Date(date);
}

// The machine-readable date for <time dateTime>, e.g. "2026-10-01"
function isoDay(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** The latest posts as cards: picture, category, date, title and a short excerpt. Each card is a link. */
export function NewsBlock({
    eyebrow,
    title,
    description,
    items,
    action,
    columns = 3,
    locale,
    className,
    ...rest
}: NewsBlockProps) {
    const t = useMessages();
    const language = useLanguage();
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className={cx(shared.section, className)} {...rest}>
            <Container>
                <div className={styles.top}>
                    <div className={styles.intro}>
                        {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                        <h2 id={titleId} className={shared.title}>{title ?? t.blocks.newsTitle}</h2>
                        {description && <p className={shared.description}>{description}</p>}
                    </div>
                    {action && renderAction(action, {variant: "outline"})}
                </div>
                <Grid as="ul" columns={columns} minColumnWidth="17rem" gap="lg">
                    {items.map((item, index) => {
                        const date = item.date === undefined ? undefined : toDate(item.date);
                        return (
                            <li key={index} className={styles.item}>
                                <Card as="article" hoverable className={cx(shared.linkCard, styles.card)}>
                                    {item.image && (
                                        <CardSection>
                                            <img src={item.image} alt={item.imageAlt ?? ""} className={styles.image} />
                                        </CardSection>
                                    )}
                                    {(item.category || date) && (
                                        <div className={styles.meta}>
                                            {item.category && <Badge size="sm">{item.category}</Badge>}
                                            {date && (
                                                <time dateTime={isoDay(date)} className={styles.date}>
                                                    {date.toLocaleDateString(locale ?? dateLocale(language), {dateStyle: "medium"})}
                                                </time>
                                            )}
                                        </div>
                                    )}
                                    <CardTitle as="h3">
                                        <a href={item.href} className={shared.cardLink}>{item.title}</a>
                                    </CardTitle>
                                    {item.excerpt && <CardDescription className={styles.excerpt}>{item.excerpt}</CardDescription>}
                                </Card>
                            </li>
                        );
                    })}
                </Grid>
            </Container>
        </section>
    );
}
