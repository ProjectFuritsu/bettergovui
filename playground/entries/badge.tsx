import {Badge} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {ICON_OPTIONS, iconImport, iconProp, renderIcon} from "../workbench/icons";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {type: "text", default: "Approved"},
    variant: {type: "select", options: ["light", "filled", "outline"] as const, default: "light"},
    color: {type: "themeColor", default: "primary"},
    size: {type: "size", default: "md"},
    leftIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    rightIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    autoContrast: {type: "boolean", default: false},
} satisfies Controls;

export const badgeEntry = defineEntry({
    name: "Badge",
    category: "Feedback",
    description: "A small status label. light = soft background · filled = solid · outline = border only.",
    layout: "centered",
    controls,
    render: ({children, leftIcon, rightIcon, ...props}) => (
        <Badge leftIcon={renderIcon(leftIcon)} rightIcon={renderIcon(rightIcon)} {...props}>{children}</Badge>
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["children", "leftIcon", "rightIcon"]),
            iconProp("leftIcon", values.leftIcon),
            iconProp("rightIcon", values.rightIcon),
        ]);
        const imports = compact([
            `import { Badge } from "bettergovregiondavaoui";`,
            iconImport([values.leftIcon, values.rightIcon]),
        ]);
        return `${imports.join("\n")}\n\n${openTag("Badge", props)}${values.children}</Badge>`;
    },
});
