import type {CSSProperties, HTMLAttributes} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Text.module.css";

export type TextWeight = "normal" | "medium" | "semibold" | "bold";

export interface TextProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    /** Which element to use. Default "p" (a paragraph); "span" for text inside other text. */
    as?: "p" | "span" | "div" | "strong" | "em" | "small";
    /** A preset (xs 12px, sm 14px, md 16px, lg 18px, xl 20px), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** "normal" (default), "medium", "semibold" or "bold". */
    weight?: TextWeight;
    /** Grey secondary text, e.g. for hints and dates. */
    muted?: boolean;
    /** "primary", "success", "danger"… or any CSS color. A slightly deeper shade is used so it stays readable. */
    color?: Color;
    /** "left", "center" or "right". */
    align?: "left" | "center" | "right";
    /** Keep it on one line and cut it off with "…" when it doesn't fit. */
    truncate?: boolean;
    /** Show at most this many lines, ending with "…". */
    lineClamp?: number;
}

/** Text with consistent sizes and colors. No margins: use Stack to space paragraphs. */
export function Text({
    as: Element = "p",
    size = "md",
    weight,
    muted = false,
    color,
    align,
    truncate = false,
    lineClamp,
    className,
    style,
    ...rest
}: TextProps) {
    const preset = isSizePreset(size);
    const settings = {
        "--text-size": preset ? undefined : toCssLength(size),
        "--text-color": color === undefined ? undefined : resolveColor(color),
        "--text-lines": lineClamp,
        textAlign: align,
    } as CSSProperties;

    return (
        <Element
            className={cx(styles.text, className)}
            data-size={preset ? size : undefined}
            data-weight={weight}
            data-muted={muted || undefined}
            data-colored={color !== undefined || undefined}
            data-truncate={truncate || undefined}
            data-clamp={lineClamp ? true : undefined}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
