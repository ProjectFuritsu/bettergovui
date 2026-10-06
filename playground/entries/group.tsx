import {Button, Group} from "../../src";
import {isListElement, LAYOUT_ELEMENTS} from "../../src/utils/element";
import {compact, jsxProps, listItem, openTag} from "../workbench/code";
import {DemoItem} from "../workbench/DemoBox";
import {LayoutGuides} from "../workbench/LayoutGuides";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    as: {type: "select", options: LAYOUT_ELEMENTS, default: "div"},
    gap: {type: "size", default: "md"},
    justify: {type: "select", options: ["start", "center", "end", "space-between"] as const, default: "start"},
    align: {type: "select", options: ["center", "start", "end", "stretch", "baseline"] as const, default: "center"},
    wrap: {type: "boolean", default: true},
    grow: {type: "boolean", default: false},
    // Not a prop: draws the layout guides (columns, gaps, padding) over the preview
    showGuides: {type: "boolean", default: true},
} satisfies Controls;

export const groupEntry = defineEntry({
    name: "Group",
    category: "Layout",
    description: "Puts things in a row, e.g. buttons. Wraps onto the next line when there isn't room; grow shares the width. `as` picks the HTML element, e.g. nav or ul.",
    layout: "fill",
    controls,
    render: ({showGuides, ...props}) => {
        const list = isListElement(props.as);
        return (
            <LayoutGuides enabled={showGuides}>
                <Group {...props}>
                    <DemoItem list={list}><Button variant="text">Back</Button></DemoItem>
                    <DemoItem list={list}><Button variant="outline">Save draft</Button></DemoItem>
                    <DemoItem list={list}><Button>Submit application</Button></DemoItem>
                </Group>
            </LayoutGuides>
        );
    },
    code: values => {
        const list = isListElement(values.as);
        return `import { Button, Group } from "bettergovregiondavaoui";

${openTag("Group", compact(jsxProps(controls, values, ["showGuides"])))}
    ${listItem(list, `<Button variant="text">Back</Button>`)}
    ${listItem(list, `<Button variant="outline">Save draft</Button>`)}
    ${listItem(list, "<Button>Submit application</Button>")}
</Group>`;
    },
});
