import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Avatar} from "../../components/Avatar/Avatar";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./HeroBlock.module.css";

export interface HeroBlockProof {
    /** The line next to the faces, e.g. "Used by 18,000 residents". */
    text: ReactNode;
    /** Up to about five people: a photo (`src`), or a `name` that's shown as initials. */
    avatars?: Array<{src?: string; name?: string}>;
}

/** A card under the hero's text: a picture, or a quote with who said it. */
export interface HeroBlockCard {
    /** A picture that fills the card. */
    image?: string;
    imageAlt?: string;
    /** Or a quote, shown on a dark card. */
    quote?: ReactNode;
    /** Who said it. */
    name?: ReactNode;
    /** Their role, e.g. "Sari-sari store owner, Toril". */
    role?: ReactNode;
}

export interface HeroBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** Shown above the hero, e.g. `<HeaderBlock … />` or your own navbar. */
    header?: ReactNode;
    /** Shown below the hero, e.g. `<FooterBlock … />`, or logos and numbers that back up the title. */
    footer?: ReactNode;
    /** A short line above the title, e.g. "Davao Region e-Services". */
    eyebrow?: ReactNode;
    /** The main message. It's the page's `<h1>`. */
    title: ReactNode;
    /** One or two sentences under the title. */
    description?: ReactNode;
    /** The main button, e.g. `{ label: "Apply now", href: "/apply" }`. */
    primaryAction?: BlockAction;
    /** A second, quieter button, e.g. "See requirements". */
    secondaryAction?: BlockAction;
    /** A picture beside the text (under it on phones): an image URL, or your own element. */
    image?: string | ReactNode;
    /** Describes the image for people who can't see it. Leave empty ("") for a decorative picture. */
    imageAlt?: string;
    /** "left" or "center" text. Default "left" with an image, "center" without. */
    align?: "left" | "center";
    /** A row of faces and a line above the title, e.g. a rating or how many people use the service. */
    proof?: HeroBlockProof;
    /** A row of cards under the text: pictures and quotes. Three fit best. */
    cards?: HeroBlockCard[];
}

/**
 * The big opening section of a page: title, description and buttons, with an optional picture.
 * `header` and `footer` let it be a whole page on its own.
 */
export function HeroBlock({
    header,
    footer,
    eyebrow,
    title,
    description,
    primaryAction,
    secondaryAction,
    image,
    imageAlt = "",
    align,
    proof,
    cards = [],
    className,
    ...rest
}: HeroBlockProps) {
    const titleId = useId();
    const hasImage = image !== undefined && image !== null && image !== "";

    return (
        <>
            {header}
            <section
                aria-labelledby={titleId}
                className={cx(shared.section, styles.hero, className)}
                data-align={align ?? (hasImage ? "left" : "center")}
                data-has-image={hasImage || undefined}
                {...rest}>
                <Container className={styles.inner}>
                    <div className={styles.text}>
                        {proof && (
                            <div className={styles.proof}>
                                {proof.avatars && proof.avatars.length > 0 && (
                                    // Decoration: the line next to them says what they stand for
                                    <span className={styles.faces} aria-hidden="true">
                                        {proof.avatars.map((person, index) => (
                                            <Avatar key={index} src={person.src} name={person.name} size={36} className={styles.face} />
                                        ))}
                                    </span>
                                )}
                                <span>{proof.text}</span>
                            </div>
                        )}
                        {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                        <h1 id={titleId} className={styles.title}>{title}</h1>
                        {description && <p className={cx(shared.description, styles.description)}>{description}</p>}
                        {(primaryAction || secondaryAction) && (
                            <div className={cx(shared.actions, styles.actions)}>
                                {renderAction(primaryAction, {size: "lg"})}
                                {renderAction(secondaryAction, {size: "lg", variant: "outline"})}
                            </div>
                        )}
                    </div>
                    {hasImage && (
                        <div className={styles.media}>
                            {typeof image === "string" ? <img src={image} alt={imageAlt} className={styles.image} /> : image}
                        </div>
                    )}
                </Container>
                {cards.length > 0 && (
                    <Container>
                        <ul className={styles.cards}>
                            {cards.map((card, index) => (
                                <li key={index} className={styles.card} data-kind={card.image ? "image" : "quote"}>
                                    {card.image ? (
                                        <img src={card.image} alt={card.imageAlt ?? ""} />
                                    ) : (
                                        <figure className={styles.quote}>
                                            <blockquote>{card.quote}</blockquote>
                                            {(card.name || card.role) && (
                                                <figcaption>
                                                    {card.name && <strong>{card.name}</strong>}
                                                    {card.role && <span>{card.role}</span>}
                                                </figcaption>
                                            )}
                                        </figure>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </Container>
                )}
            </section>
            {footer}
        </>
    );
}
