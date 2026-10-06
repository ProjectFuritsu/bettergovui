import {useState} from "react";
import {Code, GroupedNumberInput, MobileNumberInput, PesoInput, PhilSysInput, Stack, TinInput} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

// Shows what the field gives back, and what a form would send (from the hidden input the field adds)
function Result({onValueChange, formValue}: {onValueChange: string; formValue: string}) {
    return <Code block>{`onValueChange gave: ${onValueChange}\nThe form sends: ${formValue}`}</Code>;
}

// ---------- Mobile number ----------

const mobileControls = {
    // Empty: the component's own label, in the preview's language
    label: {type: "text", default: ""},
    description: {type: "text", default: "We'll text you when your permit is ready."},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function MobileDemo({label, description, ...props}: ValuesOf<typeof mobileControls>) {
    const [result, setResult] = useState({number: "", e164: null as string | null, valid: false});
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <MobileNumberInput
                label={label || undefined}
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
            ...jsxProps(mobileControls, values),
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

// ---------- PhilSys ----------

const philsysControls = {
    // Empty: the component's own label, in the preview's language
    label: {type: "text", default: ""},
    description: {type: "text", default: "The 16 digits under your photo on the PhilID."},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function PhilSysDemo({label, description, ...props}: ValuesOf<typeof philsysControls>) {
    const [result, setResult] = useState({digits: "", complete: false});
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <PhilSysInput
                label={label || undefined}
                description={description || undefined}
                name="pcn"
                onValueChange={(digits, {complete}) => setResult({digits, complete})}
                {...props}
            />
            <Result onValueChange={`"${result.digits}", { complete: ${result.complete} }`} formValue={`pcn=${result.complete ? result.digits : ""}`} />
        </Stack>
    );
}

export const philSysInputEntry = defineEntry({
    name: "PhilSysInput",
    category: "Forms",
    description: "The 16-digit PhilSys Card Number (PCN) from the PhilID, shown as 1234-5678-9012-3456. Dashes appear as you type; pasted numbers are cleaned up.",
    layout: "centered",
    controls: philsysControls,
    render: values => <PhilSysDemo {...values} />,
    code: values => {
        const props = compact([...jsxProps(philsysControls, values), `name="pcn"`, "onValueChange={(digits, { complete }) => setPcn(digits)}"]);
        return `import { PhilSysInput } from "bettergovregiondavaoui";

${openTag("PhilSysInput", props, "", true)}`;
    },
});

// ---------- TIN ----------

const tinControls = {
    // Empty: the component's own label, in the preview's language
    label: {type: "text", default: ""},
    description: {type: "text", default: ""},
    branchCode: {type: "boolean", default: false},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function TinDemo({label, description, ...props}: ValuesOf<typeof tinControls>) {
    const [result, setResult] = useState({digits: "", complete: false, tin: "", branch: ""});
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <TinInput
                // Start over when the branch code is turned on or off
                key={String(props.branchCode)}
                label={label || undefined}
                description={description || undefined}
                name="tin"
                onValueChange={(digits, details) => setResult({digits, ...details})}
                {...props}
            />
            <Result
                onValueChange={`"${result.digits}", { complete: ${result.complete}, tin: "${result.tin}", branch: "${result.branch}" }`}
                formValue={`tin=${result.complete ? result.digits : ""}`}
            />
        </Stack>
    );
}

export const tinInputEntry = defineEntry({
    name: "TinInput",
    category: "Forms",
    description: "A BIR Tax Identification Number: 123-456-789. branchCode also asks for the branch code (3 or 5 digits, depending on the form).",
    layout: "centered",
    controls: tinControls,
    render: values => <TinDemo {...values} />,
    code: values => {
        const props = compact([...jsxProps(tinControls, values), `name="tin"`, "onValueChange={(digits, { tin, branch }) => setTin(tin)}"]);
        return `import { TinInput } from "bettergovregiondavaoui";

${openTag("TinInput", props, "", true)}`;
    },
});

// ---------- Any grouped number (SSS, PhilHealth, Pag-IBIG…) ----------

const ID_PRESETS = {
    "SSS number": {groups: [2, 7, 1], placeholder: "34-1234567-8"},
    "PhilHealth number": {groups: [2, 9, 1], placeholder: "12-345678901-2"},
    "Pag-IBIG MID number": {groups: [4, 4, 4], placeholder: "1234-5678-9012"},
};

const groupedControls = {
    // Not a prop: fills in groups, label and placeholder
    preset: {type: "select", options: Object.keys(ID_PRESETS) as (keyof typeof ID_PRESETS)[], default: "SSS number"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

function GroupedDemo({preset, ...props}: ValuesOf<typeof groupedControls>) {
    const [result, setResult] = useState({digits: "", complete: false});
    const {groups, placeholder} = ID_PRESETS[preset];
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <GroupedNumberInput
                key={preset}
                label={preset}
                groups={groups}
                placeholder={placeholder}
                name="id"
                onValueChange={(digits, {complete}) => setResult({digits, complete})}
                {...props}
            />
            <Result onValueChange={`"${result.digits}", { complete: ${result.complete} }`} formValue={`id=${result.complete ? result.digits : ""}`} />
        </Stack>
    );
}

export const groupedNumberInputEntry = defineEntry({
    name: "GroupedNumberInput",
    category: "Forms",
    description: "Any number written in digit groups. PhilSysInput and TinInput are built on it; here it's set up for SSS, PhilHealth and Pag-IBIG numbers.",
    layout: "centered",
    controls: groupedControls,
    render: values => <GroupedDemo {...values} />,
    code: values => {
        const {groups, placeholder} = ID_PRESETS[values.preset];
        const props = compact([
            `label="${values.preset}"`,
            `groups={[${groups.join(", ")}]}`,
            `placeholder="${placeholder}"`,
            ...jsxProps(groupedControls, values, ["preset"]),
            `name="sss"`,
        ]);
        return `import { GroupedNumberInput } from "bettergovregiondavaoui";

${openTag("GroupedNumberInput", props, "", true)}`;
    },
});
