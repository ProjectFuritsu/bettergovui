import {Radio, RadioGroup} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";
import {LayoutGuides} from "../workbench/LayoutGuides";

const CHOICES = [
    {value: "walk-in", label: "Walk-in", description: "Bring your documents to the city hall."},
    {value: "online", label: "Online", description: "Upload scanned copies."},
    {value: "mail", label: "By mail", description: "Send copies by courier."},
];

const controls = {
    label: {type: "text", default: "How will you submit your documents?"},
    description: {type: "text", default: ""},
    error: {type: "text", default: ""},
    defaultValue: {type: "select", options: ["none", "walk-in", "online", "mail"] as const, default: "none"},
    orientation: {type: "select", options: ["vertical", "horizontal"] as const, default: "vertical"},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
    gap: {type: "size", default: "", optional: true},
    // Not a prop: adds a description under each choice
    choiceDescriptions: {type: "boolean", default: false},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
    // Not a prop: draws the spacing guides over the preview
    showGuides: {type: "boolean", default: false},
} satisfies Controls;

export const radioEntry = defineEntry({
    name: "Radio",
    category: "Forms",
    description: "One choice from a list. RadioGroup holds the question; arrow keys move between the choices.",
    layout: "centered",
    controls,
    render: ({showGuides, description, error, defaultValue, gap, choiceDescriptions, ...props}) => (
        <LayoutGuides enabled={showGuides} getTargets={element => [element, element.querySelector("[data-orientation]")]}>
            <RadioGroup
                // defaultValue only applies when the group first appears, so recreate it when it changes
                key={defaultValue}
                defaultValue={defaultValue === "none" ? undefined : defaultValue}
                description={description || undefined}
                error={error || undefined}
                gap={gap === "" ? undefined : gap}
                {...props}>
                {CHOICES.map(choice => (
                    <Radio
                        key={choice.value}
                        value={choice.value}
                        label={choice.label}
                        description={choiceDescriptions ? choice.description : undefined}
                    />
                ))}
            </RadioGroup>
        </LayoutGuides>
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["defaultValue", "choiceDescriptions", "showGuides"]),
            values.defaultValue !== "none" && `defaultValue="${values.defaultValue}"`,
        ]);
        const radios = CHOICES.map(choice => openTag("Radio", compact([
            `value="${choice.value}"`,
            `label="${choice.label}"`,
            values.choiceDescriptions && `description="${choice.description}"`,
        ]), "    ", true));
        return `import { Radio, RadioGroup } from "bettergovregiondavaoui";

${openTag("RadioGroup", props)}
${radios.join("\n")}
</RadioGroup>`;
    },
});
