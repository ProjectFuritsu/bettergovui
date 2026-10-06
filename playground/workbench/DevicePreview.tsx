import {useEffect, useLayoutEffect, useRef, useState} from "react";
import type {Controls, ValuesOf} from "./types";
import {DEVICES, type DeviceName, type FrameMessage, type Language, type Theme} from "./devices";

interface DevicePreviewProps {
    device: DeviceName;
    landscape: boolean;
    entryName: string;
    values: ValuesOf<Controls>;
    theme: Theme;
    language: Language;
}

// Shows the component in an iframe. "Responsive" fills the preview area at 100%;
// the other devices use their real size, shrunk to fit when they're bigger than the area.
// Space kept around a device for its bezel (up to 8px, see .device in playground.css) and a bit of air
const BEZEL_ROOM = 12;

export function DevicePreview({device, landscape, entryName, values, theme, language}: DevicePreviewProps) {
    const areaRef = useRef<HTMLDivElement>(null);
    const frameRef = useRef<HTMLIFrameElement>(null);
    const [area, setArea] = useState({width: 0, height: 0});
    // Goes up every time the frame (re)loads, which re-sends the current state to it
    const [frameLoads, setFrameLoads] = useState(0);

    const spec = DEVICES[device];
    const rotated = landscape && spec.rotatable;
    const responsive = spec.width === null;
    let width: number;
    let height: number;
    let scale = 1;
    if (spec.width === null) {
        // Only used for the label: the size itself comes from CSS (100% of the area), so it
        // can't get stuck even if the browser delays measuring (e.g. in a background tab)
        width = Math.floor(area.width);
        height = Math.floor(area.height);
    } else {
        width = rotated ? spec.height : spec.width;
        height = rotated ? spec.width : spec.height;
        // Shrink the device to fit, never enlarge it. The bezel is drawn outside the screen's
        // edge, so leave room for it on every side or it gets cut off.
        const room = 2 * BEZEL_ROOM;
        if (area.width > room && area.height > room) {
            scale = Math.min(1, (area.width - room) / width, (area.height - room) / height);
        }
    }

    // Track how much room the device has: measured right away (and on every device switch),
    // then again whenever the area changes size, e.g. when the code panel is hidden or resized
    useLayoutEffect(() => {
        const element = areaRef.current;
        if (!element) return;
        const measure = () => {
            const {width: areaWidth, height: areaHeight} = element.getBoundingClientRect();
            setArea(previous =>
                previous.width === areaWidth && previous.height === areaHeight ? previous : {width: areaWidth, height: areaHeight},
            );
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [device, landscape]);

    // The frame announces itself when it's ready
    useEffect(() => {
        function onMessage(event: MessageEvent<FrameMessage>) {
            if (event.origin !== location.origin || event.source !== frameRef.current?.contentWindow) return;
            if (event.data?.type === "frame-ready") {
                setFrameLoads(count => count + 1);
            }
        }
        window.addEventListener("message", onMessage);
        return () => window.removeEventListener("message", onMessage);
    }, []);

    // Send the component, its values, the theme and the language to the frame whenever they change
    useEffect(() => {
        if (frameLoads === 0) return;
        const message: FrameMessage = {type: "render", entryName, values, theme, language};
        frameRef.current?.contentWindow?.postMessage(message, location.origin);
    }, [frameLoads, entryName, values, theme, language]);

    const orientation = spec.rotatable ? (rotated ? " landscape" : " portrait") : "";

    return (
        <div className="canvas-preview">
            <div className="device-area" ref={areaRef}>
                <div
                    className="device"
                    data-device={device}
                    style={responsive ? undefined : {width: width * scale, height: height * scale}}>
                    <iframe
                        ref={frameRef}
                        src="?frame"
                        title={`${spec.label} preview`}
                        style={responsive ? undefined : {width, height, transform: scale < 1 ? `scale(${scale})` : undefined}}
                    />
                </div>
            </div>
            <p className="device-label">
                {spec.label}{orientation} · {width} × {height}
                {scale < 1 && ` · shown at ${Math.round(scale * 100)}%`}
            </p>
        </div>
    );
}
