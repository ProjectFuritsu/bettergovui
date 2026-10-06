import {
    forwardRef,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useRef,
    type CSSProperties,
    type ReactNode,
    type TextareaHTMLAttributes,
} from "react";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Textarea.module.css";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Text above the field. Clicking it focuses the field. */
    label?: ReactNode;
    /** Helper text between the label and the field. */
    description?: ReactNode;
    /** Error message below the field. Pass `true` for the red border without a message. */
    error?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Grow taller as the user types, instead of scrolling. Starts at `rows` lines. */
    autosize?: boolean;
    /** With `autosize`: stop growing after this many lines and scroll instead. */
    maxRows?: number;
}

/** A multi-line text field. `className` and `style` go on the outer wrapper; every other prop goes on the `<textarea>`. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
    {
        label,
        description,
        error,
        size = "md",
        autosize = false,
        maxRows,
        rows = 3,
        id,
        required,
        disabled,
        className,
        style,
        onInput,
        "aria-describedby": describedBy,
        ...rest
    },
    ref,
) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => textareaRef.current as HTMLTextAreaElement);

    // With autosize: make the field exactly as tall as its text (up to maxRows lines)
    function resize() {
        const element = textareaRef.current;
        if (!element || !autosize) return;
        const computed = getComputedStyle(element);
        const borders = parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
        const padding = parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
        const maxHeight = maxRows ? maxRows * parseFloat(computed.lineHeight) + padding + borders : Infinity;

        element.style.height = "auto";
        const contentHeight = element.scrollHeight + borders;
        element.style.height = `${Math.min(contentHeight, maxHeight)}px`;
        element.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
    }

    // Also resize when the value is changed from outside (a controlled `value`)
    useLayoutEffect(resize, [autosize, maxRows, rest.value]);

    // Turning autosize off gives the user back the normal, draggable height
    useLayoutEffect(() => {
        const element = textareaRef.current;
        if (element && !autosize) {
            element.style.height = "";
            element.style.overflowY = "";
        }
    }, [autosize]);

    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${textareaId}-description` : undefined;
    const errorId = errorMessage ? `${textareaId}-error` : undefined;
    const preset = isSizePreset(size);

    const settings = {"--textarea-size": preset ? undefined : toCssLength(size)} as CSSProperties;

    return (
        <div className={cx(styles.root, className)} data-size={preset ? size : undefined} style={{...settings, ...style}}>
            {label && (
                <label htmlFor={textareaId} className={styles.label}>
                    {label}
                    {required && <span className={styles.required} aria-hidden="true"> *</span>}
                </label>
            )}
            {description && <p id={descriptionId} className={styles.description}>{description}</p>}
            <textarea
                ref={textareaRef}
                id={textareaId}
                rows={rows}
                className={styles.textarea}
                data-autosize={autosize || undefined}
                required={required}
                disabled={disabled}
                aria-invalid={invalid || undefined}
                aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                onInput={event => {
                    resize();
                    onInput?.(event);
                }}
                {...rest}
            />
            {errorMessage && <p id={errorId} className={styles.error}>{errorMessage}</p>}
        </div>
    );
});
