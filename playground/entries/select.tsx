import {Select} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {ICON_OPTIONS, iconImport, iconProp, renderIcon} from "../workbench/icons";
import {defineEntry, type Controls} from "../workbench/types";

const CITIES = [
    "Davao City", "Digos City", "Mati City", "Panabo City", "Samal City", "Tagum City",
    "Bansalan", "Carmen", "Compostela", "Malita", "Nabunturan", "Santo Tomas",
    "Island Garden City of Samal, Davao del Norte (Babak, Samal and Kaputian districts)",
];

const controls = {
    label: {type: "text", default: "City"},
    placeholder: {type: "text", default: "Choose a city"},
    description: {type: "text", default: ""},
    error: {type: "text", default: ""},
    size: {type: "size", default: "md"},
    leftIcon: {type: "select", options: ICON_OPTIONS, default: "none"},
    // Shown by default when there are more than 8 choices
    searchable: {type: "boolean", default: true},
    native: {type: "boolean", default: false},
    required: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

export const selectEntry = defineEntry({
    name: "Select",
    category: "Forms",
    description: "A dropdown whose list opens under the field, with a search box for long lists. native uses the browser's own <select> instead.",
    layout: "centered",
    controls,
    render: ({description, error, placeholder, leftIcon, ...props}) => (
        <Select
            // The placeholder only applies when the select first appears, so recreate it when it changes
            key={`${placeholder}-${props.native}`}
            options={CITIES}
            placeholder={placeholder || undefined}
            description={description || undefined}
            error={error || undefined}
            leftIcon={renderIcon(leftIcon)}
            {...props}
        />
    ),
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["leftIcon"]),
            iconProp("leftIcon", values.leftIcon),
            `options={[${CITIES.map(city => `"${city}"`).join(", ")}]}`,
        ]);
        const imports = compact([
            `import { Select } from "bettergovregiondavaoui";`,
            iconImport([values.leftIcon]),
        ]);
        return `${imports.join("\n")}\n\n${openTag("Select", props, "", true)}`;
    },
});
