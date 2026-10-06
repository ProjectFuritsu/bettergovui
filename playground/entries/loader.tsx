import {Loader} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    type: {type: "select", options: ["spinner", "dots", "bars"] as const, default: "spinner"},
    size: {type: "size", default: "md"},
    // Matches the page's text color, which is what the Loader uses when no color is given
    color: {type: "themeColor", default: "default", none: "default"},
} satisfies Controls;

export const loaderEntry = defineEntry({
    name: "Loader",
    category: "Feedback",
    description: "A loading animation: spinner, dots or bars. Button uses it for its loading state.",
    layout: "centered",
    controls,
    render: ({color, ...props}) => (
        <Loader color={color === controls.color.default ? undefined : color} {...props} />
    ),
    code: values => `import { Loader } from "bettergovregiondavaoui";

${openTag("Loader", jsxProps(controls, values), "", true)}`,
});
