import {useEffect, useId, useRef, type CSSProperties, type HTMLAttributes, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {lockScroll} from "../../utils/scrollLock";
import styles from "./Dialog.module.css";

/** The props Modal and Drawer share. */
export interface DialogProps extends Omit<HTMLAttributes<HTMLDialogElement>, "title" | "onClose" | "onCancel"> {
    /** Whether it's showing. */
    open: boolean;
    /** Called when the user asks to close it (close button, Escape, or a click outside). Set `open` to false here. */
    onClose: () => void;
    /** The heading. Screen readers announce it when the dialog opens. */
    title?: ReactNode;
    /** A line of muted text under the title. Screen readers read it too. */
    description?: ReactNode;
    /** Buttons at the bottom, e.g. Cancel and Confirm. */
    footer?: ReactNode;
    /** Show the × button in the corner. Default true. */
    withCloseButton?: boolean;
    /** Close when clicking the dimmed area outside. Default true. */
    closeOnBackdropClick?: boolean;
    /** Close with the Escape key. Default true. */
    closeOnEscape?: boolean;
    /** What screen readers say for the × button. Default "Close". */
    closeLabel?: string;
}

interface DialogBaseProps extends DialogProps {
    kind: "modal" | "drawer";
    /** The width (or height, for top/bottom drawers) as a CSS length */
    size: string;
    position?: "left" | "right" | "top" | "bottom";
}

/**
 * Built on the browser's own <dialog> element, which already:
 * - keeps keyboard focus inside and makes the rest of the page unclickable,
 * - closes with Escape,
 * - shows on top of everything (no z-index needed),
 * - puts focus back on the button that opened it when it closes.
 * To choose what gets focus when it opens, add `data-autofocus` to that element.
 */
export function DialogBase({
    open,
    onClose,
    title,
    description,
    footer,
    withCloseButton = true,
    closeOnBackdropClick = true,
    closeOnEscape = true,
    closeLabel,
    kind,
    size,
    position,
    className,
    style,
    children,
    ...rest
}: DialogBaseProps) {
    const t = useMessages();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const pressedOnBackdrop = useRef(false);
    const titleId = useId();
    const descriptionId = useId();

    // Open and close the real <dialog> to match the `open` prop
    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            dialog.showModal();
            dialog.querySelector<HTMLElement>("[data-autofocus]")?.focus();
            return lockScroll(dialog.ownerDocument);
        }
        if (!open && dialog.open) dialog.close();
    }, [open]);

    const settings = {"--dialog-size": size} as CSSProperties;

    return (
        <dialog
            ref={dialogRef}
            className={cx(styles.dialog, styles[kind], className)}
            data-position={position}
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            style={{...settings, ...style}}
            // Escape: the browser would close it by itself; let the `open` prop decide instead
            onCancel={event => {
                event.preventDefault();
                if (closeOnEscape) onClose();
            }}
            // If the browser closed it anyway (some force-close on a second Escape), keep the state in sync
            onClose={() => {
                if (open) onClose();
            }}
            // A click on the dimmed area lands on the <dialog> itself; clicks inside land on the panel.
            // Both the press and the release must be outside, so dragging a text selection out doesn't close it.
            onMouseDown={event => {
                pressedOnBackdrop.current = event.target === event.currentTarget;
            }}
            onClick={event => {
                if (closeOnBackdropClick && pressedOnBackdrop.current && event.target === event.currentTarget) onClose();
            }}
            {...rest}>
            <div className={styles.panel}>
                {(title || description || withCloseButton) && (
                    <div className={styles.header}>
                        <div className={styles.heading}>
                            {title && <h2 id={titleId} className={styles.title}>{title}</h2>}
                            {description && <p id={descriptionId} className={styles.description}>{description}</p>}
                        </div>
                        {withCloseButton && (
                            <button type="button" className={styles.close} aria-label={closeLabel ?? t.close} onClick={onClose}>
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
                            </button>
                        )}
                    </div>
                )}
                {children && <div className={styles.body}>{children}</div>}
                {footer && <div className={styles.footer}>{footer}</div>}
            </div>
        </dialog>
    );
}
