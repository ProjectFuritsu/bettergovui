import {Heading, type HeadingLevel} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {type: "text", default: "Business permits and licensing"},
    level: {type: "select", options: ["1", "2", "3", "4", "5", "6"] as const, default: "2"},
    // "same" = looks like its own level (the prop is left out)
    size: {type: "select", options: ["same", "1", "2", "3", "4", "5", "6"] as const, default: "same"},
    align: {type: "select", options: ["left", "center", "right"] as const, default: "left"},
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const headingEntry = defineEntry({
    name: "Heading",
    category: "Typography",
    description: "Real h1–h6 headings. level is the meaning (for screen readers); size changes only the look. Big sizes shrink on phones.",
    layout: "centered",
    controls,
    render: ({children, level, size, align, color}) => (
        <Heading
            level={Number(level) as HeadingLevel}
            size={size === "same" ? undefined : Number(size) as HeadingLevel}
            align={align === "left" ? undefined : align}
            color={color === "default" ? undefined : color}
            style={{width: "100%"}}>
            {children}
        </Heading>
    ),
    code: values => {
        const props = compact([
            `level={${values.level}}`,
            values.size !== "same" && `size={${values.size}}`,
            ...jsxProps(controls, values, ["children", "level", "size"]),
        ]);
        return `import { Heading } from "bettergovregiondavaoui";\n\n${openTag("Heading", props)}${values.children}</Heading>`;
    },
});
