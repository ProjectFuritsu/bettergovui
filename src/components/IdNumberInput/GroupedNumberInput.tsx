import {forwardRef, useEffect, useRef, useState} from "react";
import {useMessages} from "../../i18n/LanguageProvider";
import {useKeepCaret} from "../../utils/caret";
import {Input, type InputProps} from "../Input/Input";

export interface GroupedNumberInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "name"> {
    /** How the digits are grouped, e.g. `[2, 7, 1]` for an SSS number (34-1234567-8). */
    groups: number[];
    /** Between the groups. Default "-". */
    separator?: string;
    /** How many digits make a complete number. Default: all the groups' digits. Give several when some can be left off (e.g. a TIN with or without its branch code). */
    validLengths?: number[];
    /** The number, with or without separators. */
    value?: string;
    /** The number shown at first, when you don't control `value`. */
    defaultValue?: string;
    /** Called as the number changes, with just the digits and whether the number is complete. */
    onValueChange?: (digits: string, details: {complete: boolean}) => void;
    /** Sends the digits with the form (no separators), or empty while the number is incomplete. */
    name?: string;
    /** Shown when someone leaves the field with an incomplete number. */
    invalidMessage?: string;
}

const isDigit = (char: string) => char >= "0" && char <= "9";

// "341234567" with groups [2, 7, 1] -> "34-1234567"
export function formatGroups(digits: string, groups: number[], separator = "-") {
    const parts: string[] = [];
    let start = 0;
    for (const size of groups) {
        if (start >= digits.length) break;
        parts.push(digits.slice(start, start + size));
        start += size;
    }
    return parts.join(separator);
}

/**
 * A number written in groups of digits, like a government ID: the separators are added as you type,
 * and pasted numbers with spaces or dashes are cleaned up. Built for PhilSysInput and TinInput, and
 * ready for others, e.g. SSS `groups={[2, 7, 1]}`, PhilHealth `[2, 9, 1]` or Pag-IBIG `[4, 4, 4]`.
 */
export const GroupedNumberInput = forwardRef<HTMLInputElement, GroupedNumberInputProps>(function GroupedNumberInput(
    {
        groups,
        separator = "-",
        validLengths,
        value,
        defaultValue,
        onValueChange,
        name,
        invalidMessage,
        error,
        placeholder,
        onChange,
        onBlur,
        ...rest
    },
    ref,
) {
    const t = useMessages();
    const maxLength = groups.reduce((total, size) => total + size, 0);
    const lengths = validLengths ?? [maxLength];
    const clean = (text: string) => text.replace(/\D/g, "").slice(0, maxLength);

    const [internal, setInternal] = useState(() => clean(defaultValue ?? ""));
    const [touched, setTouched] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const keepCaret = useKeepCaret(inputRef, isDigit);

    const digits = value === undefined ? internal : clean(value);
    const complete = lengths.includes(digits.length);
    const message = invalidMessage ?? t.idNumber.incomplete;
    const showInvalid = touched && digits !== "" && !complete;

    // Stops the form from being sent with part of a number (the browser shows the message)
    useEffect(() => {
        inputRef.current?.setCustomValidity(digits !== "" && !complete ? message : "");
    }, [digits, complete, message]);

    return (
        <>
            <Input
                ref={node => {
                    inputRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                spellCheck={false}
                placeholder={placeholder ?? formatGroups("0".repeat(maxLength), groups, separator)}
                value={formatGroups(digits, groups, separator)}
                error={error ?? (showInvalid ? message : undefined)}
                onChange={event => {
                    onChange?.(event);
                    const next = clean(event.target.value);
                    keepCaret(event.target.value, event.target.selectionStart ?? event.target.value.length, formatGroups(next, groups, separator));
                    if (value === undefined) setInternal(next);
                    onValueChange?.(next, {complete: lengths.includes(next.length)});
                }}
                onBlur={event => {
                    onBlur?.(event);
                    setTouched(true);
                }}
                {...rest}
            />
            {name && <input type="hidden" name={name} value={complete ? digits : ""} />}
        </>
    );
});
