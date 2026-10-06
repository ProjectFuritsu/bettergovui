import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import shared from "../blocks.module.css";
import styles from "./StatsBlock.module.css";

export interface StatsBlockItem {
    /** The number, e.g. "12,480" or "3 days". */
    value: ReactNode;
    /** What it counts, e.g. "Permits issued this year". */
    label: ReactNode;
    /** An extra line, e.g. "Up 18% from last year". */
    description?: ReactNode;
}

export interface StatsBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    eyebrow?: ReactNode;
    /** The section's heading (an `<h2>`). Leave it out for a plain row of numbers. */
    title?: ReactNode;
    description?: ReactNode;
    /** The numbers. Three or four look best. */
    stats: StatsBlockItem[];
}

/** A row of big numbers that show results, e.g. permits issued or average waiting time. */
export function StatsBlock({eyebrow, title, description, stats, className, ...rest}: StatsBlockProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={title ? titleId : undefined} className={cx(shared.section, styles.stats, className)} {...rest}>
            <Container>
                {(eyebrow || title || description) && (
                    <div className={shared.intro}>
                        {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                        {title && <h2 id={titleId} className={shared.title}>{title}</h2>}
                        {description && <p className={shared.description}>{description}</p>}
                    </div>
                )}
                {/* A description list: screen readers read "Permits issued: 12,480" for each */}
                <dl className={styles.list}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.stat}>
                            <dt className={styles.label}>{stat.label}</dt>
                            <dd className={styles.value}>{stat.value}</dd>
                            {stat.description && <dd className={styles.description}>{stat.description}</dd>}
                        </div>
                    ))}
                </dl>
            </Container>
        </section>
    );
}
