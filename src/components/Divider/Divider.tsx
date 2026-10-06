import type {CSSProperties, HTMLAttributes, ReactNode} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import styles from "./Divider.module.css";

export interface DividerProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    /** Text in the line, e.g. "or". Only for horizontal dividers. */
    label?: ReactNode;
    /** Where the label sits: "left", "center" (default) or "right". */
    labelPosition?: "left" | "center" | "right";
    /** "horizontal" (default) between sections, or "vertical" between items in a row (e.g. in a Group). */
    orientation?: "horizontal" | "vertical";
    /** "solid" (default), "dashed" or "dotted". */
    variant?: "solid" | "dashed" | "dotted";
    /** The line's color: "primary", "success"… or any CSS color. Default: the --border token. */
    color?: Color;
}

/** A line that separates sections, optionally with text in the middle ("or"). */
export function Divider({
    label,
    labelPosition = "center",
    orientation = "horizontal",
    variant = "solid",
    color,
    className,
    style,
    ...rest
}: DividerProps) {
    const settings = {"--divider-color": color === undefined ? undefined : resolveColor(color)} as CSSProperties;

    if (label && orientation === "horizontal") {
        return (
            <div
                role="separator"
                className={cx(styles.labeled, className)}
                data-position={labelPosition}
                data-variant={variant}
                style={{...settings, ...style}}
                {...rest}>
                <span className={styles.label}>{label}</span>
            </div>
        );
    }

    return (
        <hr
            className={cx(styles.divider, className)}
            aria-orientation={orientation === "vertical" ? "vertical" : undefined}
            data-orientation={orientation}
            data-variant={variant}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
