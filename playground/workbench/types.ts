import type {ReactNode} from "react";

// One editable property in the properties pane
export type Control =
    | {type: "text"; default: string}
    | {type: "boolean"; default: boolean}
    | {type: "select"; options: readonly string[]; default: string}
    | {type: "number"; min: number; max: number; step?: number; default: number}
    | {type: "color"; default: string}
    // A theme color name ("primary", "accent"…) or a custom color from the color picker ("#e8590c").
    // `none` adds a first choice that leaves the prop unset, e.g. "default"; its value is that text.
    | {type: "themeColor"; default: string; none?: string}
    // A size preset (xs–xl) or a custom number of pixels.
    // `optional` adds a "default" choice (value "") that leaves the prop unset.
    | {type: "size"; default: string | number; optional?: boolean};

export type Controls = Record<string, Control>;

// The value type each control produces, e.g. a select gives one of its options
type ValueOf<C extends Control> =
    C extends {type: "select"; options: readonly (infer Option extends string)[]} ? Option :
    C extends {type: "boolean"} ? boolean :
    C extends {type: "number"} ? number :
    C extends {type: "size"} ? string | number :
    string;

export type ValuesOf<C extends Controls> = {-readonly [K in keyof C]: ValueOf<C[K]>};

// The sidebar's groups, in the order they're shown
export const CATEGORIES = [
    "Typography",
    "Layout",
    "Buttons",
    "Forms",
    "Feedback",
    "Navigation",
    "Data display",
    "Overlays",
    "Blocks",
] as const;

export type Category = typeof CATEGORIES[number];

// A component the workbench can edit
export interface Entry<C extends Controls = Controls> {
    name: string;
    /** The sidebar group it's listed under */
    category: Category;
    description: string;
    /**
     * "centered" for small components like Button, "fill" for ones that need width like Tabs (up to 720px),
     * "full" for ones that need the whole width, like Container, "page" for a whole page (Scaffold): edge to edge, no space around
     */
    layout: "centered" | "fill" | "full" | "page";
    controls: C;
    render: (values: ValuesOf<C>) => ReactNode;
    code: (values: ValuesOf<C>) => string;
}

// Keeps each entry's values fully typed while it's written, then stores it in the shared list
export function defineEntry<C extends Controls>(entry: Entry<C>): Entry {
    return entry as unknown as Entry;
}

export function defaultValues(controls: Controls): ValuesOf<Controls> {
    return Object.fromEntries(Object.entries(controls).map(([key, control]) => [key, control.default]));
}
