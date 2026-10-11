import {useEffect, useRef, useState} from "react";
import {DEVICES, type DeviceName, type FrameMessage, type Language, type Theme} from "../workbench/devices";
import type {SectionData} from "./schema";

interface SectionFrameProps {
    sections: SectionData[];
    theme: Theme;
    language: Language;
    device: DeviceName;
    /** As tall as its content (for one section in a list); otherwise it fills its box and scrolls inside */
    autoHeight?: boolean;
    title: string;
}

/**
 * Shows sections in an iframe, so media queries respond to the chosen device's width,
 * as on a real phone or tablet. Narrower devices are centered.
 */
export function SectionFrame({sections, theme, language, device, autoHeight = false, title}: SectionFrameProps) {
    const frameRef = useRef<HTMLIFrameElement>(null);
    // Goes up every time the frame (re)loads, which re-sends the current state to it
    const [loads, setLoads] = useState(0);
    const [height, setHeight] = useState(240);

    useEffect(() => {
        function onMessage(event: MessageEvent<FrameMessage>) {
            if (event.origin !== location.origin || event.source !== frameRef.current?.contentWindow) return;
            if (event.data?.type === "frame-ready") setLoads(count => count + 1);
            if (event.data?.type === "frame-height") setHeight(event.data.height);
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    useEffect(() => {
        if (loads === 0) return;
        const message: FrameMessage = {type: "render-page", sections, theme, language, autoHeight};
        frameRef.current?.contentWindow?.postMessage(message, location.origin);
    }, [loads, sections, theme, language, autoHeight]);

    const width = DEVICES[device].width;

    return (
        <div className="section-frame" data-device={device} style={{maxWidth: width ?? undefined, height: autoHeight ? height : undefined}}>
            <iframe ref={frameRef} src="?frame" title={title} />
        </div>
    );
}
