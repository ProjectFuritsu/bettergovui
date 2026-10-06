import {
    createContext,
    forwardRef,
    useContext,
    useId,
    type CSSProperties,
    type FieldsetHTMLAttributes,
    type InputHTMLAttributes,
    type ReactNode,
} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./Radio.module.css";

interface RadioGroupContextValue {
    name: string;
    value: string | undefined;
    defaultValue: string | undefined;
    onValueChange: ((value: string) => void) | undefined;
    invalid: boolean;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/* ---------- RadioGroup ---------- */

export interface RadioGroupProps extends Omit<FieldsetHTMLAttributes<HTMLFieldSetElement>, "onChange" | "defaultValue"> {
    /** The question, shown above the choices. Screen readers read it with every choice. */
    label?: ReactNode;
    /** Helper text under the label. */
    description?: ReactNode;
    /** Error message under the choices. Pass `true` for red circles without a message. */
    error?: ReactNode;
    /** The chosen value. Pass this with onValueChange to control the group yourself. */
    value?: string;
    /** The value chosen at first, when you don't pass `value`. */
    defaultValue?: string;
    /** Called with the new value when the user picks a choice. */
    onValueChange?: (value: string) => void;
    /** The form field name sent with the form. Generated automatically if you leave it out. */
    name?: string;
    /** "vertical" (default) stacks the choices; "horizontal" puts them in a row. */
    orientation?: "vertical" | "horizontal";
    /** Space between the choices. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "md". */
    gap?: Size;
    /** Size of every Radio in the group. A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color of every Radio in the group: "primary", "success"… or any CSS color. Default "primary". */
    color?: Color;
    /** Show a * after the label and tell screen readers a choice is required. */
    required?: boolean;
}

/**
 * A group of Radios where only one can be chosen.
 * Arrow keys move between the choices (the browser handles that for radio buttons).
 */
export function RadioGroup({
    label,
    description,
    error,
    value,
    defaultValue,
    onValueChange,
    name,
    orientation = "vertical",
    gap,
    size = "md",
    color,
    required,
    className,
    style,
    children,
    "aria-describedby": describedBy,
    ...rest
}: RadioGroupProps) {
    const generatedId = useId();
    const groupName = name ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${generatedId}-description` : undefined;
    const errorId = errorMessage ? `${generatedId}-error` : undefined;
    const preset = isSizePreset(size);

    const settings = {
        "--radio-size": preset ? undefined : toCssLength(size),
        "--radio-color": color === undefined ? undefined : resolveColor(color),
        "--radio-gap": gap === undefined ? undefined : toSpacing(gap),
    } as CSSProperties;

    return (
        <RadioGroupContext.Provider value={{name: groupName, value, defaultValue, onValueChange, invalid}}>
            <fieldset
                role="radiogroup"
                className={cx(styles.group, className)}
                data-size={preset ? size : undefined}
                data-auto-contrast={isLightThemeColor(color) || undefined}
                aria-required={required || undefined}
                aria-invalid={invalid || undefined}
                aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                style={{...settings, ...style}}
                {...rest}>
                {label && (
                    <legend className={styles.legend}>
                        {label}
                        {required && <span className={styles.required} aria-hidden="true"> *</span>}
                    </legend>
                )}
                {description && <p id={descriptionId} className={styles.groupDescription}>{description}</p>}
                <div className={styles.options} data-orientation={orientation}>
                    {children}
                </div>
                {errorMessage && <p id={errorId} className={styles.groupError}>{errorMessage}</p>}
            </fieldset>
        </RadioGroupContext.Provider>
    );
}

/* ---------- Radio ---------- */

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type" | "color" | "value"> {
    /** The value this choice stands for. */
    value: string;
    /** Text next to the circle. Clicking it picks this choice. */
    label?: ReactNode;
    /** Helper text under the label. */
    description?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Inside a RadioGroup, the group's size is used. */
    size?: Size;
    /** Color when chosen. Inside a RadioGroup, the group's color is used. */
    color?: Color;
}

/** One choice. Use it inside a RadioGroup. `className` and `style` go on the outer wrapper. */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(function Radio(
    {value, label, description, size, color, id, disabled, className, style, onChange, "aria-describedby": describedBy, ...rest},
    ref,
) {
    const group = useContext(RadioGroupContext);
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const preset = size !== undefined && isSizePreset(size);

    // Inside a group: controlled when the group has `value`, otherwise the group's defaultValue picks the start
    const checkedProps = group?.value !== undefined
        ? {checked: group.value === value}
        : group?.defaultValue !== undefined
            ? {defaultChecked: group.defaultValue === value}
            : {};

    const settings = {
        "--radio-size": size === undefined || preset ? undefined : toCssLength(size),
        "--radio-color": color === undefined ? undefined : resolveColor(color),
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
                    type="radio"
                    id={inputId}
                    name={group?.name}
                    value={value}
                    className={styles.input}
                    disabled={disabled}
                    aria-invalid={group?.invalid || undefined}
                    aria-describedby={cx(descriptionId, describedBy) || undefined}
                    onChange={event => {
                        onChange?.(event);
                        group?.onValueChange?.(value);
                    }}
                    {...checkedProps}
                    {...rest}
                />
                <span className={styles.dot} aria-hidden="true" />
            </span>
            {(label || description) && (
                <span className={styles.body}>
                    {label && <label htmlFor={inputId} className={styles.label}>{label}</label>}
                    {description && <span id={descriptionId} className={styles.description}>{description}</span>}
                </span>
            )}
        </div>
    );
});
