import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {isListElement, type LayoutElement} from "../../utils/element";
import {toSpacing, type Size} from "../../utils/size";
import styles from "./Group.module.css";

export interface GroupProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div". E.g. "nav" for a row of navigation links, or "ul" for
     * a list (each child is then an `<li>`).
     */
    as?: LayoutElement;
    /** Space between the items. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "md". */
    gap?: Size;
    /** Up-and-down placement: "center" (default), "start", "end", "stretch" or "baseline" (lines text up). */
    align?: "center" | "start" | "end" | "stretch" | "baseline";
    /** Sideways placement: "start" (default), "center", "end" or "space-between" (first item left, last item right). */
    justify?: "start" | "center" | "end" | "space-between";
    /** Move items to the next line when they don't fit. Default true. */
    wrap?: boolean;
    /** Make every item share the width equally. */
    grow?: boolean;
}

/** Puts its children in a row, side by side, e.g. buttons. Wraps onto the next line on small screens. */
export function Group({
    as: Element = "div",
    gap = "md",
    align = "center",
    justify = "start",
    wrap = true,
    grow = false,
    className,
    style,
    ...rest
}: GroupProps) {
    const settings = {"--group-gap": toSpacing(gap)} as CSSProperties;
    return (
        <Element
            className={cx(styles.group, className)}
            // Safari stops calling a list a "list" when its bullets are hidden; role="list" keeps it
            role={isListElement(Element) ? "list" : undefined}
            data-align={align}
            data-justify={justify}
            data-nowrap={wrap ? undefined : true}
            data-grow={grow || undefined}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
