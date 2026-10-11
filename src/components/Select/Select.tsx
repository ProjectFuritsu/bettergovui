import {
    Children,
    forwardRef,
    isValidElement,
    useEffect,
    useId,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent as ReactKeyboardEvent,
    type ReactNode,
    type SelectHTMLAttributes,
} from "react";
import {createPortal} from "react-dom";
import {useMessages} from "../../i18n/LanguageProvider";
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
    /**
     * Use the browser's own `<select>` and its list (on phones, the system picker) instead of
     * the kit's list. No search. Default false.
     */
    native?: boolean;
    /** A search box above the list, to filter long lists. Default: shown when there are more than 8 choices. */
    searchable?: boolean;
    /** Grey text in the search box. Default "Search…", in the current language. */
    searchPlaceholder?: string;
    /** Shown when the search finds nothing. Default "Nothing found", in the current language. */
    noResultsText?: ReactNode;
}

interface Item {
    value: string;
    label: string;
    disabled: boolean;
    /** The heading of its `<optgroup>`, shown above the group's first choice */
    group?: string;
}

const textOf = (node: ReactNode): string => Children.toArray(node).filter(child => typeof child === "string" || typeof child === "number").join("");

// The choices of the list, from the `options` prop and from <option> / <optgroup> children
function toItems(options: SelectOption[] | undefined, children: ReactNode) {
    const items: Item[] = (options ?? []).map(option =>
        typeof option === "string" ? {value: option, label: option, disabled: false} : {...option, disabled: Boolean(option.disabled)},
    );
    const read = (nodes: ReactNode, group?: string, groupDisabled = false) => {
        Children.forEach(nodes, child => {
            if (!isValidElement<{value?: string | number; label?: string; disabled?: boolean; children?: ReactNode}>(child)) return;
            if (child.type === "optgroup") {
                read(child.props.children, child.props.label, Boolean(child.props.disabled));
            } else if (child.type === "option") {
                const label = child.props.label ?? textOf(child.props.children);
                items.push({value: String(child.props.value ?? label), label, disabled: groupDisabled || Boolean(child.props.disabled), group});
            }
        });
    };
    read(children);
    return items;
}

