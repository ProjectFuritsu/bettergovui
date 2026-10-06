import {useState, type CSSProperties, type HTMLAttributes} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Avatar.module.css";

export type AvatarVariant = "light" | "filled";

export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, "color"> {
    /** The photo. If it's missing or fails to load, the initials are shown instead. */
    src?: string;
    /** The person's name: used for the initials, the automatic color, and what screen readers say. */
    name?: string;
    /** Screen reader text for the photo. Default: the name. */
    alt?: string;
    /** A preset (xs 24px, sm 32px, md 40px, lg 56px, xl 80px), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Corner rounding. A number in pixels or any CSS length. Default: a full circle. */
    radius?: number | string;
    /** Background for the initials: "primary", "success"… or any CSS color. Default: picked from the name, so each person keeps their color. */
    color?: Color;
    /** `"light"` (default): soft background, colored initials. `"filled"`: solid background. */
    variant?: AvatarVariant;
}

// Colors for automatic avatars; the same name always gets the same one
const AUTO_COLORS = ["#1c7ed6", "#2f9e44", "#e8590c", "#7048e8", "#d6336c", "#0c8599", "#f08c00", "#5c940d"];

function colorForName(name: string) {
    let hash = 0;
    for (const character of name) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return AUTO_COLORS[hash % AUTO_COLORS.length];
}

// "Juan Dela Cruz" -> "JC": first letters of the first and last word
export function getInitials(name: string) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "";
    const first = words[0][0];
    const last = words.length > 1 ? words[words.length - 1][0] : "";
    return (first + last).toUpperCase();
}

/** A person's photo, or their initials when there's no photo. */
export function Avatar({
    src,
    name,
    alt,
    size = "md",
    radius,
    color,
    variant = "light",
    className,
    style,
    ...rest
}: AvatarProps) {
    // Remember which photo failed, so a new src gets a fresh try
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const showImage = Boolean(src) && failedSrc !== src;
    const initials = name ? getInitials(name) : "";
    const preset = isSizePreset(size);

    const settings = {
        "--avatar-size": preset ? undefined : toCssLength(size),
        "--avatar-radius": radius === undefined ? undefined : toCssLength(radius),
        "--avatar-color": color !== undefined ? resolveColor(color) : name ? colorForName(name) : undefined,
    } as CSSProperties;

    return (
        <span
            // Without a photo the avatar is drawn with text, so it needs a name for screen readers
            role={showImage ? undefined : "img"}
            aria-label={showImage ? undefined : alt ?? name}
            className={cx(styles.avatar, className)}
            data-size={preset ? size : undefined}
            data-variant={variant}
            style={{...settings, ...style}}
            {...rest}>
            {showImage ? (
                <img className={styles.image} src={src} alt={alt ?? name ?? ""} onError={() => setFailedSrc(src ?? null)} />
            ) : initials ? (
                <span aria-hidden="true">{initials}</span>
            ) : (
                <svg className={styles.placeholder} viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
            )}
        </span>
    );
}
