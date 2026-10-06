import {useState, type CSSProperties, type HTMLAttributes, type ReactNode} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import {paginationRange} from "./paginationRange";
import styles from "./Pagination.module.css";

/** What screen readers say for each button. Change these to translate them. */
export interface PaginationLabels {
    previous: string;
    next: string;
    first: string;
    last: string;
    page: (page: number) => string;
}

const DEFAULT_LABELS: PaginationLabels = {
    previous: "Previous page",
    next: "Next page",
    first: "First page",
    last: "Last page",
    page: page => `Page ${page}`,
};

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
    /** How many pages there are. */
    total: number;
    /** The current page (starting at 1). Pass this with onPageChange to control it yourself. */
    page?: number;
    /** The page shown at first, when you don't pass `page`. Default 1. */
    defaultPage?: number;
    /** Called with the new page number when the user picks a page. */
    onPageChange?: (page: number) => void;
    /** Pages shown on each side of the current page. Default 1. */
    siblings?: number;
    /** Pages always shown at the start and the end. Default 1. */
    boundaries?: number;
    /** Also show "first page" and "last page" buttons. */
    withEdges?: boolean;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color of the current page: "primary", "success"… or any CSS color. Default "primary". */
    color?: Color;
    /** Black or white text on the current page, whichever is easier to read on the color. */
    autoContrast?: boolean;
    /** Turn off every button. */
    disabled?: boolean;
    /** Screen reader text for the buttons, e.g. to translate them. */
    labels?: Partial<PaginationLabels>;
}

/** Page numbers with previous/next buttons, for moving through long lists. */
export function Pagination({
    total,
    page,
    defaultPage = 1,
    onPageChange,
    siblings = 1,
    boundaries = 1,
    withEdges = false,
    size = "md",
    color,
    autoContrast = false,
    disabled = false,
    labels,
    className,
    style,
    "aria-label": ariaLabel = "Pagination",
    ...rest
}: PaginationProps) {
    const [internalPage, setInternalPage] = useState(defaultPage);
    const pageCount = Math.max(1, Math.floor(total));
    const current = Math.min(Math.max(page ?? internalPage, 1), pageCount);
    const text = {...DEFAULT_LABELS, ...labels};
    const preset = isSizePreset(size);

    function goTo(next: number) {
        const clamped = Math.min(Math.max(next, 1), pageCount);
        if (clamped === current) return;
        if (page === undefined) setInternalPage(clamped);
        onPageChange?.(clamped);
    }

    const settings = {
        "--pagination-size": preset ? undefined : toCssLength(size),
        "--pagination-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    // One button in the list
    const control = (key: string, label: string, target: number, content: ReactNode, isDisabled: boolean, isCurrent = false) => (
        <li key={key}>
            <button
                type="button"
                className={styles.control}
                aria-label={label}
                aria-current={isCurrent ? "page" : undefined}
                disabled={disabled || isDisabled}
                onClick={() => goTo(target)}>
                {content}
            </button>
        </li>
    );

    return (
        <nav
            aria-label={ariaLabel}
            className={cx(styles.pagination, className)}
            data-size={preset ? size : undefined}
            data-auto-contrast={autoContrast || isLightThemeColor(color) || undefined}
            style={{...settings, ...style}}
            {...rest}>
            <ul className={styles.list}>
                {withEdges && control("first", text.first, 1, <Icon path="m11 17-5-5 5-5M18 17l-5-5 5-5" />, current === 1)}
                {control("previous", text.previous, current - 1, <Icon path="m15 18-6-6 6-6" />, current === 1)}
                {paginationRange(pageCount, current, siblings, boundaries).map((item, index) =>
                    item === "dots"
                        ? <li key={`dots-${index}`} className={styles.dots} aria-hidden="true">…</li>
                        : control(`page-${item}`, text.page(item), item, item, false, item === current),
                )}
                {control("next", text.next, current + 1, <Icon path="m9 18 6-6-6-6" />, current === pageCount)}
                {withEdges && control("last", text.last, pageCount, <Icon path="m6 17 5-5-5-5M13 17l5-5-5-5" />, current === pageCount)}
            </ul>
        </nav>
    );
}

function Icon({path}: {path: string}) {
    return (
        <svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
            <path d={path} />
        </svg>
    );
}
