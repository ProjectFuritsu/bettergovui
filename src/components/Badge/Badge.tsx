import type {CSSProperties, HTMLAttributes, ReactNode} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Badge.module.css";

export type BadgeVariant = "light" | "filled" | "outline";

export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
    /**
     * How the badge looks:
     * - `"light"`: soft tinted background, darker text (default; readable in every color)
     * - `"filled"`: solid background, white text
     * - `"outline"`: border only, no background
     */
    variant?: BadgeVariant;
    /** "primary", "info", "success", "warning", "danger", or any CSS color. Default "primary". */
    color?: Color;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md" (12px text). */
    size?: Size;
    /** Corner rounding. A number in pixels or any CSS length. Default: fully rounded. */
    radius?: number | string;
    /** An icon before the text, e.g. `<Check />`. */
    leftIcon?: ReactNode;
    /** An icon after the text. */
    rightIcon?: ReactNode;
    /**
     * For `variant="filled"`: use black or white text, whichever is easier to read on the color
     * (instead of always white). Useful for light colors like "warning".
     */
    autoContrast?: boolean;
}

/** A small label for a status or category, like "Approved" or "New". */
export function Badge({
    variant = "light",
    color,
    size = "md",
    radius,
    leftIcon,
    rightIcon,
    autoContrast = false,
    className,
    style,
    children,
    ...rest
}: BadgeProps) {
    const preset = isSizePreset(size);

    // Settings become CSS variables that Badge.module.css reads. Undefined ones are left out.
    const settings = {
        "--badge-color": color === undefined ? undefined : resolveColor(color),
        "--badge-size": preset ? undefined : toCssLength(size),
        "--badge-radius": radius === undefined ? undefined : toCssLength(radius),
    } as CSSProperties;

    return (
        <span
            className={cx(styles.badge, className)}
            data-variant={variant}
            data-size={preset ? size : undefined}
            data-auto-contrast={autoContrast || isLightThemeColor(color) || undefined}
            style={{...settings, ...style}}
            {...rest}>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </span>
    );
}
