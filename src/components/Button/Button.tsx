import type {AnchorHTMLAttributes, ButtonHTMLAttributes, CSSProperties, ReactNode} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {hasContent} from "../../utils/hasContent";
import {isSizePreset, toCssLength, type Size, type SizePreset} from "../../utils/size";
import {Loader, type LoaderType} from "../Loader/Loader";
import styles from "./Button.module.css";

export type ButtonVariant = "filled" | "outline" | "text";
export type ButtonSizePreset = SizePreset;
export type ButtonSize = Size;

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
    /**
     * How the button looks:
     * - `"filled"`: solid background, no border (default)
     * - `"outline"`: border only, no background
     * - `"text"`: no border, no background, just the text
     */
    variant?: ButtonVariant;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: ButtonSize;
    /** The button's color: "primary" (default), "secondary", "success"… or any CSS color. */
    color?: Color;
    /** An icon before the text, e.g. `<Plus />`. It's sized to match the button automatically. */
    leftIcon?: ReactNode;
    /** An icon after the text, e.g. `<ArrowRight />`. */
    rightIcon?: ReactNode;
    /**
     * Shows a loading animation and blocks clicks, e.g. while a form is saving.
     * The button keeps its width so nothing around it moves.
     */
    loading?: boolean;
    /** Which loading animation to show: `"spinner"` (default), `"dots"` or `"bars"`. */
    loaderType?: LoaderType;
    /** Stretch the button to fill the width of its container. */
    fullWidth?: boolean;
    /**
     * For `variant="filled"`: use black or white text, whichever is easier to read on the color
     * (instead of always white). Useful for light colors like yellow or orange.
     */
    autoContrast?: boolean;
    /**
     * Makes it a link (an `<a>`) that looks like a button, for buttons that go to another page,
     * e.g. "Apply now". Screen readers then call it a link, which is what it is.
     */
    href?: string;
    /** With href: where to open the link, e.g. "_blank" for a new tab. */
    target?: string;
    /** With href: the link's rel. Default "noopener noreferrer" when target is "_blank". */
    rel?: string;
}

/**
 * An icon-only button (an icon and no text) is square.
 * Give it an `aria-label` so screen readers can say what it does.
 */
export default function Button({
    children,
    variant = "filled",
    size = "md",
    color,
    leftIcon,
    rightIcon,
    loading = false,
    loaderType = "spinner",
    fullWidth = false,
    autoContrast = false,
    disabled,
    href,
    target,
    rel,
    className,
    style,
    ...rest
}: ButtonProps) {
    const preset = isSizePreset(size);
    const iconOnly = !hasContent(children) && Boolean(leftIcon || rightIcon);

    const classes = cx(
        styles.button,
        styles[variant],
        preset && styles[size],
        iconOnly && styles.iconOnly,
        loading && styles.loading,
        fullWidth && styles.fullWidth,
        className,
    );

    // Settings that don't have a class become CSS variables. Undefined ones are left out.
    const settings = {
        "--btn-size": preset ? undefined : toCssLength(size),
        "--btn-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    const content = (
        <span className={styles.content}>
            {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
            {children}
            {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
        </span>
    );

    if (href !== undefined) {
        return (
            <a
                className={classes}
                style={{...settings, ...style}}
                // A disabled link has no href, so it can't be followed
                href={disabled ? undefined : href}
                target={target}
                rel={rel ?? (target === "_blank" ? "noopener noreferrer" : undefined)}
                aria-disabled={disabled || undefined}
                data-auto-contrast={autoContrast || isLightThemeColor(color) || undefined}
                {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
                {content}
            </a>
        );
    }

    return (<button
        className={classes}
        style={{...settings, ...style}}
        // A loading button can't be clicked, which prevents double submits
        disabled={disabled || loading}
        data-auto-contrast={autoContrast || isLightThemeColor(color) || undefined}
        aria-busy={loading || undefined}
        {...rest}>
        {content}
        {loading && (
            // Same size as an icon. Hidden from screen readers because aria-busy already says it's loading.
            <Loader type={loaderType} size="1.125em" className={styles.loader} aria-hidden="true" />
        )}
    </button>)
}
