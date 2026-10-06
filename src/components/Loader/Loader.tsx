import type {CSSProperties, HTMLAttributes} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Loader.module.css";

export type LoaderType = "spinner" | "dots" | "bars";

export interface LoaderProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
    /**
     * The animation:
     * - `"spinner"`: a spinning ring (default)
     * - `"dots"`: three pulsing dots
     * - `"bars"`: three stretching bars
     */
    type?: LoaderType;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md" (36px). */
    size?: Size;
    /** "primary", "success"… or any CSS color. Default: the surrounding text color. */
    color?: Color;
}

export function Loader({type = "spinner", size = "md", color, className, style, ...rest}: LoaderProps) {
    const preset = isSizePreset(size);

    // Settings become CSS variables that Loader.module.css reads. Undefined ones are left out.
    const settings = {
        "--loader-size": preset ? undefined : toCssLength(size),
        "--loader-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <span
            role="status"
            aria-label="Loading"
            className={cx(styles.loader, className)}
            data-type={type}
            data-size={preset ? size : undefined}
            style={{...settings, ...style}}
            {...rest}>
            {/* The spinner is the ring itself; dots and bars need three pieces */}
            {type !== "spinner" && <><span /><span /><span /></>}
        </span>
    );
}
