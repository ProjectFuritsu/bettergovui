export type PaginationItem = number | "dots";

function range(start: number, end: number) {
    return Array.from({length: Math.max(0, end - start + 1)}, (_, index) => start + index);
}

/**
 * Which page numbers to show, with "dots" (…) for the gaps.
 * Always returns the same number of items (once there are enough pages), so the buttons
 * don't jump around while you click through.
 *
 * Example: total 10, page 5, 1 sibling, 1 boundary → 1 … 4 5 6 … 10
 *
 * @param siblings   pages shown on each side of the current page
 * @param boundaries pages always shown at the start and the end
 */
export function paginationRange(total: number, page: number, siblings = 1, boundaries = 1): PaginationItem[] {
    siblings = Math.max(0, siblings);
    boundaries = Math.max(1, boundaries);
    page = Math.min(Math.max(page, 1), total);

    // first/last boundaries + siblings on both sides + the current page + 2 dots
    const slots = boundaries * 2 + siblings * 2 + 3;
    if (total <= slots) return range(1, total);

    const leftSibling = Math.max(page - siblings, boundaries + 1);
    const rightSibling = Math.min(page + siblings, total - boundaries);
    // Only show dots when they hide at least 2 pages; for 1 page just show the page itself
    const showLeftDots = leftSibling > boundaries + 2;
    const showRightDots = rightSibling < total - boundaries - 1;

    if (!showLeftDots) {
        // Near the start: 1 2 3 4 5 … 10
        const leftCount = slots - boundaries - 1;
        return [...range(1, leftCount), "dots", ...range(total - boundaries + 1, total)];
    }

    if (!showRightDots) {
        // Near the end: 1 … 6 7 8 9 10
        const rightCount = slots - boundaries - 1;
        return [...range(1, boundaries), "dots", ...range(total - rightCount + 1, total)];
    }

    // In the middle: 1 … 4 5 6 … 10
    return [
        ...range(1, boundaries),
        "dots",
        ...range(leftSibling, rightSibling),
        "dots",
        ...range(total - boundaries + 1, total),
    ];
}
