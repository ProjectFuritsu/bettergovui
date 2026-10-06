import {
    forwardRef,
    useEffect,
    useId,
    useImperativeHandle,
    useRef,
    type CSSProperties,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Checkbox.module.css";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "color"> {
    /** Text next to the box. Clicking it toggles the checkbox. */
    label?: ReactNode;
    /** Helper text under the label. */
    description?: ReactNode;
    /** Error message under the label. Pass `true` for the red border without a message. */
    error?: ReactNode;
    /** Shows a dash instead of a check, for "some are selected" (e.g. a "select all" checkbox). */
    indeterminate?: boolean;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color when checked: "primary", "success", "danger"… or any CSS color. Default "primary". */
    color?: Color;
}

/** A checkbox. `className` and `style` go on the outer wrapper; every other prop goes on the `<input>`. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
    {
        label,
        description,
        error,
        indeterminate = false,
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
    const inputRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // "indeterminate" only exists as a property on the element, not as an HTML attribute
    useEffect(() => {
        if (inputRef.current) inputRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const preset = isSizePreset(size);

    const settings = {
        "--checkbox-size": preset ? undefined : toCssLength(size),
        "--checkbox-color": color === undefined ? undefined : resolveColor(color),
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
                    ref={inputRef}
                    type="checkbox"
                    id={inputId}
                    className={styles.input}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                    {...rest}
                />
                <svg className={styles.check} viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M3.5 8.5l3 3 6-6.5" />
                </svg>
                <svg className={styles.dash} viewBox="0 0 16 16" aria-hidden="true">
                    <path d="M4 8h8" />
                </svg>
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
