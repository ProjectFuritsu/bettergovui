import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./HeroBlock.module.css";

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
            </section>
            {footer}
        </>
    );
}
