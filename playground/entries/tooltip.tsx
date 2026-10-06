import {Download} from "lucide-react";
import {Button, Tooltip} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Download your permit as a PDF"},
    placement: {type: "select", options: ["top", "bottom", "left", "right"] as const, default: "top"},
    // Not a prop: what the tooltip is attached to
    trigger: {type: "select", options: ["button", "icon button", "text"] as const, default: "icon button"},
    openDelay: {type: "number", min: 0, max: 1000, step: 100, default: 200},
    withArrow: {type: "boolean", default: true},
    disabled: {type: "boolean", default: false},
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const tooltipEntry = defineEntry({
    name: "Tooltip",
    category: "Data display",
    description: "A short hint on hover or keyboard focus. Escape hides it, and it flips sides when there's no room.",
    layout: "centered",
    controls,
    render: ({label, trigger, color, ...props}) => (
        <Tooltip label={label} color={color === "default" ? undefined : color} {...props}>
            {trigger === "icon button" ? (
                <Button variant="outline" leftIcon={<Download />} aria-label="Download" />
            ) : trigger === "button" ? (
                <Button variant="outline">Download</Button>
            ) : (
                // Plain text needs tabIndex so keyboard users can reach it too
                <span tabIndex={0} style={{textDecoration: "underline dotted", cursor: "help"}}>Business permit</span>
            )}
        </Tooltip>
    ),
    code: values => {
        const props = jsxProps(controls, values, ["trigger"]);
        const child = values.trigger === "icon button"
            ? `<Button variant="outline" leftIcon={<Download />} aria-label="Download" />`
            : values.trigger === "button"
                ? `<Button variant="outline">Download</Button>`
                : `<span tabIndex={0}>Business permit</span>`;
        const imports = compact([
            `import { ${values.trigger === "text" ? "Tooltip" : "Button, Tooltip"} } from "bettergovregiondavaoui";`,
            values.trigger === "icon button" && `import { Download } from "lucide-react";`,
        ]);
        return `${imports.join("\n")}

${openTag("Tooltip", props)}
    ${child}
</Tooltip>`;
    },
});
