import {Text} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {
        type: "text",
        default: "Apply for a business permit online. Fill in the form, upload your requirements, and track your application from home.",
    },
    as: {type: "select", options: ["p", "span", "div", "strong", "em", "small"] as const, default: "p"},
    size: {type: "size", default: "md"},
    weight: {type: "select", options: ["default", "normal", "medium", "semibold", "bold"] as const, default: "default"},
    color: {type: "themeColor", default: "none", none: "none"},
    muted: {type: "boolean", default: false},
    align: {type: "select", options: ["left", "center", "right"] as const, default: "left"},
    truncate: {type: "boolean", default: false},
    // 0 = no limit (the prop is left out)
    lineClamp: {type: "number", min: 0, max: 4, default: 0},
} satisfies Controls;

export const textEntry = defineEntry({
    name: "Text",
    category: "Typography",
    description: "Text with consistent sizes, weights and colors. muted is for hints and dates; lineClamp cuts long text off.",
    layout: "centered",
    controls,
    render: ({children, weight, color, align, lineClamp, ...props}) => (
        <Text
            weight={weight === "default" ? undefined : weight}
            color={color === "none" ? undefined : color}
            align={align === "left" ? undefined : align}
            lineClamp={lineClamp || undefined}
            style={{width: "100%"}}
            {...props}>
            {children}
        </Text>
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["children", "weight", "color"]),
            values.weight !== "default" && `weight="${values.weight}"`,
            values.color !== "none" && `color="${values.color}"`,
        ]);
        return `import { Text } from "bettergovregiondavaoui";\n\n${openTag("Text", props)}${values.children}</Text>`;
    },
});
