import {
    cloneElement,
    isValidElement,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type ReactElement,
    type ReactNode,
} from "react";
import {createPortal} from "react-dom";
import {resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {computePosition, type Placement, type Position} from "./position";
import styles from "./Tooltip.module.css";

export type TooltipPlacement = Placement;

export interface TooltipProps {
    /** The text to show. Keep it short; it can't contain links or buttons. */
    label: ReactNode;
    /** The element the tooltip belongs to, usually a button. Must be a single element. */
    children: ReactElement;
    /** Which side it appears on. It moves to the opposite side when there isn't room. Default "top". */
    placement?: TooltipPlacement;
    /** Milliseconds to wait on mouse hover before showing. Keyboard focus shows it right away. Default 200. */
    openDelay?: number;
    /** Milliseconds before hiding after the mouse leaves, so it can move onto the tooltip. Default 100. */
    closeDelay?: number;
    /** Show the small arrow pointing at the element. Default true. */
    withArrow?: boolean;
    /** Space between the element and the tooltip, in pixels. Default 8. */
    offset?: number;
    /** Maximum width before the text wraps. A number in pixels or any CSS length. Default 240. */
    maxWidth?: number | string;
    /**
     * Background color: "primary", "danger"… or any CSS color. The text turns black or white,
     * whichever is easier to read on it. Default: dark in light mode, light in dark mode.
     */
    color?: Color;
    /** Don't show the tooltip. */
    disabled?: boolean;
}

/**
 * A short hint shown when you hover over or focus an element. It also works with the keyboard:
 * it shows on focus and Escape hides it. Screen readers read the text as the element's description.
 */
export function Tooltip({
    label,
    children,
    placement = "top",
    openDelay = 200,
    closeDelay = 100,
    withArrow = true,
    offset = 8,
    maxWidth = 240,
    color,
    disabled = false,
}: TooltipProps) {
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<Position | null>(null);
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timer = useRef<number | undefined>(undefined);
    const descriptionId = useId();

    // The wrapper takes no space (display: contents), so measure the element inside it
    const getTrigger = () => wrapperRef.current?.firstElementChild as HTMLElement | null | undefined;

    // Opens or closes after `delay` ms; with no delay it happens right away (e.g. on keyboard focus)
    function setOpenAfter(next: boolean, delay: number) {
        clearTimeout(timer.current);
        if (delay > 0) {
            timer.current = window.setTimeout(() => setOpen(next), delay);
        } else {
            setOpen(next);
        }
    }

    const show = (delay: number) => setOpenAfter(true, delay);
    const hide = (delay: number) => setOpenAfter(false, delay);

    useEffect(() => () => clearTimeout(timer.current), []);

    // Place it once it's on the page (before the browser paints), and again on scroll or resize
    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }
        const trigger = getTrigger();
        const view = trigger?.ownerDocument.defaultView;
        if (!trigger || !view) return;

        const update = () => {
            const tooltip = tooltipRef.current;
            if (!tooltip) return;
            const box = trigger.getBoundingClientRect();
            setPosition(computePosition(box, tooltip.getBoundingClientRect(), placement, offset, view.innerWidth, view.innerHeight));
        };
        update();
        view.addEventListener("scroll", update, true);
        view.addEventListener("resize", update);
        return () => {
            view.removeEventListener("scroll", update, true);
            view.removeEventListener("resize", update);
        };
    }, [open, placement, offset, label]);

    // Escape hides it, without moving focus
    useEffect(() => {
        if (!open) return;
        const document = wrapperRef.current?.ownerDocument;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        document?.addEventListener("keydown", onKeyDown);
        return () => document?.removeEventListener("keydown", onKeyDown);
    }, [open]);

    // Screen readers read the label as the element's description (from the hidden copy below)
    const trigger = isValidElement<{"aria-describedby"?: string}>(children)
        ? cloneElement(children, {"aria-describedby": cx(children.props["aria-describedby"], disabled ? undefined : descriptionId)})
        : children;

    const tooltipStyle = {
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        maxWidth,
        // Hidden until it's been measured and placed, so it never flashes in the wrong spot
        visibility: position ? undefined : "hidden",
        "--tooltip-arrow": position ? `${position.arrow}px` : undefined,
        "--tooltip-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    return (
        <span
            ref={wrapperRef}
            className={styles.wrapper}
            onMouseEnter={() => show(openDelay)}
            onMouseLeave={() => hide(closeDelay)}
            onFocus={() => show(0)}
            onBlur={() => hide(0)}>
            {trigger}
            {!disabled && <span id={descriptionId} hidden>{label}</span>}
            {open && !disabled && wrapperRef.current && createPortal(
                // Shown on the page's <body>, so containers with overflow: hidden can't cut it off.
                // aria-hidden: screen readers already get the text from the hidden copy above.
                <div
                    ref={tooltipRef}
                    className={styles.tooltip}
                    data-placement={position?.placement ?? placement}
                    data-colored={color !== undefined || undefined}
                    aria-hidden="true"
                    style={tooltipStyle}
                    // Keeps it open while the mouse is on the tooltip itself
                    onMouseEnter={() => show(0)}
                    onMouseLeave={() => hide(closeDelay)}>
                    {label}
                    {withArrow && <span className={styles.arrow} />}
                </div>,
                wrapperRef.current.ownerDocument.body,
            )}
        </span>
    );
}
