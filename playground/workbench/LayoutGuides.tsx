import {useLayoutEffect, useRef, useState, type ReactNode} from "react";

// One thing drawn on the overlay, in pixels from the overlay's top-left corner
interface Shape {
    kind: "column" | "gap" | "padding" | "outline";
    x: number;
    y: number;
    w: number;
    h: number;
    label?: string;
}

const px = (value: string) => parseFloat(value) || 0;
const round = (value: number) => `${Math.round(value)}`;

/**
 * Measures a layout element and works out what to draw:
 * - grid: the column tracks and the gaps between columns and rows
 * - flex (Stack, Group): the real space between items, line by line
 * - any element: its padding, and its outline with its size
 */
function measure(target: HTMLElement, origin: DOMRect, withOutline: boolean): Shape[] {
    const box = target.getBoundingClientRect();
    const style = getComputedStyle(target);
    const left = box.left - origin.left;
    const top = box.top - origin.top;
    // Borders are measured separately, so the padding labels match the padding setting exactly
    const border = {
        left: px(style.borderLeftWidth),
        right: px(style.borderRightWidth),
        top: px(style.borderTopWidth),
        bottom: px(style.borderBottomWidth),
    };
    const padLeft = px(style.paddingLeft);
    const padRight = px(style.paddingRight);
    const padTop = px(style.paddingTop);
    const padBottom = px(style.paddingBottom);
    const content = {
        x: left + border.left + padLeft,
        y: top + border.top + padTop,
        w: box.width - border.left - border.right - padLeft - padRight,
        h: box.height - border.top - border.bottom - padTop - padBottom,
    };
    const shapes: Shape[] = withOutline
        ? [{kind: "outline", x: left, y: top, w: box.width, h: box.height, label: `${round(box.width)} × ${round(box.height)}`}]
        : [];

    if (style.display.includes("grid")) {
        // The browser reports the real track sizes in pixels, e.g. "232px 232px 232px"
        const columns = style.gridTemplateColumns.split(" ").map(px);
        const rows = style.gridTemplateRows.split(" ").map(px);
        const columnGap = px(style.columnGap);
        const rowGap = px(style.rowGap);

        let x = content.x;
        columns.forEach((width, index) => {
            shapes.push({kind: "column", x, y: content.y, w: width, h: content.h, label: `${round(width)}px`});
            x += width;
            if (index < columns.length - 1 && columnGap > 0) {
                shapes.push({kind: "gap", x, y: content.y, w: columnGap, h: content.h, label: round(columnGap)});
                x += columnGap;
            }
        });

        let y = content.y;
        rows.forEach((height, index) => {
            y += height;
            if (index < rows.length - 1 && rowGap > 0) {
                shapes.push({kind: "gap", x: content.x, y, w: content.w, h: rowGap, label: round(rowGap)});
                y += rowGap;
            }
        });
    } else if (style.display.includes("flex")) {
        const items = [...target.children]
            .map(child => child.getBoundingClientRect())
            .filter(rect => rect.width > 0 || rect.height > 0)
            .map(rect => ({x: rect.left - origin.left, y: rect.top - origin.top, w: rect.width, h: rect.height}));
        const isRow = style.flexDirection.startsWith("row");

        if (isRow) {
            // Split into lines: an item that starts left of the previous one has wrapped to a new line
            const lines: (typeof items)[] = [];
            items.forEach((item, index) => {
                if (index === 0 || item.x < items[index - 1].x) lines.push([]);
                lines[lines.length - 1].push(item);
            });
            const lineBoxes = lines.map(line => {
                const lineTop = Math.min(...line.map(item => item.y));
                const lineBottom = Math.max(...line.map(item => item.y + item.h));
                return {top: lineTop, bottom: lineBottom};
            });

            lines.forEach((line, lineIndex) => {
                const {top: lineTop, bottom: lineBottom} = lineBoxes[lineIndex];
                for (let index = 1; index < line.length; index++) {
                    const gapStart = line[index - 1].x + line[index - 1].w;
                    const width = line[index].x - gapStart;
                    if (width > 0.5) shapes.push({kind: "gap", x: gapStart, y: lineTop, w: width, h: lineBottom - lineTop, label: round(width)});
                }
                if (lineIndex > 0) {
                    const gapTop = lineBoxes[lineIndex - 1].bottom;
                    const height = lineTop - gapTop;
                    if (height > 0.5) shapes.push({kind: "gap", x: content.x, y: gapTop, w: content.w, h: height, label: round(height)});
                }
            });
        } else {
            for (let index = 1; index < items.length; index++) {
                const gapTop = items[index - 1].y + items[index - 1].h;
                const height = items[index].y - gapTop;
                if (height > 0.5) shapes.push({kind: "gap", x: content.x, y: gapTop, w: content.w, h: height, label: round(height)});
            }
        }
    }

    // Padding inside the element (e.g. a Container's space at the sides), just inside its border
    const innerTop = top + border.top;
    const innerHeight = box.height - border.top - border.bottom;
    if (padLeft > 0.5) shapes.push({kind: "padding", x: left + border.left, y: innerTop, w: padLeft, h: innerHeight, label: round(padLeft)});
    if (padRight > 0.5) shapes.push({kind: "padding", x: content.x + content.w, y: innerTop, w: padRight, h: innerHeight, label: round(padRight)});
    if (padTop > 0.5) shapes.push({kind: "padding", x: content.x, y: innerTop, w: content.w, h: padTop});
    if (padBottom > 0.5) shapes.push({kind: "padding", x: content.x, y: content.y + content.h, w: content.w, h: padBottom});

    return shapes;
}

