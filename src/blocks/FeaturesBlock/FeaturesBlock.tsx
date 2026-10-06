import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Card, CardDescription, CardTitle} from "../../components/Card/Card";
import {Container} from "../../components/Container/Container";
import {Grid} from "../../components/Grid/Grid";
import {cx} from "../../utils/cx";
import shared from "../blocks.module.css";

export interface FeaturesBlockItem {
    /** An icon, e.g. `<FileText />` from lucide-react. */
    icon?: ReactNode;
    title: ReactNode;
    description?: ReactNode;
    /** Makes the whole card a link, e.g. to that service's page. */
    href?: string;
}

export interface FeaturesBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** A short line above the title, e.g. "Online services". */
    eyebrow?: ReactNode;
    /** The section's heading (an `<h2>`). */
    title: ReactNode;
    /** One or two sentences under the title. */
    description?: ReactNode;
    /** The cards: one per service or feature. */
    features: FeaturesBlockItem[];
    /** The most columns on wide screens; fewer on tablets and one on phones. Default 3. */
    columns?: number;
}

/** A titled grid of cards, e.g. the services people can use online. Cards with an href are clickable. */
export function FeaturesBlock({eyebrow, title, description, features, columns = 3, className, ...rest}: FeaturesBlockProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className={cx(shared.section, className)} {...rest}>
            <Container>
                <div className={shared.intro}>
                    {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                    <h2 id={titleId} className={shared.title}>{title}</h2>
                    {description && <p className={shared.description}>{description}</p>}
                </div>
                {/* A list, so screen readers say how many there are */}
                <Grid as="ul" columns={columns} minColumnWidth="16rem" gap="lg">
                    {features.map((feature, index) => (
                        <Card key={index} as="li" variant="outline" padding="xl" hoverable={Boolean(feature.href)} className={shared.linkCard}>
                            {feature.icon && <span className={shared.iconTile} aria-hidden="true">{feature.icon}</span>}
                            <CardTitle as="h3">
                                {/* The link covers the whole card (see .cardLink::after), so the card is one big target */}
                                {feature.href ? <a href={feature.href} className={shared.cardLink}>{feature.title}</a> : feature.title}
                            </CardTitle>
                            {feature.description && <CardDescription>{feature.description}</CardDescription>}
                        </Card>
                    ))}
                </Grid>
            </Container>
        </section>
    );
}
