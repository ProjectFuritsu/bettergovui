import {Fieldset, Group, Input, Select} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    legend: {type: "text", default: "Business address"},
    description: {type: "text", default: "Where your business operates, not your home address."},
    error: {type: "text", default: ""},
    variant: {type: "select", options: ["outline", "filled", "plain"] as const, default: "outline"},
    gap: {type: "size", default: "md"},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const fieldsetEntry = defineEntry({
    name: "Fieldset",
    category: "Forms",
    description: "Groups related fields under one title, like an address. Screen readers say the title with each field; disabled turns them all off.",
    layout: "fill",
    controls,
    render: ({description, error, ...props}) => (
        <Fieldset description={description || undefined} error={error || undefined} {...props}>
            <Input label="Street and building" placeholder="e.g. 123 Rizal St., Unit 4" />
            <Group grow align="start">
                <Select label="City" options={["Davao City", "Tagum City", "Panabo City", "Digos City"]} />
                <Input label="ZIP code" inputMode="numeric" placeholder="8000" />
            </Group>
        </Fieldset>
    ),
    code: values => {
        const props = compact(jsxProps(controls, values));
        return `import { Fieldset, Group, Input, Select } from "bettergovregiondavaoui";

${openTag("Fieldset", props)}
    <Input label="Street and building" />
    <Group grow align="start">
        <Select label="City" options={["Davao City", "Tagum City"]} />
        <Input label="ZIP code" inputMode="numeric" />
    </Group>
</Fieldset>`;
    },
});
