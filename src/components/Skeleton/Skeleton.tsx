import type {CSSProperties, HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {toCssLength} from "../../utils/size";
import styles from "./Skeleton.module.css";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
    /** A number in pixels or any CSS length. Default "100%". */
    width?: number | string;
    /** A number in pixels or any CSS length. Default "1rem", about one line of text. */
    height?: number | string;
    /** Corner rounding. A number in pixels or any CSS length. Default: half the --radius token. */
    radius?: number | string;
    /** A circle `height` wide, e.g. for an Avatar. */
    circle?: boolean;
    /** Show this many lines, like a paragraph (the last one is shorter). */
    lines?: number;
    /** The shimmer that sweeps across. Default true. */
    animate?: boolean;
}

/**
 * A grey placeholder in the shape of content that's still loading. It's hidden from screen readers:
 * mark the loading area with `aria-busy="true"` and say "Loading…" there instead.
 */
export function Skeleton({width, height, radius, circle = false, lines, animate = true, className, style, ...rest}: SkeletonProps) {
    const settings = {
        "--skeleton-width": width === undefined ? undefined : toCssLength(width),
        "--skeleton-height": height === undefined ? undefined : toCssLength(height),
        "--skeleton-radius": radius === undefined ? undefined : toCssLength(radius),
    } as CSSProperties;
    const shape = {"data-circle": circle || undefined, "data-animate": animate || undefined};

    if (lines !== undefined && lines > 1) {
        return (
            <div className={cx(styles.lines, className)} style={{...settings, ...style}} aria-hidden="true" {...rest}>
                {Array.from({length: lines}, (_, index) => <div key={index} className={styles.skeleton} {...shape} />)}
            </div>
        );
    }

    return <div className={cx(styles.skeleton, className)} style={{...settings, ...style}} aria-hidden="true" {...shape} {...rest} />;
}
