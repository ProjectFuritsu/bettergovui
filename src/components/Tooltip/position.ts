export type Placement = "top" | "bottom" | "left" | "right";

export interface Box {
    top: number;
    left: number;
    width: number;
    height: number;
}

export interface Position {
    top: number;
    left: number;
    /** The side actually used: flips to the opposite side when the preferred one doesn't fit */
    placement: Placement;
    /** Where the arrow goes along the tooltip's edge, so it points at the trigger's middle */
    arrow: number;
}

const OPPOSITE: Record<Placement, Placement> = {top: "bottom", bottom: "top", left: "right", right: "left"};

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), Math.max(min, max));
}

/**
 * Where to put a tooltip next to its trigger, inside a viewport of `viewportWidth` × `viewportHeight`.
 * - Uses the preferred side if it fits, else the opposite side, else one of the other two
 *   (e.g. "left" on a narrow phone may end up on top).
 * - Slides along that side to stay `padding` away from the viewport's edges.
 */
export function computePosition(
    trigger: Box,
    tooltip: {width: number; height: number},
    preferred: Placement,
    offset: number,
    viewportWidth: number,
    viewportHeight: number,
    padding = 8,
): Position {
    const fits = (side: Placement) => {
        switch (side) {
            case "top": return trigger.top - tooltip.height - offset >= padding;
            case "bottom": return trigger.top + trigger.height + tooltip.height + offset <= viewportHeight - padding;
            case "left": return trigger.left - tooltip.width - offset >= padding;
            case "right": return trigger.left + trigger.width + tooltip.width + offset <= viewportWidth - padding;
        }
    };
    const vertical = preferred === "top" || preferred === "bottom";
    const tryOrder: Placement[] = [preferred, OPPOSITE[preferred], ...(vertical ? ["right", "left"] : ["top", "bottom"]) as Placement[]];
    const placement = tryOrder.find(fits) ?? preferred;
    const centerX = trigger.left + trigger.width / 2;
    const centerY = trigger.top + trigger.height / 2;

    if (placement === "top" || placement === "bottom") {
        const top = placement === "top" ? trigger.top - tooltip.height - offset : trigger.top + trigger.height + offset;
        const left = clamp(centerX - tooltip.width / 2, padding, viewportWidth - tooltip.width - padding);
        return {top, left, placement, arrow: clamp(centerX - left, 10, tooltip.width - 10)};
    }

    const left = placement === "left" ? trigger.left - tooltip.width - offset : trigger.left + trigger.width + offset;
    const top = clamp(centerY - tooltip.height / 2, padding, viewportHeight - tooltip.height - padding);
    return {top, left, placement, arrow: clamp(centerY - top, 10, tooltip.height - 10)};
}
