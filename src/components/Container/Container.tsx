import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import type {LayoutElement} from "../../utils/element";
import {isSizePreset, toCssLength, type Size, type SizePreset} from "../../utils/size";
import styles from "./Container.module.css";

const CONTAINER_WIDTHS: Record<SizePreset, string> = {xs: "33.75rem", sm: "45rem", md: "60rem", lg: "71.25rem", xl: "82.5rem"};

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
    /**
     * Which HTML element to use. Default "div". Often "main" for the page's main content, or
     * "header" / "footer" for the top and bottom of the page.
     */
    as?: Exclude<LayoutElement, "ul" | "ol">;
    /**
     * The maximum width: a preset (xs 540px, sm 720px, md 960px, lg 1140px, xl 1320px), a number in
     * pixels, or any CSS length. Default "lg". On smaller screens it simply fills the width.
     */
    size?: Size;
}

/** Centers the page content and keeps lines from getting too wide, with some space at the sides on phones. */
export function Container({as: Element = "div", size = "lg", className, style, ...rest}: ContainerProps) {
    const settings = {"--container-size": isSizePreset(size) ? CONTAINER_WIDTHS[size] : toCssLength(size)} as CSSProperties;
    return <Element className={cx(styles.container, className)} style={{...settings, ...style}} {...rest} />;
}
