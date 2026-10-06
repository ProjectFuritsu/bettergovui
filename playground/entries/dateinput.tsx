import {useState} from "react";
import {DateInput, Text} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const controls = {
    label: {type: "text", default: "Appointment date"},
    description: {type: "text", default: "Offices are open Monday to Friday."},
    error: {type: "text", default: ""},
    withTime: {type: "boolean", default: false},
    // Not a prop: sets min to today
    notInPast: {type: "boolean", default: true},
    size: {type: "size", default: "md"},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

// A component so it can show the Date it gets back
function DateInputDemo({notInPast, description, error, ...props}: ValuesOf<typeof controls>) {
    const [date, setDate] = useState<Date | null>(null);
    return (
        <div style={{display: "flex", flexDirection: "column", gap: 12, width: "100%"}}>
            <DateInput
                key={String(props.withTime)}
                description={description || undefined}
                error={error || undefined}
                min={notInPast ? new Date() : undefined}
                onValueChange={setDate}
                {...props}
            />
            <Text size="sm" muted>
                onValueChange gave: {date ? date.toLocaleString("en-PH", {dateStyle: "full", timeStyle: props.withTime ? "short" : undefined}) : "nothing yet"}
            </Text>
        </div>
    );
}

export const dateInputEntry = defineEntry({
    name: "DateInput",
    category: "Forms",
    description: "A date field with the browser's own picker (great on phones). It takes and gives JavaScript Dates; withTime adds a time.",
    layout: "centered",
    controls,
    render: values => <DateInputDemo {...values} />,
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["notInPast"]),
            values.notInPast && "min={new Date()}",
            "onValueChange={date => setDate(date)}",
        ]);
        return `import { DateInput } from "bettergovregiondavaoui";

${openTag("DateInput", props, "", true)}`;
    },
});
