import type {CSSProperties, HTMLAttributes, ReactNode} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import styles from "./Alert.module.css";

export type AlertVariant = "light" | "filled" | "outline";

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title" | "color"> {
    /** Bold first line. */
    title?: ReactNode;
    /**
     * How the alert looks:
     * - `"light"`: soft tinted background (default)
     * - `"filled"`: solid background, white text
     * - `"outline"`: border only, no background
     */
    variant?: AlertVariant;
    /** "info", "success", "warning", "danger", "primary", or any CSS color. Default "info". */
    color?: Color;
    /** An icon on the left. By default one that matches the color is shown. Pass `false` to hide it. */
    icon?: ReactNode;
    /** Shows a close (×) button that calls this function. */
    onClose?: () => void;
    /** What screen readers say for the close button. Default "Close". */
    closeLabel?: string;
    /**
     * For `variant="filled"`: use black or white text, whichever is easier to read on the color
     * (instead of always white). Useful for light colors like "warning".
     */
    autoContrast?: boolean;
}

/** A message box for feedback like "Application submitted" or "Something went wrong". */
export function Alert({
    title,
    variant = "light",
    color = "info",
    icon,
    onClose,
    closeLabel = "Close",
    autoContrast = false,
    className,
    style,
    children,
    ...rest
}: AlertProps) {
    const shownIcon = icon === undefined ? <DefaultIcon color={color} /> : icon;
    const settings = {"--alert-color": resolveColor(color)} as CSSProperties;

    return (
        <div
            // Warnings and errors are announced right away; other messages politely
            role={color === "danger" || color === "warning" ? "alert" : "status"}
            className={cx(styles.alert, className)}
            data-variant={variant}
            data-auto-contrast={autoContrast || isLightThemeColor(color) || undefined}
            style={{...settings, ...style}}
            {...rest}>
            {shownIcon && <span className={styles.icon}>{shownIcon}</span>}
            <div className={styles.body}>
                {title && <p className={styles.title}>{title}</p>}
                {children && <div className={styles.message}>{children}</div>}
            </div>
            {onClose && (
                <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
                    <svg className={styles.line} viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                </button>
            )}
        </div>
    );
}

// The icon that matches each theme color; anything else gets the "info" icon
function DefaultIcon({color}: {color: Color}) {
    return (
        <svg className={styles.line} viewBox="0 0 24 24" aria-hidden="true">
            {color === "success" ? (
                <><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>
            ) : color === "warning" ? (
                <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></>
            ) : color === "danger" ? (
                <><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></>
            ) : (
                <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>
            )}
        </svg>
    );
}
