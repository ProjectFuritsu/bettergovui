import {useState} from "react";
import {Button, Input, Step, Stepper, StepperCompleted, type StepperProps} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const STEPS = [
    {label: "Personal info", description: "Name and address"},
    {label: "Documents", description: "Upload requirements"},
    {label: "Review", description: "Check and submit"},
];

const controls = {
    startAt: {type: "number", min: 0, max: 3, default: 0},
    orientation: {type: "select", options: ["horizontal", "vertical"] as const, default: "horizontal"},
    color: {type: "themeColor", default: "primary"},
    size: {type: "size", default: "md"},
    // Not props: whether the demo passes onStepClick, and whether steps have descriptions
    clickable: {type: "boolean", default: true},
    allowNextSteps: {type: "boolean", default: false},
    descriptions: {type: "boolean", default: true},
} satisfies Controls;

interface DemoProps extends Omit<StepperProps, "active"> {
    startAt: number;
    clickable: boolean;
    descriptions: boolean;
}

// A small multi-step form: Back / Next buttons move through the steps
function StepperDemo({startAt, clickable, descriptions, ...props}: DemoProps) {
    const [active, setActive] = useState(startAt);
    const last = STEPS.length;

    return (
        <div>
            <Stepper {...props} active={active} onStepClick={clickable ? setActive : undefined}>
                {STEPS.map((step, index) => (
                    <Step key={step.label} label={step.label} description={descriptions ? step.description : undefined}>
                        {index === 0 && <Input label="Full name" placeholder="Juan Dela Cruz" />}
                        {index === 1 && <p className="hint">Upload your barangay clearance and valid ID.</p>}
                        {index === 2 && <p className="hint">Check your details, then submit.</p>}
                    </Step>
                ))}
                <StepperCompleted>
                    <p className="hint">All done! Your application was submitted.</p>
                </StepperCompleted>
            </Stepper>
            <div style={{display: "flex", justifyContent: "space-between", marginTop: 24}}>
                <Button variant="outline" disabled={active === 0} onClick={() => setActive(active - 1)}>Back</Button>
                {active < last
                    ? <Button onClick={() => setActive(active + 1)}>{active === last - 1 ? "Submit" : "Next"}</Button>
                    : <Button variant="text" onClick={() => setActive(0)}>Start over</Button>}
            </div>
        </div>
    );
}

export const stepperEntry = defineEntry({
    name: "Stepper",
    category: "Navigation",
    description: "Progress through a multi-step form. Horizontal steppers switch to vertical when there isn't room — try the Phone view.",
    layout: "fill",
    controls,
    // Recreated when startAt changes, so the demo starts on that step
    render: ({startAt, ...props}) => <StepperDemo key={startAt} startAt={startAt} {...props} />,
    code: values => {
        const props = compact([
            "active={active}",
            values.clickable && "onStepClick={setActive}",
            ...jsxProps(controls, values, ["startAt", "clickable", "descriptions"]),
        ]);
        const steps = STEPS.map(step => {
            const stepProps = compact([`label="${step.label}"`, values.descriptions && `description="${step.description}"`]);
            return `${openTag("Step", stepProps, "    ")}\n        …this step's fields…\n    </Step>`;
        });
        return `import { useState } from "react";
import { Step, Stepper, StepperCompleted } from "bettergovregiondavaoui";

const [active, setActive] = useState(${values.startAt});

${openTag("Stepper", props)}
${steps.join("\n")}
    <StepperCompleted>All done!</StepperCompleted>
</Stepper>`;
    },
});
