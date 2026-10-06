import {Checkbox} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "I agree to the terms and conditions"},
    description: {type: "text", default: ""},
    error: {type: "text", default: ""},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
    defaultChecked: {type: "boolean", default: false},
    indeterminate: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const checkboxEntry = defineEntry({
    name: "Checkbox",
    category: "Forms",
    description: "A checkbox with a label. indeterminate shows a dash, for \"some selected\".",
    layout: "centered",
    controls,
    render: ({description, error, defaultChecked, ...props}) => (
        <Checkbox
            // defaultChecked only applies when the checkbox first appears, so recreate it when it changes
            key={String(defaultChecked)}
            defaultChecked={defaultChecked}
            description={description || undefined}
            error={error || undefined}
            {...props}
        />
    ),
    code: values => `import { Checkbox } from "bettergovregiondavaoui";

${openTag("Checkbox", jsxProps(controls, values), "", true)}`,
});
