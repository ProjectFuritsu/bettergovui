import {forwardRef, useEffect, useRef, useState} from "react";
import {useKeepCaret} from "../../utils/caret";
import {Input, type InputProps} from "../Input/Input";

export interface MobileNumberDetails {
    /** A complete Philippine mobile number: 10 digits starting with 9. */
    valid: boolean;
    /** The number in international format, "+639171234567", once it's valid (otherwise null). Save this one. */
    e164: string | null;
}

export interface MobileNumberInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "prefix" | "name"> {
    /** The number, in any common format: "+639171234567", "09171234567" or "917 123 4567". */
    value?: string;
    /** The number shown at first, when you don't control `value`. */
    defaultValue?: string;
    /** Called as the number changes, with the digits after +63 (pass them back as `value`) and details. */
    onValueChange?: (number: string, details: MobileNumberDetails) => void;
    /** Sends the number with the form in international format ("+639171234567"), or empty while it's incomplete. */
    name?: string;
    /** Shown when someone leaves the field with an incomplete number. Default "Enter a mobile number like 917 123 4567." */
    invalidMessage?: string;
}

const isDigit = (char: string) => char >= "0" && char <= "9";

/**
 * The digits after +63, from a number in any format: "+63 917…", "0917…" or "917…".
 * A leading 0 or 63 is dropped, since the field already shows +63.
 */
export function toMobileDigits(text: string) {
    let digits = text.replace(/\D/g, "");
    if (digits.startsWith("63") && digits.length > 10) digits = digits.slice(2);
    else if (digits.startsWith("0")) digits = digits.slice(1);
    return digits.slice(0, 10);
}

// "9171234567" -> "917 123 4567"
const formatMobile = (digits: string) => [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6)].filter(Boolean).join(" ");

const isValidMobile = (digits: string) => /^9\d{9}$/.test(digits);

/**
 * A Philippine mobile number with +63 in front. Spaces are added as you type ("917 123 4567"), and pasted
 * numbers like "0917-123-4567" are cleaned up. Gives you "+639171234567" once it's complete.
 */
export const MobileNumberInput = forwardRef<HTMLInputElement, MobileNumberInputProps>(function MobileNumberInput(
    {
        value,
        defaultValue,
        onValueChange,
        name,
        invalidMessage = "Enter a mobile number like 917 123 4567.",
        error,
        label = "Mobile number",
        placeholder = "917 123 4567",
        onChange,
        onBlur,
        ...rest
    },
    ref,
) {
    const [internal, setInternal] = useState(() => toMobileDigits(defaultValue ?? ""));
    const [touched, setTouched] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const keepCaret = useKeepCaret(inputRef, isDigit);

    const digits = value === undefined ? internal : toMobileDigits(value);
    const valid = isValidMobile(digits);
    const showInvalid = touched && digits !== "" && !valid;

    // Stops the form from being sent with half a number (the browser shows the message)
    useEffect(() => {
        inputRef.current?.setCustomValidity(digits !== "" && !valid ? invalidMessage : "");
    }, [digits, valid, invalidMessage]);

    return (
        <>
            <Input
                ref={node => {
                    inputRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                label={label}
                placeholder={placeholder}
                prefix="+63"
                value={formatMobile(digits)}
                error={error ?? (showInvalid ? invalidMessage : undefined)}
                onChange={event => {
                    onChange?.(event);
                    const next = toMobileDigits(event.target.value);
                    keepCaret(event.target.value, event.target.selectionStart ?? event.target.value.length, formatMobile(next));
                    if (value === undefined) setInternal(next);
                    onValueChange?.(next, {valid: isValidMobile(next), e164: isValidMobile(next) ? `+63${next}` : null});
                }}
                onBlur={event => {
                    onBlur?.(event);
                    setTouched(true);
                }}
                {...rest}
            />
            {name && <input type="hidden" name={name} value={valid ? `+63${digits}` : ""} />}
        </>
    );
});
