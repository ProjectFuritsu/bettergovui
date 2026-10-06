import {Check, ChevronDown, ChevronUp, Copy} from "lucide-react";
import {useEffect, useRef, useState, type KeyboardEvent, type PointerEvent} from "react";
import {cx} from "../../src/utils/cx";
import {writeToClipboard} from "./clipboard";

const HIDDEN_KEY = "playground-code-hidden";
const HEIGHT_KEY = "playground-code-height";
const MIN_HEIGHT = 80;
const MIN_PREVIEW_HEIGHT = 240;
const DEFAULT_HEIGHT = 220;
const KEYBOARD_STEP = 24;

// Saved choices are a convenience: if storage is blocked (e.g. a private window), use the defaults
function load(key: string) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function save(key: string, value: string) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Not saved, but the panel still works for this visit
    }
}

/**
 * The generated code under the preview. It can be hidden (so the preview gets all the room)
 * and resized by dragging its top edge, or with ↑/↓ when that edge has keyboard focus.
 */
export function CodePanel({code}: {code: string}) {
    const [hidden, setHidden] = useState(() => load(HIDDEN_KEY) === "true");
    const [height, setHeight] = useState(() => Number(load(HEIGHT_KEY)) || DEFAULT_HEIGHT);
    const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
    const panelRef = useRef<HTMLElement>(null);
    const drag = useRef<{startY: number; startHeight: number} | null>(null);
    const copyTimer = useRef<number | undefined>(undefined);

    useEffect(() => () => clearTimeout(copyTimer.current), []);

    async function copy() {
        try {
            await writeToClipboard(code);
            setCopyState("copied");
        } catch {
            setCopyState("failed");
        }
        clearTimeout(copyTimer.current);
        copyTimer.current = window.setTimeout(() => setCopyState("idle"), 1500);
    }

    useEffect(() => save(HIDDEN_KEY, String(hidden)), [hidden]);
    useEffect(() => save(HEIGHT_KEY, String(Math.round(height))), [height]);

    // Always leave the preview (right above the panel) at least MIN_PREVIEW_HEIGHT
    function clamp(next: number) {
        const panel = panelRef.current;
        const preview = panel?.previousElementSibling as HTMLElement | null | undefined;
        const sharedHeight = (preview?.offsetHeight ?? 0) + (panel?.offsetHeight ?? 0);
        const max = Math.max(MIN_HEIGHT, Math.min(sharedHeight - MIN_PREVIEW_HEIGHT, window.innerHeight * 0.7));
        return Math.min(Math.max(next, MIN_HEIGHT), max);
    }

    function startResize(event: PointerEvent<HTMLDivElement>) {
        // Keeps receiving the pointer's moves even when it passes over the preview iframe
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = {startY: event.clientY, startHeight: height};
        document.body.classList.add("is-resizing");
    }

    function resize(event: PointerEvent<HTMLDivElement>) {
        if (!drag.current) return;
        // Dragging up makes the panel taller
        setHeight(clamp(drag.current.startHeight + drag.current.startY - event.clientY));
    }

    function stopResize() {
        drag.current = null;
        document.body.classList.remove("is-resizing");
    }

    function resizeWithKeys(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
        event.preventDefault();
        setHeight(current => clamp(current + (event.key === "ArrowUp" ? KEYBOARD_STEP : -KEYBOARD_STEP)));
    }

    return (
        <section
            ref={panelRef}
            className={cx("code-panel", hidden && "is-hidden")}
            style={hidden ? undefined : {height}}
            aria-label="Code">
            {!hidden && (
                <div
                    role="separator"
                    aria-orientation="horizontal"
                    aria-label="Resize the code panel"
                    aria-valuenow={Math.round(height)}
                    aria-valuemin={MIN_HEIGHT}
                    tabIndex={0}
                    className="code-resize-handle"
                    onPointerDown={startResize}
                    onPointerMove={resize}
                    onPointerUp={stopResize}
                    onPointerCancel={stopResize}
                    onKeyDown={resizeWithKeys}
                />
            )}
            <div className="code-panel-header">
                <div className="code-panel-actions">
                    <span className="code-panel-title">Code</span>
                    <button
                        type="button"
                        className="code-toggle"
                        aria-expanded={!hidden}
                        aria-controls="code-panel-body"
                        onClick={() => setHidden(current => !current)}>
                        {hidden ? <ChevronUp aria-hidden="true" /> : <ChevronDown aria-hidden="true" />}
                        {hidden ? "Show code" : "Hide code"}
                    </button>
                </div>
                {/* Top-right corner of the code */}
                <button type="button" className="code-copy" onClick={copy}>
                    {copyState === "copied" ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                    {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy code"}
                </button>
                {/* Tells screen reader users the copy worked, without moving focus */}
                <span className="visually-hidden" role="status">
                    {copyState === "copied" ? "Code copied" : copyState === "failed" ? "Copy failed" : ""}
                </span>
            </div>
            <pre id="code-panel-body" className="canvas-code" hidden={hidden}>
                <code>{code}</code>
            </pre>
        </section>
    );
}
