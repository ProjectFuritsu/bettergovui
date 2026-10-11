import {
    forwardRef,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
} from "react";
import {createPortal} from "react-dom";
import {dateLocale, useLanguage, useMessages} from "../../i18n/LanguageProvider";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import inputStyles from "../Input/Input.module.css";
import styles from "./DateInput.module.css";

type DateValue = Date | string | null;

export interface DateInputLabels {
    /** The name of the calendar popup, for screen readers */
    calendar: string;
    previousMonth: string;
    nextMonth: string;
    time: string;
}

export interface DateInputProps
    extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "value" | "defaultValue" | "onChange" | "children" | "type"> {
    /** Text above the field. Clicking it focuses the field. */
    label?: ReactNode;
    /** Helper text between the label and the field. */
    description?: ReactNode;
    /** Error message below the field. Pass `true` for the red border without a message. */
    error?: ReactNode;
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
    /** Grey text shown until a date is picked. Default "Pick a date", in the current language. */
    placeholder?: string;
    /** Sent with a form under this name, as "2026-10-31" (or "2026-10-31T14:30" with withTime). */
    name?: string;
    /** Marks the label with a red asterisk. */
    required?: boolean;
    /** The day each week starts on: 0 is Sunday (the default), 1 is Monday. */
    weekStartsOn?: 0 | 1;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md", the same height as Input and Button. */
    size?: Size;
    /** Change the calendar's texts for screen readers, e.g. `{ nextMonth: "Sunod nga bulan" }`. */
    labels?: Partial<DateInputLabels>;
    /** Called with the new date (or `null` when it's cleared) and its text, e.g. "2026-10-31". */
    onValueChange?: (date: Date | null, value: string) => void;
}

const pad = (number: number) => String(number).padStart(2, "0");

// The text for a date, in local time: "2026-10-31" or "2026-10-31T14:30".
// (toISOString() would use UTC, so in the Philippines it can show the day before.)
function toFieldText(date: Date | null, withTime: boolean) {
    if (!date) return "";
    const day = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    return withTime ? `${day}T${pad(date.getHours())}:${pad(date.getMinutes())}` : day;
}

// A Date, "2026-10-31" or "2026-10-31T14:30" -> a Date in local time (or null when empty or invalid)
function toDate(value: DateValue | undefined) {
    if (value === null || value === undefined) return null;
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(value);
    if (!match) return null;
    const [, year, month, day, hours = "0", minutes = "0"] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes));
}

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
const isSameDay = (a: Date | null, b: Date | null) => Boolean(a && b && startOfDay(a).getTime() === startOfDay(b).getTime());

// The same day in another month; the 31st becomes the 30th (or 28th) in a shorter month
function addMonths(date: Date, months: number) {
    const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), lastDay));
}

/**
 * A date field: a button that opens a calendar. Takes and gives JavaScript Dates.
 * The calendar works with the keyboard: arrows move by day and week, Page Up / Page Down by month
 * (with Shift, by year), Home / End go to the start / end of the week, Escape closes it.
 * `className` and `style` go on the outer wrapper; every other prop goes on the `<button>`.
 */