interface LayoutGuidesProps {
    enabled: boolean;
    children: ReactNode;
    /**
     * Which elements to measure, for components whose spacing is on an inner element
     * (e.g. the tab list inside Tabs). Default: the element inside LayoutGuides.
     * Only the first one gets an outline with its size.
     */
    getTargets?: (element: HTMLElement) => (Element | null)[];
}

/**
 * Draws layout guides over the element inside it (like a design tool's layout grid):
 * columns, gaps and padding, labeled in pixels. Only for the toolkit, not part of the library.
 */
export function LayoutGuides({enabled, children, getTargets}: LayoutGuidesProps) {
    const rootRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const [shapes, setShapes] = useState<Shape[]>([]);
    const lastShapes = useRef("[]");
    // How many times the guides changed in a row without a pause (see the safety check below)
    const updatesInARow = useRef(0);

    // Runs after every render, so the guides follow every prop change.
    // Only stores new shapes when they actually changed, which keeps it from rendering forever.
    useLayoutEffect(() => {
        const root = rootRef.current;
        const target = contentRef.current?.firstElementChild as HTMLElement | null | undefined;
        if (!enabled || !root || !target) {
            lastShapes.current = "[]";
            setShapes(previous => (previous.length === 0 ? previous : []));
            return;
        }

        const targets = (getTargets ? getTargets(target) : [target]).filter(
            (element): element is HTMLElement => element instanceof (target.ownerDocument.defaultView?.HTMLElement ?? HTMLElement),
        );

        const update = () => {
            const origin = root.getBoundingClientRect();
            const next = targets.flatMap((element, index) => measure(element, origin, index === 0));
            const json = JSON.stringify(next);
            if (json === lastShapes.current) return;
            // Safety: if drawing the guides keeps changing the layout (e.g. by adding a scrollbar),
            // stop after a few tries instead of re-measuring forever
            if (updatesInARow.current >= 5) return;
            updatesInARow.current += 1;
            window.setTimeout(() => {
                updatesInARow.current = 0;
            }, 100);
            lastShapes.current = json;
            setShapes(next);
        };
        update();

        // Re-measure when the element or its items change size (e.g. a different device)
        const observer = new ResizeObserver(update);
        targets.forEach(element => {
            observer.observe(element);
            [...element.children].forEach(child => observer.observe(child));
        });
        return () => observer.disconnect();
    });

    return (
        <div ref={rootRef} className="guides-root">
            {/* display: contents, so the guides wrapper doesn't change the layout being measured */}
            <div ref={contentRef} style={{display: "contents"}}>{children}</div>
            {enabled && (
                <div className="guides" aria-hidden="true">
                    {shapes.map((shape, index) => (
                        <div
                            key={index}
                            className={`guide guide--${shape.kind}`}
                            style={{left: shape.x, top: shape.y, width: shape.w, height: shape.h}}>
                            {shape.label && <span className="guide-label">{shape.label}</span>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
