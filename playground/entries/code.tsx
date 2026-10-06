import {Code, Text} from "../../src";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    children: {type: "text", default: "npm install bettergovregiondavaoui"},
    block: {type: "boolean", default: false},
    // Only for blocks: a Copy button in the top-right corner
    copyable: {type: "boolean", default: false},
} satisfies Controls;

export const codeEntry = defineEntry({
    name: "Code",
    category: "Typography",
    description: "Monospace text for commands, file names or reference numbers. block makes a separate box; copyable adds a Copy button to it.",
    layout: "centered",
    controls,
    render: ({children, block, copyable}) => block ? (
        <div style={{width: "100%"}}><Code block copyable={copyable}>{children}</Code></div>
    ) : (
        <Text style={{width: "100%"}}>To get started, run <Code>{children}</Code> in your project folder.</Text>
    ),
    code: values => `import { Code } from "bettergovregiondavaoui";

${values.block ? `<Code block${values.copyable ? " copyable" : ""}>${values.children}</Code>` : `<Code>${values.children}</Code>`}`,
});
