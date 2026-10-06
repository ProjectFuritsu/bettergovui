import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {isListElement, type LayoutElement} from "../../utils/element";
import {toCssLength, toSpacing, type Size} from "../../utils/size";
import styles from "./Grid.module.css";

export interface GridProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div". For a list of cards, "ul" with `<Card as="li">` inside
     * lets screen readers say how many there are ("list, 6 items").
     */
    as?: LayoutElement;
    /** The most columns to use. Fewer are used when there isn't room (see minColumnWidth). Default 3. */
    columns?: number;
    /**
     * The narrowest a column may get before the grid uses fewer columns. A number in pixels or any CSS length.
     * Default "15rem" (240px): e.g. 3 columns on desktop, 2 on tablets, 1 on phones.
     */
    minColumnWidth?: number | string;
    /** Space between the items. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "md". */
    gap?: Size;
}

/** Puts its children in equal columns that adjust to the screen by themselves, e.g. a list of cards. */
export function Grid({
    as: Element = "div",
    columns = 3,
    minColumnWidth = "15rem",
    gap = "md",
    className,
    style,
    ...rest
}: GridProps) {
    const settings = {
        "--grid-columns": Math.max(1, Math.floor(columns)),
        "--grid-min": toCssLength(minColumnWidth),
        "--grid-gap": toSpacing(gap),
    } as CSSProperties;
    return (
        <Element
            className={cx(styles.grid, className)}
            // Safari stops calling a list a "list" when its bullets are hidden; role="list" keeps it
            role={isListElement(Element) ? "list" : undefined}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
