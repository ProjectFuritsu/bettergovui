import {useLayoutEffect, useRef, type RefObject} from "react";

/**
 * For fields that reformat as you type ("9171234567" -> "917 123 4567"): keeps the cursor after the
 * same digit, instead of letting it jump to the end when spaces or commas are added.
 *
 * Call the returned function in onChange with the typed text, where the cursor was, and the new text.
 * `isKept` says which characters survive formatting (e.g. digits); separators don't count.
 */
export function useKeepCaret(inputRef: RefObject<HTMLInputElement | null>, isKept: (char: string) => boolean) {
    const pending = useRef<number | null>(null);

    // After React shows the new text, put the cursor back
    useLayoutEffect(() => {
        const input = inputRef.current;
        if (pending.current === null || !input) return;
        if (input.ownerDocument.activeElement === input) input.setSelectionRange(pending.current, pending.current);
        pending.current = null;
    });

    return (typed: string, caret: number, formatted: string) => {
        const keptBefore = [...typed.slice(0, caret)].filter(isKept).length;
        let seen = 0;
        let position = 0;
        while (position < formatted.length && seen < keptBefore) {
            if (isKept(formatted[position])) seen += 1;
            position += 1;
        }
        pending.current = position;
    };
}
