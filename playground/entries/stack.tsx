import {Stack} from "../../src";
import {isListElement, LAYOUT_ELEMENTS} from "../../src/utils/element";
import {DemoBox, DemoItem} from "../workbench/DemoBox";
import {LayoutGuides} from "../workbench/LayoutGuides";
import {compact, jsxProps, listItem, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    as: {type: "select", options: LAYOUT_ELEMENTS, default: "div"},
    gap: {type: "size", default: "md"},
    align: {type: "select", options: ["stretch", "start", "center", "end"] as const, default: "stretch"},
    justify: {type: "select", options: ["start", "center", "end", "space-between"] as const, default: "start"},
    // Not a prop: draws the layout guides (columns, gaps, padding) over the preview
    showGuides: {type: "boolean", default: true},
} satisfies Controls;

export const stackEntry = defineEntry({
    name: "Stack",
    category: "Layout",
    description: "Puts things in a column with even space between them. The usual way to space out a page or a form. `as` picks the HTML element, e.g. section or ul.",
    layout: "fill",
    controls,
    render: ({showGuides, ...props}) => {
        const list = isListElement(props.as);
        return (
            <LayoutGuides enabled={showGuides}>
                {/* A fixed height, so justify has room to show its effect */}
                <Stack style={{height: 280}} {...props}>
                    <DemoItem list={list}><DemoBox>Personal information</DemoBox></DemoItem>
                    <DemoItem list={list}><DemoBox style={{width: 200}}>Business details</DemoBox></DemoItem>
                    <DemoItem list={list}><DemoBox>Requirements</DemoBox></DemoItem>
                </Stack>
            </LayoutGuides>
        );
    },
    code: values => {
        const list = isListElement(values.as);
        return `import { Stack } from "bettergovregiondavaoui";

${openTag("Stack", compact(jsxProps(controls, values, ["showGuides"])))}
    ${listItem(list, "<PersonalInfo />")}
    ${listItem(list, "<BusinessDetails />")}
    ${listItem(list, "<Requirements />")}
</Stack>`;
    },
});
