import {useState} from "react";
import {Button, Code, PasswordInput, Stack} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Password"},
    description: {type: "text", default: "At least 8 characters."},
    error: {type: "text", default: ""},
    toggle: {type: "boolean", default: true},
    defaultVisible: {type: "boolean", default: false},
    autoComplete: {type: "select", options: ["current-password", "new-password"] as const, default: "current-password"},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

// A component so it can show what onVisibleChange gives back
function PasswordDemo({description, error, ...props}: ValuesOf<typeof controls>) {
    const [visible, setVisible] = useState(props.defaultVisible);
    const [sent, setSent] = useState(false);
    const note = sent ? "\nThe form was sent, so the password is hidden again." : "";
    return (
        // A form, to show that sending it hides the password again
        <form
            style={{width: "100%"}}
            onSubmit={event => {
                event.preventDefault(); // stay on the demo page
                setSent(true);
            }}>
            <Stack gap="md">
                <PasswordInput
                    // Start over when defaultVisible changes
                    key={String(props.defaultVisible)}
                    description={description || undefined}
                    error={error || undefined}
                    onVisibleChange={setVisible}
                    {...props}
                />
                <Button type="submit" style={{alignSelf: "flex-start"}}>Sign in</Button>
                <Code block>{`onVisibleChange gave: ${visible}${note}\nTurn on Caps Lock and type to see the warning.`}</Code>
            </Stack>
        </form>
    );
}

export const passwordInputEntry = defineEntry({
    name: "PasswordInput",
    category: "Forms",
    description: "A password field with an eye button to show or hide it. Warns when Caps Lock is on, and hides the password again when the form is sent. Use visible to control it yourself.",
    layout: "centered",
    controls,
    render: values => <PasswordDemo {...values} />,
    code: values => {
        const props = compact([...jsxProps(controls, values), `name="password"`]);
        return `import { PasswordInput } from "bettergovregiondavaoui";

// To show or hide it yourself: visible={shown} onVisibleChange={setShown}
// For sign-up and "change password" forms, use autoComplete="new-password"
${openTag("PasswordInput", props, "", true)}`;
    },
});
