import {Textarea} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Message"},
    placeholder: {type: "text", default: "Tell us more about your request…"},
    description: {type: "text", default: ""},
    error: {type: "text", default: ""},
    size: {type: "size", default: "md"},
    rows: {type: "number", min: 1, max: 10, default: 3},
    autosize: {type: "boolean", default: false},
    // 0 = no limit (the prop is left out)
    maxRows: {type: "number", min: 0, max: 12, default: 0},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const textareaEntry = defineEntry({
    name: "Textarea",
    category: "Forms",
    description: "A multi-line text field. Turn on autosize and type several lines to see it grow (up to maxRows).",
    layout: "centered",
    controls,
    render: ({description, error, maxRows, ...props}) => (
        <Textarea
            description={description || undefined}
            error={error || undefined}
            maxRows={maxRows || undefined}
            {...props}
        />
    ),
    code: values => `import { Textarea } from "bettergovregiondavaoui";

${openTag("Textarea", jsxProps(controls, values), "", true)}`,
});
