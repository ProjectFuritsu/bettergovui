import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./Card.module.css";

export type CardVariant = "outline" | "elevated" | "filled";

export interface CardProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div".
     * - `"article"`: the card is a complete item on its own, e.g. a service or a news post
     * - `"section"` / `"aside"`: a part of the page / side content, e.g. a help box
     * - `"li"`: one card in a list, inside a `<Grid as="ul">` or `<Stack as="ul">`
     */
    as?: "div" | "article" | "section" | "aside" | "li";
    /**
     * How the card looks:
     * - `"outline"`: a thin border (default)
     * - `"elevated"`: a shadow, no border
     * - `"filled"`: a soft grey background, no border
     */
    variant?: CardVariant;
    /** Space inside the card. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "lg" (16px). */
    padding?: Size;
    /** Corner rounding. A number in pixels or any CSS length. Default: the --radius token. */
    radius?: number | string;
    /**
     * Lift the card a little, with a deeper shadow, on hover (and when a link or button inside it has
     * keyboard focus). Use it for cards people can click, e.g. a list of services; on cards that only
     * show information, a hover effect suggests a click that does nothing.
     */
    hoverable?: boolean;
}

/**
 * A box that groups related content. Put CardTitle, CardDescription, CardSection and
 * CardFooter inside it, or anything else.
 */
export function Card({
    as: Element = "div",
    variant = "outline",
    padding,
    radius,
    hoverable = false,
    className,
    style,
    ...rest
}: CardProps) {
    const settings = {
        "--card-padding": padding === undefined ? undefined : toSpacing(padding),
        "--card-radius": radius === undefined ? undefined : toCssLength(radius),
    } as CSSProperties;

    return (
        <Element
            className={cx(styles.card, className)}
            data-variant={variant}
            data-hoverable={hoverable || undefined}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    /** The heading level. Pick the one that fits the page's outline. Default "h3". */
    as?: "h2" | "h3" | "h4" | "h5" | "h6";
}

/** The card's heading. */
export function CardTitle({as: Heading = "h3", className, ...rest}: CardTitleProps) {
    return <Heading className={cx(styles.title, className)} {...rest} />;
}

/** A line of muted text, usually right under the title. */
export function CardDescription({className, ...rest}: HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cx(styles.description, className)} {...rest} />;
}

/** Content that reaches the card's edges (ignores the padding), e.g. an image at the top. */
export function CardSection({className, ...rest}: HTMLAttributes<HTMLDivElement>) {
    return <div className={cx(styles.section, className)} {...rest} />;
}

export interface CardFooterProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div". Use "footer" when the card is an article or section;
     * outside those, a `<footer>` counts as the footer of the whole page.
     */
    as?: "div" | "footer";
}

/** A row at the bottom of the card, e.g. for buttons. */
export function CardFooter({as: Element = "div", className, ...rest}: CardFooterProps) {
    return <Element className={cx(styles.footer, className)} {...rest} />;
}
