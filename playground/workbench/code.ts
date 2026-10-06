import type {Controls, ValuesOf} from "./types";

// Turns edited values into JSX attributes, leaving out any that are still at their default.
// Text (like a label) is content, so it's always included unless it's empty.
export function jsxProps<C extends Controls>(controls: C, values: ValuesOf<C>, skip: (keyof C)[] = []) {
    const props: string[] = [];

    for (const key of Object.keys(controls) as (keyof C & string)[]) {
        const control = controls[key];
        const value = values[key];
        if (skip.includes(key)) continue;
        if (control.type === "text" ? value === "" : value === control.default) continue;

        if (value === true) props.push(key);
        else if (typeof value === "boolean" || typeof value === "number") props.push(`${key}={${value}}`);
        // Text with quotes in it needs the {"..."} form
        else if (String(value).includes('"')) props.push(`${key}={${JSON.stringify(value)}}`);
        else props.push(`${key}="${value}"`);
    }

    return props;
}

// Drops the `false` entries from a list built with `condition && "text"`
export function compact(items: Array<string | false | null | undefined>) {
    return items.filter((item): item is string => Boolean(item));
}

// `<Tag a="1" b>` on one line, or one prop per line once it gets long.
// `selfClosing` ends it with `/>` for tags without children.
export function openTag(name: string, props: string[], indent = "", selfClosing = false) {
    const end = selfClosing ? " />" : ">";
    const oneLine = `${indent}<${name}${props.map(prop => ` ${prop}`).join("")}${end}`;
    // 80 characters, like Prettier's default
    if (oneLine.length <= 80) return oneLine;

    return [`${indent}<${name}`, ...props.map(prop => `${indent}    ${prop}`), `${indent}${end.trim()}`].join("\n");
}

// In the code for a layout with as="ul" / "ol", each child goes in an <li>
export function listItem(list: boolean, child: string) {
    return list ? `<li>${child}</li>` : child;
}
