import {createContext, useContext, type CSSProperties, type HTMLAttributes, type LiHTMLAttributes, type ReactNode} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./List.module.css";

// The list's icon, shared with its items
const ListIconContext = createContext<ReactNode>(null);

export interface ListProps extends Omit<HTMLAttributes<HTMLElement>, "color"> {
    /** "unordered" (bullets, default) or "ordered" (1, 2, 3). */
    type?: "unordered" | "ordered";
    /** An icon instead of bullets for every item, e.g. `<Check />`. A ListItem can use its own icon. */
    icon?: ReactNode;
    /** Space between items. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "xs". */
    spacing?: Size;
    /** Text size: a preset (xs 12px – xl 20px), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Color of the bullets, numbers or icons: "primary", "success"… or any CSS color. The text keeps the normal color. */
    color?: Color;
}

/** A bulleted or numbered list, or one with an icon per item. Put ListItems inside it. */
export function List({type = "unordered", icon, spacing = "xs", size = "md", color, className, style, children, ...rest}: ListProps) {
    const Element = type === "ordered" ? "ol" : "ul";
    const preset = isSizePreset(size);
    const settings = {
        "--list-spacing": toSpacing(spacing),
        "--list-size": preset ? undefined : toCssLength(size),
        "--list-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <ListIconContext.Provider value={icon}>
            <Element
                // Safari stops calling a list a "list" when its bullets are hidden; role="list" keeps it
                role={icon ? "list" : undefined}
                className={cx(styles.list, className)}
                data-size={preset ? size : undefined}
                data-with-icons={icon ? true : undefined}
                style={{...settings, ...style}}
                {...rest}>
                {children}
            </Element>
        </ListIconContext.Provider>
    );
}

export interface ListItemProps extends LiHTMLAttributes<HTMLLIElement> {
    /** An icon for just this item, instead of the list's icon. */
    icon?: ReactNode;
}

/** One item in a List. */
export function ListItem({icon, className, children, ...rest}: ListItemProps) {
    const listIcon = useContext(ListIconContext);
    const shownIcon = icon ?? listIcon;

    return (
        <li className={cx(styles.item, className)} data-with-icon={shownIcon ? true : undefined} {...rest}>
            {shownIcon && <span className={styles.icon} aria-hidden="true">{shownIcon}</span>}
            {shownIcon ? <span className={styles.content}>{children}</span> : children}
        </li>
    );
}
