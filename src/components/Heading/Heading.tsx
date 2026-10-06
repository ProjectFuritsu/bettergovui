import type {CSSProperties, HTMLAttributes} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import styles from "./Heading.module.css";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps extends Omit<HTMLAttributes<HTMLHeadingElement>, "color"> {
    /**
     * Which heading it is (h1–h6). Screen reader users jump between headings, so pick the level that
     * fits the page's outline: one h1 per page, then h2 for sections, h3 inside those, and so on.
     * Default 2.
     */
    level?: HeadingLevel;
    /** Make it look like another level without changing its meaning, e.g. an h2 that looks like an h4. */
    size?: HeadingLevel;
    /** "left", "center" or "right". */
    align?: "left" | "center" | "right";
    /** "primary", "success"… or any CSS color. A slightly deeper shade is used so it stays readable. Default: the text color. */
    color?: Color;
}

/** A heading (h1–h6) with consistent sizes. The big ones shrink a little on small screens. */
export function Heading({level = 2, size, align, color, className, style, ...rest}: HeadingProps) {
    const Element = `h${level}` as const;
    const settings = {
        textAlign: align,
        "--heading-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <Element
            className={cx(styles.heading, className)}
            data-size={size ?? level}
            data-colored={color !== undefined || undefined}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
