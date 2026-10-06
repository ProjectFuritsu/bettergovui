import {forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "color"> {
    /** Text next to the switch. Clicking it flips the switch. */
    label?: ReactNode;
    /** Helper text under the label. */
    description?: ReactNode;
    /** Error message under the label. */
    error?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color when on: "primary", "success", "danger"… or any CSS color. Default "primary". */
    color?: Color;
}

/**
 * An on/off switch, for settings that apply right away (like "Email notifications").
 * It's a real checkbox underneath, so `checked`, `defaultChecked` and `onChange` work as usual.
 * `className` and `style` go on the outer wrapper; every other prop goes on the `<input>`.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
    {
        label,
        description,
        error,
        size = "md",
        color,
        id,
        disabled,
        className,
        style,
        "aria-describedby": describedBy,
        ...rest
    },
    ref,
) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const preset = isSizePreset(size);

    const settings = {
        "--switch-size": preset ? undefined : toCssLength(size),
        "--switch-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <div
            className={cx(styles.root, className)}
            data-size={preset ? size : undefined}
            data-auto-contrast={isLightThemeColor(color) || undefined}
            data-disabled={disabled || undefined}
            style={{...settings, ...style}}>
            <span className={styles.control}>
                <input
                    ref={ref}
                    type="checkbox"
                    // Screen readers announce it as a switch ("on"/"off") instead of a checkbox
                    role="switch"
                    id={inputId}
                    className={styles.input}
                    disabled={disabled}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                    {...rest}
                />
                <span className={styles.thumb} aria-hidden="true" />
            </span>
            {(label || description || errorMessage) && (
                <span className={styles.body}>
                    {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
                    {description && <span id={descriptionId} className={styles.description}>{description}</span>}
                    {errorMessage && <span id={errorId} className={styles.error}>{errorMessage}</span>}
                </span>
            )}
        </div>
    );
});
