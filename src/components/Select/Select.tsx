import {forwardRef, useId, type CSSProperties, type ReactNode, type SelectHTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Select.module.css";

/** An option: just the text (also used as the value), or an object with a separate value. */
export type SelectOption = string | {value: string; label: string; disabled?: boolean};

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    /** Text above the field. Clicking it focuses the field. */
    label?: ReactNode;
    /** Helper text between the label and the field. */
    description?: ReactNode;
    /** Error message below the field. Pass `true` for the red border without a message. */
    error?: ReactNode;
    /** The choices, e.g. `["Davao City", "Tagum City"]` or `[{value: "dvo", label: "Davao City"}]`. You can also pass `<option>` children instead. */
    options?: SelectOption[];
    /** Grey text shown until something is chosen, e.g. "Choose a city". */
    placeholder?: string;
    /** An icon inside the field, before the text. */
    leftIcon?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md", the same height as Input and Button. */
    size?: Size;
}

/**
 * A dropdown, built on the browser's own `<select>`: on phones it opens the native picker.
 * `className` and `style` go on the outer wrapper; every other prop goes on the `<select>`.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
    {
        label,
        description,
        error,
        options,
        placeholder,
        leftIcon,
        size = "md",
        id,
        required,
        disabled,
        value,
        defaultValue,
        children,
        className,
        style,
        "aria-describedby": describedBy,
        ...rest
    },
    ref,
) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = errorMessage ? `${selectId}-error` : undefined;
    const preset = isSizePreset(size);

    // With a placeholder and nothing chosen yet, start on the (empty) placeholder option
    const startValue = placeholder && value === undefined && defaultValue === undefined ? "" : defaultValue;

    const settings = {"--select-size": preset ? undefined : toCssLength(size)} as CSSProperties;

    return (
        <div className={cx(styles.root, className)} data-size={preset ? size : undefined} style={{...settings, ...style}}>
            {label && (
                <label htmlFor={selectId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true"> *</span>}
                </label>
            )}
            {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            <div
                className={styles.field}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                data-left-icon={leftIcon ? true : undefined}>
                {leftIcon && <span className={cx(styles.icon, styles.leftIcon)}>{leftIcon}</span>}
                <select
                    ref={ref}
                    id={selectId}
                    className={styles.select}
                    required={required}
                    disabled={disabled}
                    value={value}
                    defaultValue={startValue}
                    aria-invalid={invalid || undefined}
                    aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                    {...rest}>
                    {/* hidden: shown in the field, but not offered in the list */}
                    {placeholder && <option value="" disabled hidden>{placeholder}</option>}
                    {options?.map(option => {
                        const {value: optionValue, label: optionLabel, disabled: optionDisabled} =
                            typeof option === "string" ? {value: option, label: option, disabled: false} : option;
                        return <option key={optionValue} value={optionValue} disabled={optionDisabled}>{optionLabel}</option>;
                    })}
                    {children}
                </select>
                <svg className={cx(styles.icon, styles.chevron)} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
            {errorMessage && <p id={errorId} className={styles.error}>{errorMessage}</p>}
        </div>
    );
});
