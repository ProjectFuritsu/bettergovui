import {useId, type CSSProperties, type HTMLAttributes, type ReactNode} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Progress.module.css";

export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
    /** How far along, from 0 to `max`. Leave it out when the amount isn't known: the bar then moves back and forth. */
    value?: number;
    /** The value that means "done". Default 100. */
    max?: number;
    /** Text above the bar, e.g. "Uploading documents". It's also the bar's name for screen readers. */
    label?: ReactNode;
    /** Show the percentage next to the label. */
    showValue?: boolean;
    /** The bar's thickness: a preset (xs 4px, sm 6px, md 8px, lg 12px, xl 16px), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** "primary" (default), "success"… or any CSS color. */
    color?: Color;
}

/** A bar that fills up as something gets done, e.g. an upload or the steps of an application. */
export function Progress({
    value,
    max = 100,
    label,
    showValue = false,
    size = "md",
    color,
    "aria-label": ariaLabel,
    className,
    style,
    ...rest
}: ProgressProps) {
    const labelId = useId();
    const known = value !== undefined;
    const clamped = known ? Math.min(Math.max(value, 0), max) : 0;
    const percent = max > 0 ? Math.round((clamped / max) * 100) : 0;
    const preset = isSizePreset(size);
    const settings = {
        "--progress-height": preset ? undefined : toCssLength(size),
        "--progress-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <div className={cx(styles.root, className)} data-size={preset ? size : undefined} style={{...settings, ...style}} {...rest}>
            {(label || (showValue && known)) && (
                <div className={styles.header}>
                    <span id={labelId} className={styles.label}>{label}</span>
                    {/* Screen readers get the number from the bar itself */}
                    {showValue && known && <span className={styles.value} aria-hidden="true">{percent}%</span>}
                </div>
            )}
            <div
                className={styles.track}
                role="progressbar"
                aria-label={ariaLabel}
                aria-labelledby={label && !ariaLabel ? labelId : undefined}
                aria-valuemin={0}
                aria-valuemax={max}
                aria-valuenow={known ? clamped : undefined}
                aria-valuetext={known ? `${percent}%` : undefined}
                data-indeterminate={!known || undefined}>
                <div className={styles.bar} style={known ? {width: `${percent}%`} : undefined} />
            </div>
        </div>
    );
}