export const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(function DateInput(
    {
        label,
        description,
        error,
        value,
        defaultValue,
        min,
        max,
        withTime = false,
        placeholder,
        name,
        required,
        weekStartsOn = 0,
        size = "md",
        labels,
        onValueChange,
        id,
        disabled,
        className,
        style,
        onClick,
        "aria-describedby": describedBy,
        ...rest
    },
    ref,
) {
    const t = useMessages();
    const locale = dateLocale(useLanguage());
    const text = {...t.datePicker, ...labels};

    const generatedId = useId();
    const fieldId = id ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = errorMessage ? `${fieldId}-error` : undefined;
    const preset = isSizePreset(size);
    const settings = {"--input-size": preset ? undefined : toCssLength(size)} as CSSProperties;

    const [ownDate, setOwnDate] = useState(() => toDate(defaultValue));
    const selected = value === undefined ? ownDate : toDate(value);
    const minDay = useMemo(() => { const date = toDate(min); return date && startOfDay(date); }, [min]);
    const maxDay = useMemo(() => { const date = toDate(max); return date && startOfDay(date); }, [max]);
    const today = startOfDay(new Date());

    const [open, setOpen] = useState(false);
    // The day the keyboard is on. The calendar shows this day's month.
    const [focusedDay, setFocusedDay] = useState(today);
    const [position, setPosition] = useState<{top: number; left: number; side: "top" | "bottom"} | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    // Set when the keyboard (or opening) moved the day, so focus follows it
    const moveFocus = useRef(false);

    const isDisabledDay = (day: Date) => Boolean((minDay && day < minDay) || (maxDay && day > maxDay));

    function commit(date: Date | null) {
        if (value === undefined) setOwnDate(date);
        onValueChange?.(date, toFieldText(date, withTime));
    }

    function openCalendar() {
        // Start on the chosen day, else today (or the nearest day that can be picked)
        let start = selected ? startOfDay(selected) : today;
        if (minDay && start < minDay) start = minDay;
        if (maxDay && start > maxDay) start = maxDay;
        setFocusedDay(start);
        moveFocus.current = true;
        setOpen(true);
    }

    function close(returnFocus = true) {
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus();
    }

    function pickDay(day: Date) {
        if (isDisabledDay(day)) return;
        // Keeps the time already chosen
        commit(new Date(day.getFullYear(), day.getMonth(), day.getDate(), selected?.getHours() ?? 0, selected?.getMinutes() ?? 0));
        if (withTime) {
            setFocusedDay(day);
        } else {
            close();
        }
    }

    function moveTo(day: Date) {
        // Stops at the first and last day that can be picked
        let next = day;
        if (minDay && next < minDay) next = minDay;
        if (maxDay && next > maxDay) next = maxDay;
        moveFocus.current = true;
        setFocusedDay(next);
    }

    function onGridKeyDown(event: ReactKeyboardEvent<HTMLTableElement>) {
        const weekday = (focusedDay.getDay() - weekStartsOn + 7) % 7;
        const moves: Record<string, () => Date> = {
            ArrowLeft: () => addDays(focusedDay, -1),
            ArrowRight: () => addDays(focusedDay, 1),
            ArrowUp: () => addDays(focusedDay, -7),
            ArrowDown: () => addDays(focusedDay, 7),
            Home: () => addDays(focusedDay, -weekday),
            End: () => addDays(focusedDay, 6 - weekday),
            PageUp: () => addMonths(focusedDay, event.shiftKey ? -12 : -1),
            PageDown: () => addMonths(focusedDay, event.shiftKey ? 12 : 1),
        };
        const move = moves[event.key];
        if (!move) return;
        event.preventDefault();
        moveTo(move());
    }

    // Puts keyboard focus on the day the keyboard moved to (also right after opening)
    useEffect(() => {
        // Waits until it's placed: while it's still hidden, it can't take focus
        if (!open || !position || !moveFocus.current) return;
        moveFocus.current = false;
        popoverRef.current?.querySelector<HTMLElement>('[data-day][tabindex="0"]')?.focus();
    }, [open, focusedDay, position]);

    // Place it under the field (above when there's no room below), and again on scroll or resize
    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }
        const trigger = triggerRef.current;
        const view = trigger?.ownerDocument.defaultView;
        if (!trigger || !view) return;

        const update = () => {
            const popover = popoverRef.current;
            if (!popover) return;
            const box = trigger.getBoundingClientRect();
            // offsetWidth / offsetHeight: the real size, also while the opening animation shrinks it
            const width = popover.offsetWidth;
            const height = popover.offsetHeight;
            const gap = 4;
            const padding = 8;
            const roomBelow = view.innerHeight - padding - box.bottom - gap;
            const roomAbove = box.top - gap - padding;
            const side = roomBelow >= height || roomBelow >= roomAbove ? "bottom" : "top";
            const top = side === "bottom" ? box.bottom + gap : box.top - gap - height;
            const next = {
                side,
                // On a small screen with no room on either side, it covers the field rather than run off the screen
                top: Math.max(padding, Math.min(top, view.innerHeight - height - padding)),
                left: Math.max(padding, Math.min(box.left, view.innerWidth - width - padding)),
            } as const;
            setPosition(current =>
                current && current.side === next.side && current.top === next.top && current.left === next.left ? current : next,
            );
        };
        update();
        view.addEventListener("scroll", update, true);
        view.addEventListener("resize", update);
        return () => {
            view.removeEventListener("scroll", update, true);
            view.removeEventListener("resize", update);
        };
    }, [open, withTime, focusedDay.getMonth(), focusedDay.getFullYear()]);

    // Closes on a click outside of it
    useEffect(() => {
        if (!open) return;
        const document = triggerRef.current?.ownerDocument;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (popoverRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
            setOpen(false);
        };
        document?.addEventListener("pointerdown", onPointerDown);
        return () => document?.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    function onPopoverKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape") {
            // Not the Modal or Drawer this field may be in: Escape closes only the calendar
            event.preventDefault();
            event.stopPropagation();
            close();
            return;
        }
        if (event.key !== "Tab") return;
        // Tab stays inside the calendar while it's open
        const stops = Array.from(
            popoverRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled):not([tabindex="-1"]), input:not(:disabled)') ?? [],
        );
        const first = stops[0];
        const last = stops[stops.length - 1];
        const active = popoverRef.current?.ownerDocument.activeElement;
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last?.focus();
        } else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first?.focus();
        }
    }

    // The 6 weeks shown: the month of the focused day, with the days around it
    const weeks = useMemo(() => {
        const first = new Date(focusedDay.getFullYear(), focusedDay.getMonth(), 1);
        const start = addDays(first, -((first.getDay() - weekStartsOn + 7) % 7));
        return Array.from({length: 6}, (_, week) => Array.from({length: 7}, (_, day) => addDays(start, week * 7 + day)));
    }, [focusedDay.getFullYear(), focusedDay.getMonth(), weekStartsOn]);

    const formats = useMemo(
        () => ({
            field: new Intl.DateTimeFormat(locale, withTime ? {dateStyle: "long", timeStyle: "short"} : {dateStyle: "long"}),
            month: new Intl.DateTimeFormat(locale, {month: "long", year: "numeric"}),
            weekdayShort: new Intl.DateTimeFormat(locale, {weekday: "short"}),
            weekdayLong: new Intl.DateTimeFormat(locale, {weekday: "long"}),
            day: new Intl.DateTimeFormat(locale, {dateStyle: "full"}),
        }),
        [locale, withTime],
    );

    const monthTitleId = `${fieldId}-month`;
    const timeId = `${fieldId}-time`;
    const previousMonthEnd = new Date(focusedDay.getFullYear(), focusedDay.getMonth(), 0);
    const nextMonthStart = new Date(focusedDay.getFullYear(), focusedDay.getMonth() + 1, 1);

    const popoverStyle = {
        ...settings,
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        // Hidden until it's been measured and placed, so it never flashes in the wrong spot
        visibility: position ? undefined : "hidden",
    } as CSSProperties;

    return (
        <div className={cx(inputStyles.root, className)} data-size={preset ? size : undefined} style={{...settings, ...style}}>
            {label && (
                <label htmlFor={fieldId} className={inputStyles.label}>
                    {label}
                    {required && <span className={inputStyles.required} aria-hidden="true"> *</span>}
                </label>
            )}
            {description && <p id={descriptionId} className={inputStyles.description}>{description}</p>}
            <button
                ref={node => {
                    triggerRef.current = node;
                    if (typeof ref === "function") ref(node);
                    else if (ref) ref.current = node;
                }}
                id={fieldId}
                type="button"
                className={cx(inputStyles.field, styles.trigger)}
                data-invalid={invalid || undefined}
                data-empty={selected ? undefined : true}
                disabled={disabled}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-invalid={invalid || undefined}
                aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                onClick={event => {
                    onClick?.(event);
                    if (event.defaultPrevented) return;
                    if (open) close(false);
                    else openCalendar();
                }}
                {...rest}>
                <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 2v4M16 2v4M3 10h18" />
                    <rect x="3" y="4" width="18" height="18" rx="2" />
                </svg>
                <span className={styles.value}>{selected ? formats.field.format(selected) : placeholder ?? t.datePicker.placeholder}</span>
            </button>
            {name && <input type="hidden" name={name} value={toFieldText(selected, withTime)} disabled={disabled} />}
            {errorMessage && <p id={errorId} className={inputStyles.error}>{errorMessage}</p>}
            {open && triggerRef.current && createPortal(
                <div
                    ref={popoverRef}
                    className={styles.popover}
                    role="dialog"
                    aria-label={text.calendar}
                    data-size={preset ? size : undefined}
                    data-side={position?.side ?? "bottom"}
                    style={popoverStyle}
                    onKeyDown={onPopoverKeyDown}>
                    <div className={styles.header}>
                        <button
                            type="button"
                            className={styles.nav}
                            aria-label={text.previousMonth}
                            disabled={isDisabledDay(previousMonthEnd)}
                            onClick={() => setFocusedDay(day => addMonths(day, -1))}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <div id={monthTitleId} className={styles.month} aria-live="polite">{formats.month.format(focusedDay)}</div>
                        <button
                            type="button"
                            className={styles.nav}
                            aria-label={text.nextMonth}
                            disabled={isDisabledDay(nextMonthStart)}
                            onClick={() => setFocusedDay(day => addMonths(day, 1))}>
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
                        </button>
                    </div>
                    <table className={styles.grid} role="grid" aria-labelledby={monthTitleId} onKeyDown={onGridKeyDown}>
                        <thead>
                            <tr>
                                {weeks[0].map(day => (
                                    <th key={day.getDay()} scope="col" className={styles.weekday} abbr={formats.weekdayLong.format(day)}>
                                        {formats.weekdayShort.format(day).slice(0, 2)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weeks.map(week => (
                                <tr key={week[0].getTime()}>
                                    {week.map(day => {
                                        const isSelected = isSameDay(day, selected);
                                        return (
                                            <td key={day.getTime()} className={styles.cell} role="gridcell" aria-selected={isSelected}>
                                                <button
                                                    type="button"
                                                    className={styles.day}
                                                    data-day
                                                    data-selected={isSelected || undefined}
                                                    data-today={isSameDay(day, today) || undefined}
                                                    data-outside={day.getMonth() !== focusedDay.getMonth() || undefined}
                                                    // Only the focused day is a Tab stop; arrows move between days
                                                    tabIndex={isSameDay(day, focusedDay) ? 0 : -1}
                                                    disabled={isDisabledDay(day)}
                                                    aria-label={formats.day.format(day)}
                                                    aria-current={isSameDay(day, today) ? "date" : undefined}
                                                    onClick={() => pickDay(day)}>
                                                    {day.getDate()}
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {withTime && (
                        <div className={styles.time}>
                            <label htmlFor={timeId} className={styles.timeLabel}>{text.time}</label>
                            <input
                                id={timeId}
                                type="time"
                                className={styles.timeInput}
                                // Starts again on another day's time; not on every keystroke, which would lose focus
                                key={selected ? startOfDay(selected).getTime() : "empty"}
                                defaultValue={selected ? `${pad(selected.getHours())}:${pad(selected.getMinutes())}` : ""}
                                // A time needs a day to belong to
                                disabled={!selected}
                                onChange={event => {
                                    const match = /^(\d{2}):(\d{2})/.exec(event.target.value);
                                    if (!match || !selected) return;
                                    commit(new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), Number(match[1]), Number(match[2])));
                                }}
                                onKeyDown={event => {
                                    if (event.key === "Enter") close();
                                }}
                            />
                        </div>
                    )}
                </div>,
                // Inside the Modal or Drawer it's in, so it shows above it; else on the page's <body>
                triggerRef.current.closest("dialog") ?? triggerRef.current.ownerDocument.body,
            )}
        </div>
    );
});
