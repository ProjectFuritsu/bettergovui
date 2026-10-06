import {useEffect, useLayoutEffect, useState} from "react";
import {cx} from "../src/utils/cx";
import {entries} from "./entries";
import {LanguageProvider} from "../src";
import type {FrameMessage, Language, Theme} from "./workbench/devices";
import type {Controls, ValuesOf} from "./workbench/types";

interface FrameState {
    entryName: string;
    values: ValuesOf<Controls>;
    theme: Theme;
    language: Language;
}

// Runs inside the device preview iframe. Its own viewport is the device's size,
// so media queries respond to the phone/tablet/desktop width, just like on a real device.
export default function Frame() {
    const [state, setState] = useState<FrameState | null>(null);

    useEffect(() => {
        function onMessage(event: MessageEvent<FrameMessage>) {
            // Only accept messages from the workbench page that contains this frame
            if (event.origin !== location.origin || event.source !== window.parent) return;
            if (event.data?.type === "render") {
                const {entryName, values, theme, language} = event.data;
                setState({entryName, values, theme, language});
            }
        }

        window.addEventListener("message", onMessage);
        // Ask the workbench for the current component, values and theme
        const ready: FrameMessage = {type: "frame-ready"};
        window.parent.postMessage(ready, location.origin);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // Same light/dark theme as the workbench, applied before the browser paints
    useLayoutEffect(() => {
        if (state) document.documentElement.dataset.theme = state.theme;
    }, [state?.theme]);

    // The page's language, so screen readers pronounce the texts correctly
    useLayoutEffect(() => {
        if (state) document.documentElement.lang = state.language;
    }, [state?.language]);

    const entry = state && entries.find(item => item.name === state.entryName);
    if (!state || !entry) return null;

    return (
        <div className={cx("frame", `frame--${entry.layout}`)}>
            <LanguageProvider language={state.language}>
                <div className="frame-stage">{entry.render(state.values)}</div>
            </LanguageProvider>
        </div>
    );
}