// "Parañaque" is found by typing "paranaque"
const simplify = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * A dropdown. Its list opens right under the field, on top of everything else, with a search box
 * for long lists. It works with the keyboard: arrows move, Enter chooses, Escape closes.
 * It still has a real `<select>` inside (not shown), so `name`, `required`, `onChange`, `ref` and
 * `<option>` children work as usual. `native` shows the browser's own `<select>` instead.
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
        native = false,
        searchable,
        searchPlaceholder,
        noResultsText,
        id,
        required,
        disabled,
        value,
        defaultValue,
        children,
        className,
        style,
        onChange,
        "aria-describedby": describedBy,
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledBy,
        ...rest
    },
    ref,
) {
    const t = useMessages();
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const invalid = Boolean(error);
    const errorMessage = typeof error === "boolean" ? null : error;
    const descriptionId = description ? `${selectId}-description` : undefined;
    const errorId = errorMessage ? `${selectId}-error` : undefined;
    const listId = `${selectId}-list`;
    const preset = isSizePreset(size);
    // The kit's list picks one choice; a `multiple` select stays the browser's own
    const custom = !native && !rest.multiple;

    // With a placeholder and nothing chosen yet, start on the (empty) placeholder option
    const startValue = placeholder && value === undefined && defaultValue === undefined ? "" : defaultValue;

    const settings = {"--select-size": preset ? undefined : toCssLength(size)} as CSSProperties;

    const items = useMemo(() => toItems(options, children), [options, children]);
    const [ownValue, setOwnValue] = useState(() => String(startValue ?? items.find(item => !item.disabled)?.value ?? ""));
    const current = value === undefined ? ownValue : String(value);
    const chosen = items.find(item => item.value === current);

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    // The choice the keyboard is on: its place in `shown`
    const [active, setActive] = useState(-1);
    const [position, setPosition] = useState<CSSProperties | null>(null);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const fieldRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const typed = useRef({text: "", at: 0});

    const withSearch = searchable ?? items.length > 8;
    const shown = useMemo(() => {
        const wanted = simplify(query.trim());
        return wanted ? items.filter(item => simplify(item.label).includes(wanted)) : items;
    }, [items, query]);

    // Without `value`, the <select> inside holds the choice: follow it (e.g. once the choices load, or a form reset)
    useEffect(() => {
        const select = selectRef.current;
        if (!custom || value !== undefined || !select) return;
        if (select.value !== ownValue) setOwnValue(select.value);
        const form = select.form;
        const onReset = () => window.setTimeout(() => setOwnValue(select.value));
        form?.addEventListener("reset", onReset);
        return () => form?.removeEventListener("reset", onReset);
    });

    function openList() {
        if (disabled) return;
        setQuery("");
        setActive(items.findIndex(item => item.value === current && !item.disabled));
        setOpen(true);
    }

    function close(returnFocus = true) {
        setOpen(false);
        if (returnFocus) triggerRef.current?.focus();
    }

    function choose(item: Item | undefined) {
        if (!item || item.disabled) return;
        const select = selectRef.current;
        const view = select?.ownerDocument.defaultView;
        if (select && view && item.value !== select.value) {
            // Changes the real <select> and tells React, so `onChange` gets a normal change event
            Object.getOwnPropertyDescriptor(view.HTMLSelectElement.prototype, "value")?.set?.call(select, item.value);
            select.dispatchEvent(new view.Event("change", {bubbles: true}));
        }
        close();
    }

    // The next choice that can be picked, going down (1) or up (-1) from `from`
    function step(from: number, direction: 1 | -1) {
        for (let index = from + direction; index >= 0 && index < shown.length; index += direction) {
            if (!shown[index].disabled) return index;
        }
        return from;
    }

    function onListKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
        const moves: Record<string, () => number> = {
            ArrowDown: () => step(active, 1),
            ArrowUp: () => (active < 0 ? step(shown.length, -1) : step(active, -1)),
            Home: () => step(-1, 1),
            End: () => step(shown.length, -1),
            PageDown: () => step(Math.min(active + 8, shown.length - 1) - 1, 1),
            PageUp: () => step(Math.max(active - 8, 0) + 1, -1),
        };
        const inSearch = event.target === searchRef.current;
        if (event.key === "Escape") {
            // Not the Modal or Drawer this field may be in: Escape closes only the list
            event.preventDefault();
            event.stopPropagation();
            close();
        } else if (event.key === "Tab") {
            // One Tab stop: Tab leaves the list, from the field
            event.preventDefault();
            close();
        } else if (event.key === "Enter" || (event.key === " " && !inSearch)) {
            event.preventDefault();
            choose(shown[active]);
        } else if (moves[event.key] && !(inSearch && (event.key === "Home" || event.key === "End"))) {
            event.preventDefault();
            setActive(moves[event.key]());
        } else if (!inSearch && event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            // Without a search box, typing jumps to the choice that starts with those letters
            const now = Date.now();
            typed.current = {text: (now - typed.current.at < 600 ? typed.current.text : "") + simplify(event.key), at: now};
            const found = shown.findIndex(item => !item.disabled && simplify(item.label).startsWith(typed.current.text));
            if (found >= 0) setActive(found);
        }
    }

    // Place it right under the field (above only when there's little room below), and again on scroll or resize
    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }
        const field = fieldRef.current;
        const view = field?.ownerDocument.defaultView;
        if (!field || !view) return;

        const update = () => {
            const box = field.getBoundingClientRect();
            const gap = 4;
            const padding = 8;
            // visualViewport: what's left of the screen above a phone's keyboard
            const viewHeight = view.visualViewport?.height ?? view.innerHeight;
            const roomBelow = viewHeight - box.bottom - gap - padding;
            const roomAbove = box.top - gap - padding;
            const below = roomBelow >= 220 || roomBelow >= roomAbove;
            // As wide as the field, but wide enough to read on a narrow field
            const width = Math.min(Math.max(box.width, 200), view.innerWidth - padding * 2);
            const side: CSSProperties = below ? {top: box.bottom + gap} : {bottom: view.innerHeight - box.top + gap};
            setPosition({
                ...side,
                left: Math.max(padding, Math.min(box.left, view.innerWidth - width - padding)),
                width,
                "--select-room": `${Math.max(below ? roomBelow : roomAbove, 120)}px`,
                "--select-origin": below ? "top" : "bottom",
            } as CSSProperties);
        };
        update();
        view.addEventListener("scroll", update, true);
        view.addEventListener("resize", update);
        view.visualViewport?.addEventListener("resize", update);
        return () => {
            view.removeEventListener("scroll", update, true);
            view.removeEventListener("resize", update);
            view.visualViewport?.removeEventListener("resize", update);
        };
    }, [open]);

    // Once it's placed, focus goes into it: the search box, or the list on touch screens
    // (so a phone's keyboard doesn't cover the choices until the search box is tapped)
    const placed = position !== null;
    useEffect(() => {
        if (!open || !placed) return;
        const touch = popoverRef.current?.ownerDocument.defaultView?.matchMedia?.("(pointer: coarse)").matches;
        (withSearch && !touch ? searchRef.current : listRef.current)?.focus();
    }, [open, placed, withSearch]);

    // Keeps the choice the keyboard is on in view
    useEffect(() => {
        if (!open || !placed || active < 0) return;
        listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({block: "nearest"});
    }, [open, placed, active]);

    // Closes on a click outside of it
    useEffect(() => {
        if (!open) return;
        const document = fieldRef.current?.ownerDocument;
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (popoverRef.current?.contains(target) || fieldRef.current?.contains(target)) return;
            setOpen(false);
        };
        document?.addEventListener("pointerdown", onPointerDown);
        return () => document?.removeEventListener("pointerdown", onPointerDown);
    }, [open]);

    const select = (
        <select
            ref={node => {
                selectRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
            }}
            id={custom ? undefined : selectId}
            className={custom ? styles.hiddenSelect : styles.select}
            required={required}
            disabled={disabled}
            value={value}
            defaultValue={startValue}
            aria-invalid={invalid || undefined}
            aria-describedby={custom ? undefined : cx(descriptionId, errorId, describedBy) || undefined}
            aria-label={custom ? undefined : ariaLabel}
            aria-labelledby={custom ? undefined : ariaLabelledBy}
            // With the kit's list this one isn't shown: it's there for forms and `onChange`
            aria-hidden={custom || undefined}
            tabIndex={custom ? -1 : undefined}
            onChange={event => {
                setOwnValue(event.target.value);
                onChange?.(event);
            }}
            {...rest}
            // e.g. the browser pointing at a missing required choice: focus the field people see
            onFocus={custom ? () => triggerRef.current?.focus() : rest.onFocus}>
            {/* hidden: shown in the field, but not offered in the list */}
            {placeholder && <option value="" disabled hidden>{placeholder}</option>}
            {options?.map(option => {
                const {value: optionValue, label: optionLabel, disabled: optionDisabled} =
                    typeof option === "string" ? {value: option, label: option, disabled: false} : option;
                return <option key={optionValue} value={optionValue} disabled={optionDisabled}>{optionLabel}</option>;
            })}
            {children}
        </select>
    );

    const activeId = active >= 0 && shown[active] ? `${selectId}-option-${active}` : undefined;

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
                ref={fieldRef}
                className={styles.field}
                data-invalid={invalid || undefined}
                data-disabled={disabled || undefined}
                data-left-icon={leftIcon ? true : undefined}>
                {leftIcon && <span className={cx(styles.icon, styles.leftIcon)}>{leftIcon}</span>}
                {custom && (
                    <button
                        ref={triggerRef}
                        id={selectId}
                        type="button"
                        role="combobox"
                        className={styles.trigger}
                        data-empty={chosen ? undefined : true}
                        disabled={disabled}
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-controls={open ? listId : undefined}
                        aria-invalid={invalid || undefined}
                        aria-required={required || undefined}
                        aria-label={ariaLabel}
                        aria-labelledby={ariaLabelledBy}
                        aria-describedby={cx(descriptionId, errorId, describedBy) || undefined}
                        onClick={() => (open ? close(false) : openList())}
                        onKeyDown={event => {
                            if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                                event.preventDefault();
                                openList();
                            }
                        }}>
                        <span className={styles.value}>{chosen?.label ?? placeholder ?? " "}</span>
                    </button>
                )}
                {select}
                <svg className={cx(styles.icon, styles.chevron)} viewBox="0 0 24 24" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </div>
            {errorMessage && <p id={errorId} className={styles.error}>{errorMessage}</p>}
            {custom && open && fieldRef.current && createPortal(
                <div
                    ref={popoverRef}
                    className={styles.popover}
                    data-size={preset ? size : undefined}
                    // Hidden until it's been placed, so it never flashes in the wrong spot
                    style={{...settings, ...position, visibility: position ? undefined : "hidden"}}
                    onKeyDown={onListKeyDown}>
                    {withSearch && (
                        <div className={styles.search}>
                            <svg className={styles.searchIcon} viewBox="0 0 24 24" aria-hidden="true">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.3-4.3" />
                            </svg>
                            <input
                                ref={searchRef}
                                type="text"
                                className={styles.searchInput}
                                role="combobox"
                                placeholder={searchPlaceholder ?? t.select.search}
                                aria-label={searchPlaceholder ?? t.select.search}
                                aria-expanded="true"
                                aria-controls={listId}
                                aria-autocomplete="list"
                                aria-activedescendant={activeId}
                                autoComplete="off"
                                autoCorrect="off"
                                spellCheck={false}
                                enterKeyHint="done"
                                value={query}
                                onChange={event => {
                                    const next = event.target.value;
                                    const wanted = simplify(next.trim());
                                    setQuery(next);
                                    // Starts on the first match that can be picked
                                    setActive((wanted ? items.filter(item => simplify(item.label).includes(wanted)) : items).findIndex(item => !item.disabled));
                                }}
                            />
                        </div>
                    )}
                    <div
                        ref={listRef}
                        id={listId}
                        className={styles.list}
                        role="listbox"
                        tabIndex={-1}
                        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
                        aria-activedescendant={activeId}>
                        {shown.map((item, index) => (
                            <div key={`${item.value}-${index}`} role="presentation">
                                {item.group && item.group !== shown[index - 1]?.group && <div className={styles.group}>{item.group}</div>}
                                <div
                                    id={`${selectId}-option-${index}`}
                                    className={styles.option}
                                    role="option"
                                    data-index={index}
                                    data-active={index === active || undefined}
                                    aria-selected={item.value === current}
                                    aria-disabled={item.disabled || undefined}
                                    onPointerMove={() => !item.disabled && index !== active && setActive(index)}
                                    onClick={() => choose(item)}>
                                    <span className={styles.optionLabel}>{item.label}</span>
                                    {item.value === current && (
                                        <svg className={styles.check} viewBox="0 0 24 24" aria-hidden="true">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        ))}
                        {shown.length === 0 && <div className={styles.empty} role="status">{noResultsText ?? t.select.noResults}</div>}
                    </div>
                </div>,
                // Inside the Modal or Drawer it's in, so it shows above it; else on the page's <body>
                fieldRef.current.closest("dialog") ?? fieldRef.current.ownerDocument.body,
            )}
        </div>
    );
});
