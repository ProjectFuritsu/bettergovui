import {forwardRef, useId, type CSSProperties, type InputHTMLAttributes, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Input.module.css";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
    /** Text above the field. Clicking it focuses the field. */
    label?: ReactNode;
    /** Helper text between the label and the field. */
    description?: ReactNode;
    /**
     * Error message below the field. It also turns the border red and tells screen readers
     * the value is invalid. Pass `true` for the red border without a message.
     */
    error?: ReactNode;
    /** An icon inside the field, before the text, e.g. `<Search />`. */
    leftIcon?: ReactNode;
    /** An icon inside the field, after the text. */
    rightIcon?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md", the same height as a md Button. */
    size?: Size;
}

/** A text field. `className` and `style` go on the outer wrapper; every other prop goes on the `<input>`. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
    {
        label,
        description,
        error,
        leftIcon,
        rightIcon,
        size = "md",
        id,
        required,
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
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    // Screen readers read these after the label
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const preset = isSizePreset(size);

    const settings = {"--input-size": preset ? undefined : toCssLength(size)} as CSSProperties;

    return (
        <div className={cx(styles.root, className)} data-size={preset ? size : undefined} style={{...settings, ...style}}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true"> *</span>}
                </label>
            )}
            {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            <div className={styles.field} data-invalid={invalid || undefined} data-disabled={disabled || undefined}>
                {leftIcon && <span className={styles.icon}>{leftIcon}</span>}
                <input
                    ref={ref}
                    id={inputId}
                    className={styles.input}
                    required={required}
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                    {...rest}
                />
                {rightIcon && <span className={styles.icon}>{rightIcon}</span>}
            </div>
            {errorMessage && <p id={errorId} className={styles.error}>{errorMessage}</p>}
        </div>
    );
});
