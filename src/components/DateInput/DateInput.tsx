import {forwardRef} from "react";
import {Input, type InputProps} from "../Input/Input";

type DateValue = Date | string | null;

export interface DateInputProps extends Omit<InputProps, "type" | "value" | "defaultValue" | "min" | "max"> {
    /** The chosen date: a Date, or text like "2026-10-31" ("2026-10-31T14:30" with withTime). `null` clears it. */
    value?: DateValue;
    /** The date shown at first, when you don't control `value`. */
    defaultValue?: Date | string;
    /** The earliest date that can be picked, e.g. `new Date()` for "not in the past". */
    min?: Date | string;
    /** The latest date that can be picked. */
    max?: Date | string;
    /** Pick a time too, e.g. for appointments. */
    withTime?: boolean;
    /** Called with the new date (or `null` when it's cleared) and the field's text. */
    onValueChange?: (date: Date | null, value: string) => void;
}

const pad = (number: number) => String(number).padStart(2, "0");

// The field's text for a date, in local time: "2026-10-31" or "2026-10-31T14:30".
// (toISOString() would use UTC, so in the Philippines it can show the day before.)
function toFieldText(date: DateValue | undefined, withTime: boolean) {
    if (date === null || date === undefined) return date === null ? "" : undefined;
    if (typeof date === "string") return date;
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return withTime ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

// "2026-10-31" or "2026-10-31T14:30" -> a Date in local time (or null when empty or invalid)
function fromFieldText(text: string) {
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(text);
    if (!match) return null;
    const [, year, month, day, hours = "0", minutes = "0"] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
}

/**
 * A date field with the browser's own date picker, which works well on phones and with screen
 * readers. Takes and gives JavaScript Dates. It has the same label, description and error as Input.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
    {value, defaultValue, min, max, withTime = false, onValueChange, onChange, ...rest},
    ref,
) {
    return (
        <Input
            ref={ref}
            type={withTime ? "datetime-local" : "date"}
            value={toFieldText(value, withTime)}
            defaultValue={toFieldText(defaultValue, withTime)}
            min={toFieldText(min, withTime)}
            max={toFieldText(max, withTime)}
            onChange={event => {
                onChange?.(event);
                onValueChange?.(fromFieldText(event.target.value), event.target.value);
            }}
            {...rest}
        />
    );
});
