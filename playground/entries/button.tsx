import {Button} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {ICON_OPTIONS, renderIcon} from "../workbench/icons";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {type: "text", default: "Button"},
    variant: {type: "select", options: ["filled", "outline", "text"] as const, default: "filled"},
    color: {type: "themeColor", default: "primary"},
    size: {type: "size", default: "md"},
    leftIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    rightIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    loading: {type: "boolean", default: false},
    loaderType: {type: "select", options: ["spinner", "dots", "bars"] as const, default: "spinner"},
    fullWidth: {type: "boolean", default: false},
    autoContrast: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const buttonEntry = defineEntry({
    name: "Button",
    category: "Buttons",
    description: "filled = solid background · outline = border only · text = no border, no background. "
        + "Clear the text to get an icon-only button.",
    layout: "centered",
    controls,
    render: ({children, color, leftIcon, rightIcon, ...props}) => (
        <Button
            // Leave color unset at its default so the --primary token still applies
            color={color === controls.color.default ? undefined : color}
            leftIcon={renderIcon(leftIcon)}
            rightIcon={renderIcon(rightIcon)}
            // Icon-only buttons need a label for screen readers
            aria-label={children === "" ? [leftIcon, rightIcon].find(icon => icon !== "none") : undefined}
            {...props}>
            {children}
        </Button>
    ),
    code: values => {
        const icons = [values.leftIcon, values.rightIcon].filter(icon => icon !== "none");
        const iconOnly = values.children === "" && icons.length > 0;

        const props = [
            ...jsxProps(controls, values, ["children", "leftIcon", "rightIcon"]),
            values.leftIcon !== "none" && `leftIcon={<${values.leftIcon} />}`,
            values.rightIcon !== "none" && `rightIcon={<${values.rightIcon} />}`,
            iconOnly && `aria-label="${icons[0]}"`,
        ].filter((prop): prop is string => Boolean(prop));

        const imports = [`import { Button } from "bettergovregiondavaoui";`];
        if (icons.length > 0) {
            imports.push(`import { ${[...new Set(icons)].join(", ")} } from "lucide-react";`);
        }

        const tag = values.children === ""
            ? openTag("Button", props, "", true)
            : `${openTag("Button", props)}${values.children}</Button>`;

        return `${imports.join("\n")}\n\n${tag}`;
    },
});
