import {Button, Divider, Group, Stack, Text} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    label: {type: "text", default: "or"},
    labelPosition: {type: "select", options: ["center", "left", "right"] as const, default: "center"},
    orientation: {type: "select", options: ["horizontal", "vertical"] as const, default: "horizontal"},
    variant: {type: "select", options: ["solid", "dashed", "dotted"] as const, default: "solid"},
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const dividerEntry = defineEntry({
    name: "Divider",
    category: "Layout",
    description: "A line between sections, optionally with text (\"or\"). vertical puts it between items in a row.",
    layout: "fill",
    controls,
    render: ({label, color, ...props}) => props.orientation === "vertical" ? (
        <Group gap="md">
            <Text size="sm">Help</Text>
            <Divider color={color === "default" ? undefined : color} {...props} />
            <Text size="sm">Privacy</Text>
            <Divider color={color === "default" ? undefined : color} {...props} />
            <Text size="sm">Contact us</Text>
        </Group>
    ) : (
        <Stack gap="lg">
            <Button fullWidth>Log in with your PhilSys ID</Button>
            <Divider label={label || undefined} color={color === "default" ? undefined : color} {...props} />
            <Button fullWidth variant="outline">Log in with email</Button>
        </Stack>
    ),
    code: values => {
        const props = compact(jsxProps(controls, values, values.orientation === "vertical" ? ["label", "labelPosition"] : []));
        return `import { Divider } from "bettergovregiondavaoui";\n\n${openTag("Divider", props, "", true)}`;
    },
});
