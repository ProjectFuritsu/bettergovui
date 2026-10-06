import {forwardRef, useEffect, useRef, useState} from "react";
import {useKeepCaret} from "../../utils/caret";
import {useMessages} from "../../i18n/LanguageProvider";
import {Input, type InputProps} from "../Input/Input";

export interface PesoInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "prefix" | "name" | "min" | "max"> {
    /** The amount in pesos, e.g. 1500.5. `null` clears the field. */
    value?: number | null;
    /** The amount shown at first, when you don't control `value`. */
    defaultValue?: number;
    /** Called as the amount changes, with the number (or null when empty) and the text in the field. */
    onValueChange?: (amount: number | null, text: string) => void;
    /** Sends the amount with the form as plain digits, e.g. "1500.50" (no ₱ or commas). */
    name?: string;
    /** The smallest amount allowed. */
    min?: number;
    /** The largest amount allowed. */
    max?: number;
    /** Digits after the decimal point: 2 for centavos (default), 0 for whole pesos. */
    decimals?: number;
    /** The messages for amounts that are too small or too large. */
    messages?: {belowMin?: (min: string) => string; aboveMax?: (max: string) => string};
}

const isAmountChar = (char: string) => (char >= "0" && char <= "9") || char === ".";

// 1234.5 -> "1,234.50"
export function formatPeso(amount: number, decimals = 2) {
    return amount.toLocaleString("en-PH", {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
}

// What's typed -> "1,234.5": only digits and one decimal point, commas every three digits
function formatTyping(typed: string, decimals: number) {
    const cleaned = typed.replace(/[^\d.]/g, "");
    const dot = decimals > 0 ? cleaned.indexOf(".") : -1;
    let whole = (dot === -1 ? cleaned.replace(/\./g, "") : cleaned.slice(0, dot)).replace(/^0+(?=\d)/, "").slice(0, 13);
    const cents = dot === -1 ? null : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, decimals);
    if (cents !== null && whole === "") whole = "0";
    const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return cents === null ? grouped : `${grouped}.${cents}`;
}

const parse = (text: string) => (text === "" || text === "." ? null : Number(text.replace(/,/g, "")));

/**
 * An amount in Philippine pesos, with ₱ in front. Commas are added as you type ("15,000") and centavos are
 * filled in when you leave the field ("15,000.00"). Gives you the amount as a number.
 */
export const PesoInput = forwardRef<HTMLInputElement, PesoInputProps>(function PesoInput(
    {
        value,
        defaultValue,
        onValueChange,
        name,
        min,
        max,
        decimals = 2,
        messages,
        error,
        placeholder = decimals > 0 ? "0.00" : "0",
        onChange,
        onBlur,
        ...rest
    },
    ref,
) {
    const t = useMessages();
    const [text, setText] = useState(() => (defaultValue === undefined ? "" : formatPeso(defaultValue, decimals)));
    const [touched, setTouched] = useState(false);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const keepCaret = useKeepCaret(inputRef, isAmountChar);
    const amount = parse(text);

    // When `value` is changed from outside (e.g. a "Pay the full amount" button), show it
    useEffect(() => {
        if (value !== undefined && value !== amount) setText(value === null ? "" : formatPeso(value, decimals));
        // Only react to new values from outside, not to typing
    }, [value]);

    const belowMin = amount !== null && min !== undefined && amount < min;
    const aboveMax = amount !== null && max !== undefined && amount > max;
    const problem = belowMin
        ? (messages?.belowMin ?? t.peso.belowMin)(formatPeso(min!, decimals))
        : aboveMax
          ? (messages?.aboveMax ?? t.peso.aboveMax)(formatPeso(max!, decimals))
          : "";

    // Stops the form from being sent with an amount outside min–max (the browser shows the message)
    useEffect(() => {
        inputRef.current?.setCustomValidity(problem);
    }, [problem]);

    return (
        <>
            <Input
                ref={node => {
                    inputRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                prefix="₱"
                placeholder={placeholder}
                value={text}
                error={error ?? (touched && problem ? problem : undefined)}
                onChange={event => {
                    onChange?.(event);
                    const next = formatTyping(event.target.value, decimals);
                    keepCaret(event.target.value, event.target.selectionStart ?? event.target.value.length, next);
                    setText(next);
                    onValueChange?.(parse(next), next);
                }}
                onBlur={event => {
                    onBlur?.(event);
                    setTouched(true);
                    // Fill in the centavos: "1500" -> "1,500.00"
                    if (amount !== null) setText(formatPeso(amount, decimals));
                }}
                {...rest}
            />
            {name && <input type="hidden" name={name} value={amount === null ? "" : amount.toFixed(decimals)} />}
        </>
    );
});
