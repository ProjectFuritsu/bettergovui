import type {AnchorHTMLAttributes, CSSProperties} from "react";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import styles from "./Link.module.css";

export interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "color"> {
    /**
     * When to underline it:
     * - `"always"` (default): links in text must stand out by more than color, for people who can't tell colors apart
     * - `"hover"`: only on hover and focus, for links that are clearly links anyway (e.g. a menu)
     * - `"never"`
     */
    underline?: "always" | "hover" | "never";
    /** Opens in a new tab, with a small arrow icon. Screen readers are told it opens a new tab. */
    external?: boolean;
    /** "primary" (default), "danger"… or any CSS color. A deeper shade is used so it stays readable. */
    color?: Color;
    /** What screen readers add for external links. Default "(opens in a new tab)". */
    newTabLabel?: string;
}

/** A link (`<a>`). Its size and font follow the surrounding text. */
export function Link({
    underline = "always",
    external = false,
    color,
    newTabLabel,
    className,
    style,
    children,
    ...rest
}: LinkProps) {
    const t = useMessages();
    const settings = {"--link-color": color === undefined ? undefined : resolveColor(color)} as CSSProperties;

    return (
        <a
            className={cx(styles.link, className)}
            data-underline={underline}
            style={{...settings, ...style}}
            {...(external ? {target: "_blank", rel: "noopener noreferrer"} : {})}
            {...rest}>
            {children}
            {external && (
                <>
                    <svg className={styles.externalIcon} viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M7 17 17 7M8 7h9v9" />
                    </svg>
                    <span className={styles.srOnly}> {newTabLabel ?? t.opensInNewTab}</span>
                </>
            )}
        </a>
    );
}
