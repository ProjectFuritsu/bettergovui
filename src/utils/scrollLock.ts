// How many open dialogs are locking each page, and what its overflow/padding were before
const locks = new WeakMap<Document, {count: number; overflow: string; paddingRight: string}>();

/**
 * Stops the page behind a dialog from scrolling. Returns a function that undoes it.
 * Several dialogs can lock at once; the page scrolls again when the last one unlocks.
 */
export function lockScroll(document: Document) {
    const root = document.documentElement;
    const existing = locks.get(document);

    if (existing) {
        existing.count += 1;
    } else {
        // Hiding the scrollbar makes the page wider; pad it so nothing jumps sideways
        const scrollbarWidth = (document.defaultView?.innerWidth ?? 0) - root.clientWidth;
        locks.set(document, {count: 1, overflow: root.style.overflow, paddingRight: root.style.paddingRight});
        root.style.overflow = "hidden";
        if (scrollbarWidth > 0) root.style.paddingRight = `${scrollbarWidth}px`;
    }

    let unlocked = false;
    return () => {
        if (unlocked) return;
        unlocked = true;
        const lock = locks.get(document);
        if (!lock) return;
        lock.count -= 1;
        if (lock.count === 0) {
            root.style.overflow = lock.overflow;
            root.style.paddingRight = lock.paddingRight;
            locks.delete(document);
        }
    };
}
