import {Switch} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Email notifications"},
    description: {type: "text", default: "Get an email when your application status changes."},
    error: {type: "text", default: ""},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
    defaultChecked: {type: "boolean", default: true},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const switchEntry = defineEntry({
    name: "Switch",
    category: "Forms",
    description: "An on/off switch for settings that apply right away. Screen readers announce it as a switch.",
    layout: "centered",
    controls,
    render: ({description, error, defaultChecked, ...props}) => (
        <Switch
            // defaultChecked only applies when the switch first appears, so recreate it when it changes
            key={String(defaultChecked)}
            defaultChecked={defaultChecked}
            description={description || undefined}
            error={error || undefined}
            {...props}
        />
    ),
    code: values => {
        // defaultChecked is on in this demo, but off is the component's real default
        const props = [...jsxProps(controls, values, ["defaultChecked"]), ...(values.defaultChecked ? ["defaultChecked"] : [])];
        return `import { Switch } from "bettergovregiondavaoui";

${openTag("Switch", props, "", true)}`;
    },
});
