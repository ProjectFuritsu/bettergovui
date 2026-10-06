import {useState} from "react";
import {AddressPicker, Code, type AddressValue} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const DAVAO_REGION = "110000000";

const controls = {
    legend: {type: "text", default: "Business address"},
    description: {type: "text", default: ""},
    // Not a prop: sets limitToRegion to Davao Region's code
    davaoOnly: {type: "boolean", default: false},
    variant: {type: "select", options: ["plain", "outline", "filled"] as const, default: "plain"},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

// A component so it can show what onChange gives back
function AddressPickerDemo({davaoOnly, description, ...props}: ValuesOf<typeof controls>) {
    const [address, setAddress] = useState<AddressValue>({});
    return (
        <div style={{display: "flex", flexDirection: "column", gap: 16, width: "100%"}}>
            <AddressPicker
                // Start over when the region limit changes
                key={String(davaoOnly)}
                description={description || undefined}
                limitToRegion={davaoOnly ? DAVAO_REGION : undefined}
                onChange={setAddress}
                {...props}
            />
            <Code block>{`onChange gave:\n${JSON.stringify(address, null, 2)}`}</Code>
        </div>
    );
}

export const addressPickerEntry = defineEntry({
    name: "AddressPicker",
    category: "Forms",
    description: "Region → Province → City / Municipality → Barangay from the official PSGC list, loaded as each field is chosen. Try Metro Manila: it has no provinces.",
    layout: "fill",
    controls,
    render: values => <AddressPickerDemo {...values} />,
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["davaoOnly", "variant"]),
            values.variant !== "plain" && `variant="${values.variant}"`,
            values.davaoOnly && `limitToRegion="${DAVAO_REGION}"`,
            `name="address"`,
            "onChange={setAddress}",
        ]);
        return `import { AddressPicker } from "bettergovregiondavaoui";

// onChange gives { region, province, city, barangay }, each { code, name }.
// Save the PSGC codes; names can change. With name="address", the form sends
// address.region, address.province, address.city and address.barangay.${values.davaoOnly ? `
// limitToRegion="${DAVAO_REGION}" is Davao Region: only its places are offered.` : ""}
${openTag("AddressPicker", props, "", true)}`;
    },
});
