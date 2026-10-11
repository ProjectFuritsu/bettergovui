import {useEffect, useRef, useState, useSyncExternalStore} from "react";
import {createPortal} from "react-dom";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {Alert} from "../Alert/Alert";
import {toastStore, type ToastData} from "./store";
import styles from "./Toast.module.css";

export type ToasterPosition = "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";

export interface ToasterProps {
    /** Where the toasts appear. On phones they always use the full width. Default "bottom-right". */
    position?: ToasterPosition;
    /** What screen readers call the area. Default "Notifications". */
    label?: string;
    /** What screen readers say for each toast's × button. Default "Close". */
    closeLabel?: string;
}

/**
 * Shows the messages created with `toast()`. Put it once in your app, e.g. next to your layout.
 * Toasts pause their timer while the mouse is over them or keyboard focus is inside them.
 */
export function Toaster({position = "bottom-right", label, closeLabel}: ToasterProps) {
    const t = useMessages();
    const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
    const [paused, setPaused] = useState(false);
    // What's on screen: the store's toasts, plus the ones still animating out after they were removed
    const shown = useRef<Array<{data: ToastData; leaving: boolean}>>([]);
    const [, redraw] = useState(0);
    shown.current = [
        // Kept in their place while they leave; a toast shown again with the same id comes back
        ...shown.current.map(item => {
            const data = toasts.find(toast => toast.id === item.data.id);
            return data ? {data, leaving: false} : {data: item.data, leaving: true};
        }),
        ...toasts.filter(toast => !shown.current.some(item => item.data.id === toast.id)).map(data => ({data, leaving: false})),
    ];
    // Rendered into <body> only in the browser (there's no <body> during server rendering)
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    // Newest closest to the edge: on the bottom for bottom positions, on top for top positions
    const ordered = position.startsWith("top") ? [...shown.current].reverse() : shown.current;

    return createPortal(
        <section
            aria-label={label ?? t.notifications}
            className={styles.toaster}
            data-position={position}
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
            }}>
            {/* Always on the page, so screen readers announce toasts as they're added */}
            <ol className={styles.list} aria-live="polite">
                {ordered.map(item => (
                    <ToastItem
                        key={item.data.id}
                        toast={item.data}
                        paused={paused}
                        leaving={item.leaving}
                        closeLabel={closeLabel ?? t.close}
                        onGone={() => {
                            shown.current = shown.current.filter(other => other.data.id !== item.data.id || !other.leaving);
                            redraw(count => count + 1);
                        }}
                    />
                ))}
            </ol>
        </section>,
        document.body,
    );
}

// How long a toast takes to leave. Keep in step with toast-out in Toast.module.css.
const LEAVE_MS = 300;

interface ToastItemProps {
    toast: ToastData;
    paused: boolean;
    /** Removed from the store, and now animating out */
    leaving: boolean;
    closeLabel: string;
    /** Called once it has animated out */
    onGone: () => void;
}

function ToastItem({toast, paused, leaving, closeLabel, onGone}: ToastItemProps) {
    const {id, title, description, color = "info", duration = 5000, icon, action} = toast;
    const remaining = useRef(duration);
    const startedAt = useRef(0);

    // A new duration (e.g. the toast was updated) starts the countdown over.
    // This must come before the countdown effect below, so it runs first.
    useEffect(() => {
        remaining.current = duration;
    }, [duration]);

    // Counts down only while not paused; pausing remembers how much time was left
    useEffect(() => {
        if (duration <= 0 || paused || leaving) return;
        startedAt.current = Date.now();
        const timer = window.setTimeout(() => toastStore.remove(id), remaining.current);
        return () => {
            clearTimeout(timer);
            remaining.current -= Date.now() - startedAt.current;
        };
    }, [id, duration, paused, leaving]);

    // Taken off the page once the leaving animation is over (right away for people who asked for less motion)
    const gone = useRef(onGone);
    gone.current = onGone;
    useEffect(() => {
        if (!leaving) return;
        const still = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
        const timer = window.setTimeout(() => gone.current(), still ? 0 : LEAVE_MS);
        return () => clearTimeout(timer);
    }, [leaving]);

    const urgent = color === "danger" || color === "warning";

    return (
        // The <li> opens and closes its height, so the other toasts glide to make room instead of jumping
        <li className={styles.item} data-leaving={leaving || undefined} aria-hidden={leaving || undefined}>
            <div className={styles.clip}>
            <div className={styles.gap}>
            <Alert
                className={cx(styles.toast)}
                // Errors and warnings are announced right away; others politely through the list's live region
                role={urgent ? "alert" : undefined}
                color={color}
                variant="light"
                title={title}
                icon={icon}
                closeLabel={closeLabel}
                onClose={() => toastStore.remove(id)}>
                {(description || action) && (
                    <>
                        {description}
                        {action && (
                            <button
                                type="button"
                                className={styles.action}
                                onClick={() => {
                                    action.onClick();
                                    toastStore.remove(id);
                                }}>
                                {action.label}
                            </button>
                        )}
                    </>
                )}
            </Alert>
            </div>
            </div>
        </li>
    );
}
