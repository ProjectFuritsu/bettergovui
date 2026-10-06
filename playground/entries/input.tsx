import {Input} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {ICON_OPTIONS, iconImport, iconProp, renderIcon} from "../workbench/icons";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Email address"},
    placeholder: {type: "text", default: "juan@example.com"},
    description: {type: "text", default: ""},
    error: {type: "text", default: ""},
    type: {type: "select", options: ["text", "email", "password", "number", "tel", "search"] as const, default: "text"},
    size: {type: "size", default: "md"},
    leftIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    rightIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const inputEntry = defineEntry({
    name: "Input",
    category: "Forms",
    description: "A text field with a label, helper text, an error message and icons. Type an error to see that state.",
    layout: "centered",
    controls,
    render: ({description, error, leftIcon, rightIcon, ...props}) => (
        <Input
            description={description || undefined}
            error={error || undefined}
            leftIcon={renderIcon(leftIcon)}
            rightIcon={renderIcon(rightIcon)}
            {...props}
        />
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["leftIcon", "rightIcon"]),
            iconProp("leftIcon", values.leftIcon),
            iconProp("rightIcon", values.rightIcon),
        ]);
        const imports = compact([
            `import { Input } from "bettergovregiondavaoui";`,
            iconImport([values.leftIcon, values.rightIcon]),
        ]);
        return `${imports.join("\n")}\n\n${openTag("Input", props, "", true)}`;
    },
});
