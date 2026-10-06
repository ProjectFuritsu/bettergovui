import {useState} from "react";
import {Code, MobileNumberInput, PesoInput, Stack} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

// Shows what the field gives back, and what a form would send (from the hidden input the field adds)
function Result({onValueChange, formValue}: {onValueChange: string; formValue: string}) {
    return <Code block>{`onValueChange gave: ${onValueChange}\nThe form sends: ${formValue}`}</Code>;
}

// ---------- Mobile number ----------

const mobileControls = {
    label: {type: "text", default: "Mobile number"},
    description: {type: "text", default: "We'll text you when your permit is ready."},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function MobileDemo({description, ...props}: ValuesOf<typeof mobileControls>) {
    const [result, setResult] = useState({number: "", e164: null as string | null, valid: false});
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <MobileNumberInput
                description={description || undefined}
                name="mobile"
                onValueChange={(number, details) => setResult({number, ...details})}
                {...props}
            />
            <Result
                onValueChange={`"${result.number}", { valid: ${result.valid}, e164: ${result.e164 ? `"${result.e164}"` : "null"} }`}
                formValue={`mobile=${result.e164 ?? ""}`}
            />
        </Stack>
    );
}

export const mobileNumberInputEntry = defineEntry({
    name: "MobileNumberInput",
    category: "Forms",
    description: "A Philippine mobile number with +63. Spaces appear as you type; try pasting 0917-123-4567. Leave it half-typed to see the message.",
    layout: "centered",
    controls: mobileControls,
    render: values => <MobileDemo {...values} />,
    code: values => {
        const props = compact([
            // The label is left out while it is the component's own default
            ...jsxProps(mobileControls, values, values.label === "Mobile number" ? ["label"] : []),
            `name="mobile"`,
            "onValueChange={(number, { e164 }) => setMobile(e164)}",
        ]);
        return `import { MobileNumberInput } from "bettergovregiondavaoui";

// e164 is "+639171234567" once the number is complete, otherwise null
${openTag("MobileNumberInput", props, "", true)}`;
    },
});

// ---------- Peso amount ----------

const pesoControls = {
    label: {type: "text", default: "Amount to pay"},
    description: {type: "text", default: ""},
    // 0 = no limit
    min: {type: "number", min: 0, max: 1000, step: 50, default: 100},
    max: {type: "number", min: 0, max: 100000, step: 1000, default: 50000},
    decimals: {type: "select", options: ["2", "0"] as const, default: "2"},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function PesoDemo({description, min, max, decimals, ...props}: ValuesOf<typeof pesoControls>) {
    const [amount, setAmount] = useState<number | null>(null);
    const places = Number(decimals);
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <PesoInput
                // Start over when the number of decimals changes
                key={decimals}
                description={description || undefined}
                min={min || undefined}
                max={max || undefined}
                decimals={places}
                name="amount"
                onValueChange={setAmount}
                {...props}
            />
            <Result onValueChange={String(amount)} formValue={`amount=${amount === null ? "" : amount.toFixed(places)}`} />
        </Stack>
    );
}

export const pesoInputEntry = defineEntry({
    name: "PesoInput",
    category: "Forms",
    description: "An amount in pesos with ₱. Commas appear as you type and centavos are filled in when you leave the field. Try an amount below the minimum.",
    layout: "centered",
    controls: pesoControls,
    render: values => <PesoDemo {...values} />,
    code: values => {
        const props = compact([
            ...jsxProps(pesoControls, values, ["min", "max", "decimals"]),
            values.min > 0 && `min={${values.min}}`,
            values.max > 0 && `max={${values.max}}`,
            values.decimals === "0" && "decimals={0}",
            `name="amount"`,
            "onValueChange={amount => setAmount(amount)}",
        ]);
        return `import { PesoInput } from "bettergovregiondavaoui";

// amount is a number (e.g. 1500.5), or null when the field is empty
${openTag("PesoInput", props, "", true)}`;
    },
});
