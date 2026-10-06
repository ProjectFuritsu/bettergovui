import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {isListElement, type LayoutElement} from "../../utils/element";
import {toSpacing, type Size} from "../../utils/size";
import styles from "./Stack.module.css";

export interface StackProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div". Pick one that says what the content is, e.g. "section"
     * for a part of the page with its own heading, or "ul" for a list (each child is then an `<li>`).
     */
    as?: LayoutElement;
    /** Space between the items. A preset ("xs" 4px – "xl" 24px), a number in pixels, or any CSS length. Default "md". */
    gap?: Size;
    /** Sideways placement: "stretch" (default, full width), "start", "center" or "end". */
    align?: "stretch" | "start" | "center" | "end";
    /** Up-and-down placement when the Stack is taller than its items. Default "start". */
    justify?: "start" | "center" | "end" | "space-between";
}

/** Puts its children in a column, one under the other, with even space between them. */
export function Stack({as: Element = "div", gap = "md", align = "stretch", justify = "start", className, style, ...rest}: StackProps) {
    const settings = {"--stack-gap": toSpacing(gap)} as CSSProperties;
    return (
        <Element
            className={cx(styles.stack, className)}
            // Safari stops calling a list a "list" when its bullets are hidden; role="list" keeps it
            role={isListElement(Element) ? "list" : undefined}
            data-align={align}
            data-justify={justify}
            style={{...settings, ...style}}
            {...rest}
        />
    );
}
