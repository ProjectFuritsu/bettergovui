import {useState} from "react";
import {Alert, Button, type AlertProps} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    title: {type: "text", default: "Application submitted"},
    children: {type: "text", default: "We'll send you an email once it has been reviewed."},
    variant: {type: "select", options: ["light", "filled", "outline"] as const, default: "light"},
    color: {type: "themeColor", default: "info"},
    icon: {type: "boolean", default: true},
    autoContrast: {type: "boolean", default: false},
    // Not a prop: shows the close button (onClose)
    closable: {type: "boolean", default: false},
} satisfies Controls;

// An alert that really closes, with a way to bring it back
function ClosableAlert(props: AlertProps) {
    const [open, setOpen] = useState(true);
    if (!open) {
        return <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Show the alert again</Button>;
    }
    return <Alert {...props} onClose={() => setOpen(false)} />;
}

export const alertEntry = defineEntry({
    name: "Alert",
    category: "Feedback",
    description: "A message box for feedback. Each color has a matching icon; warnings and errors are announced right away.",
    layout: "fill",
    controls,
    render: ({title, children, icon, closable, ...props}) => {
        const alertProps: AlertProps = {
            title: title || undefined,
            children: children || undefined,
            icon: icon ? undefined : false,
            ...props,
        };
        return closable ? <ClosableAlert {...alertProps} /> : <Alert {...alertProps} />;
    },
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["children", "closable"]),
            values.closable && "onClose={() => setOpen(false)}",
        ]);
        const tag = values.children
            ? `${openTag("Alert", props)}\n    ${values.children}\n</Alert>`
            : openTag("Alert", props, "", true);
        return `import { Alert } from "bettergovregiondavaoui";\n\n${tag}`;
    },
});
