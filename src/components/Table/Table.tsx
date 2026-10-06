import {useMemo, useState, type CSSProperties, type Key, type ReactNode, type TableHTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {toCssLength} from "../../utils/size";
import styles from "./Table.module.css";

type SortValue = string | number | Date | null | undefined;

export interface TableColumn<Row> {
    /** Which field of the row to show (unless `render` is given), and the column's id for sorting. */
    key: string;
    /** The column heading. */
    header: ReactNode;
    /** What to show in each cell, e.g. `row => <Badge>{row.status}</Badge>`. Default: the row's `key` field. */
    render?: (row: Row, index: number) => ReactNode;
    /** Let people sort by this column by clicking its heading. */
    sortable?: boolean;
    /** What to sort by, when it isn't the `key` field itself (e.g. a date for a column that shows text). */
    sortValue?: (row: Row) => SortValue;
    /** "left" (default), "center" or "right" (for amounts, so the digits line up). */
    align?: "left" | "center" | "right";
    /** A number in pixels or any CSS length. */
    width?: number | string;
    /** The column's name in the stacked phone layout, when `header` isn't plain text. */
    label?: string;
}

export interface TableSort {
    key: string;
    direction: "ascending" | "descending";
}

export interface TableProps<Row> extends Omit<TableHTMLAttributes<HTMLTableElement>, "children"> {
    /** The columns, in order. */
    columns: TableColumn<Row>[];
    /** The rows: one object per row. */
    data: Row[];
    /** A field (or function) that's unique for each row, like an id. Default: the row's position. */
    rowKey?: keyof Row | ((row: Row, index: number) => Key);
    /** The table's title, shown above it. It's also the table's name for screen readers, so use one. */
    caption?: ReactNode;
    /** A light background on every other row, to help eyes follow wide rows. */
    striped?: boolean;
    /** Highlight the row under the mouse. Default true. */
    highlightOnHover?: boolean;
    /** On narrow screens, show each row as a small card with the column names inside. Default true. */
    stackOnMobile?: boolean;
    /** Shown when there are no rows. Default "Nothing to show yet." */
    emptyText?: ReactNode;
    /** The sorting at first, e.g. `{ key: "date", direction: "descending" }`. */
    defaultSort?: TableSort;
}

const isEmpty = (value: SortValue) => value === null || value === undefined || value === "";

// Numbers and dates by size, text alphabetically ("item 2" before "item 10"). Empty values go last either way.
function compare(a: SortValue, b: SortValue, direction: TableSort["direction"]) {
    if (isEmpty(a) || isEmpty(b)) return Number(isEmpty(a)) - Number(isEmpty(b));
    const order =
        a instanceof Date || b instanceof Date || (typeof a === "number" && typeof b === "number")
            ? Number(a) - Number(b)
            : String(a).localeCompare(String(b), undefined, {numeric: true, sensitivity: "base"});
    return direction === "descending" ? -order : order;
}

/**
 * A table of rows and columns, e.g. applications, fees or payments. Columns can be sortable; on
 * narrow screens each row turns into a small card. `className` and `style` go on the outer wrapper.
 */
export function Table<Row extends object>({
    columns,
    data,
    rowKey,
    caption,
    striped = false,
    highlightOnHover = true,
    stackOnMobile = true,
    emptyText,
    defaultSort,
    className,
    style,
    ...rest
}: TableProps<Row>) {
    const t = useMessages();
    const [sort, setSort] = useState<TableSort | undefined>(defaultSort);
    const field = (row: Row, key: string) => (row as Record<string, unknown>)[key];

    const rows = useMemo(() => {
        const column = sort && columns.find(item => item.key === sort.key);
        if (!sort || !column) return data;
        const valueOf = column.sortValue ?? ((row: Row) => field(row, column.key) as SortValue);
        return [...data].sort((a, b) => compare(valueOf(a), valueOf(b), sort.direction));
    }, [data, columns, sort]);

    function toggleSort(key: string) {
        setSort(current =>
            current?.key === key && current.direction === "ascending" ? {key, direction: "descending"} : {key, direction: "ascending"},
        );
    }

    function keyOf(row: Row, index: number): Key {
        if (typeof rowKey === "function") return rowKey(row, index);
        if (rowKey !== undefined) return String(row[rowKey]);
        return index;
    }

    // Tables shown as cards lose their table meaning in some browsers; these roles keep it
    const role = (name: string) => (stackOnMobile ? name : undefined);

    return (
        <div className={cx(styles.wrapper, className)} style={style}>
            <div className={styles.scroller}>
                <table
                    className={styles.table}
                    role={role("table")}
                    data-stack={stackOnMobile || undefined}
                    data-striped={striped || undefined}
                    data-hover={highlightOnHover || undefined}
                    {...rest}>
                    {caption && <caption className={styles.caption}>{caption}</caption>}
                    <thead role={role("rowgroup")}>
                        <tr role={role("row")}>
                            {columns.map(column => {
                                const sorted = sort?.key === column.key ? sort.direction : undefined;
                                return (
                                    <th
                                        key={column.key}
                                        scope="col"
                                        role={role("columnheader")}
                                        aria-sort={column.sortable ? (sorted ?? "none") : undefined}
                                        data-align={column.align}
                                        style={column.width === undefined ? undefined : ({width: toCssLength(column.width)} as CSSProperties)}>
                                        {column.sortable ? (
                                            <button type="button" className={styles.sortButton} onClick={() => toggleSort(column.key)}>
                                                {column.header}
                                                <svg className={styles.sortIcon} data-sorted={sorted} viewBox="0 0 24 24" aria-hidden="true">
                                                    <path className={styles.up} d="m8 10 4-4 4 4" />
                                                    <path className={styles.down} d="m8 14 4 4 4-4" />
                                                </svg>
                                            </button>
                                        ) : (
                                            column.header
                                        )}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody role={role("rowgroup")}>
                        {rows.length === 0 ? (
                            <tr role={role("row")} className={styles.empty}>
                                <td role={role("cell")} colSpan={columns.length}>{emptyText ?? t.tableEmpty}</td>
                            </tr>
                        ) : (
                            rows.map((row, index) => (
                                <tr key={keyOf(row, index)} role={role("row")}>
                                    {columns.map(column => (
                                        <td
                                            key={column.key}
                                            role={role("cell")}
                                            data-align={column.align}
                                            data-label={typeof column.header === "string" ? column.header : column.label}>
                                            {column.render ? column.render(row, index) : (field(row, column.key) as ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
