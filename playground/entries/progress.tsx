import {Progress} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Uploading documents"},
    value: {type: "number", min: 0, max: 100, default: 40},
    // Not a prop: leaves `value` out, for "busy, amount unknown"
    indeterminate: {type: "boolean", default: false},
    showValue: {type: "boolean", default: true},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
} satisfies Controls;

export const progressEntry = defineEntry({
    name: "Progress",
    category: "Feedback",
    description: "A bar that fills as something gets done. Leave out value when the amount isn't known: the bar slides back and forth.",
    layout: "fill",
    controls,
    render: ({indeterminate, label, value, ...props}) => (
        <Progress label={label || undefined} value={indeterminate ? undefined : value} {...props} />
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["value", "indeterminate"]),
            !values.indeterminate && `value={${values.value}}`,
        ]);
        return `import { Progress } from "bettergovregiondavaoui";

${openTag("Progress", props, "", true)}`;
    },
});
