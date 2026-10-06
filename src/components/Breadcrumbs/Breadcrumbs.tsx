import {
    Children,
    cloneElement,
    isValidElement,
    type CSSProperties,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Breadcrumbs.module.css";

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    /**
     * The trail, from the top level to the current page. Use your own links, e.g.
     * `<a href="/">Home</a>` or a router `<Link>`. The last one is marked as the current page.
     */
    children: ReactNode;
    /** What goes between the items. Default: a small arrow (›). */
    separator?: ReactNode;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md" (14px text). */
    size?: Size;
    /** Color of the links: "primary" (default), "success"… or any CSS color. A deeper shade is used so they stay readable. */
    color?: Color;
}

/** Shows where the current page sits, e.g. Home › Services › Business permits. */
export function Breadcrumbs({
    children,
    separator,
    size = "md",
    color,
    className,
    style,
    "aria-label": ariaLabel = "Breadcrumb",
    ...rest
}: BreadcrumbsProps) {
    const items = Children.toArray(children);
    const preset = isSizePreset(size);
    const settings = {
        "--breadcrumbs-size": preset ? undefined : toCssLength(size),
        "--breadcrumbs-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <nav
            aria-label={ariaLabel}
            className={cx(styles.breadcrumbs, className)}
            data-size={preset ? size : undefined}
            style={{...settings, ...style}}
            {...rest}>
            <ol className={styles.list}>
                {items.map((item, index) => {
                    const isCurrent = index === items.length - 1;
                    return [
                        index > 0 && (
                            <li key={`separator-${index}`} className={styles.separator} aria-hidden="true">
                                {separator ?? <ChevronIcon />}
                            </li>
                        ),
                        <li key={`item-${index}`} className={styles.item}>
                            {isCurrent ? markCurrent(item) : item}
                        </li>,
                    ];
                })}
            </ol>
        </nav>
    );
}

// Tells screen readers that the last item is the page you're on
function markCurrent(item: ReactNode) {
    if (isValidElement(item)) {
        return cloneElement(item as ReactElement<{"aria-current"?: string}>, {"aria-current": "page"});
    }
    return <span aria-current="page">{item}</span>;
}

function ChevronIcon() {
    return (
        <svg className={styles.chevron} viewBox="0 0 24 24">
            <path d="m9 18 6-6-6-6" />
        </svg>
    );
}
