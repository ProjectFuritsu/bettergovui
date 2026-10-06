import {Monitor, MonitorSmartphone, Smartphone, Tablet} from "lucide-react";
import type {Controls, ValuesOf} from "./types";

// Screen sizes for the preview, in CSS pixels, portrait first.
// "responsive" has no fixed size: it fills the preview area at 100%.
export const DEVICES = {
    responsive: {label: "Responsive", width: null, height: null, icon: MonitorSmartphone, rotatable: false},
    desktop: {label: "Desktop", width: 1280, height: 800, icon: Monitor, rotatable: false},
    tablet: {label: "Tablet", width: 768, height: 1024, icon: Tablet, rotatable: true},
    phone: {label: "Phone", width: 390, height: 844, icon: Smartphone, rotatable: true},
} as const;

export type DeviceName = keyof typeof DEVICES;

export type Theme = "light" | "dark";
export type {Language} from "../../src";

// Messages between the workbench and the preview iframe
export type FrameMessage =
    | {type: "frame-ready"}
    | {type: "render"; entryName: string; values: ValuesOf<Controls>; theme: Theme; language: import("../../src").Language};
