import {useId, type CSSProperties, type FieldsetHTMLAttributes, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import {toSpacing, type Size} from "../../utils/size";
import styles from "./Fieldset.module.css";

export interface FieldsetProps extends FieldsetHTMLAttributes<HTMLFieldSetElement> {
    /** The group's title, e.g. "Business address". Screen readers say it before each field inside. */
    legend: ReactNode;
    /** Helper text under the title. */
    description?: ReactNode;
    /** An error about the whole group, e.g. "Enter either a mobile number or an email". Shown at the bottom. */
    error?: ReactNode;
    /**
     * How it looks:
     * - `"outline"`: a thin border around the group (default)
     * - `"filled"`: a soft grey background
     * - `"plain"`: no box, just the title above the fields
     */
    variant?: "outline" | "filled" | "plain";
    /** Space between the fields. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "md". */
    gap?: Size;
}

/**
 * Groups related form fields under one title, e.g. an address. `disabled` turns off every field inside at once.
 */
export function Fieldset({
    legend,
    description,
    error,
    variant = "outline",
    gap,
    className,
    style,
    children,
    "aria-describedby": describedBy,
    ...rest
}: FieldsetProps) {
    const id = useId();
    const descriptionId = description ? `${id}-description` : undefined;
    const errorId = error ? `${id}-error` : undefined;
    const settings = {"--fieldset-gap": gap === undefined ? undefined : toSpacing(gap)} as CSSProperties;

    return (
        <fieldset
            className={cx(styles.fieldset, className)}
            data-variant={variant}
            data-invalid={error ? true : undefined}
            aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
            style={{...settings, ...style}}
            {...rest}>
            <legend className={styles.legend}>{legend}</legend>
            {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            <div className={styles.content}>{children}</div>
            {error && <p id={errorId} className={styles.error}>{error}</p>}
        </fieldset>
    );
}
