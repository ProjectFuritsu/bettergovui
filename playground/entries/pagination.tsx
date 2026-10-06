import {useState} from "react";
import {Pagination, type PaginationProps} from "../../src";
import {jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const controls = {
    total: {type: "number", min: 1, max: 50, default: 10},
    siblings: {type: "number", min: 0, max: 3, default: 1},
    boundaries: {type: "number", min: 1, max: 3, default: 1},
    withEdges: {type: "boolean", default: false},
    size: {type: "size", default: "md"},
    color: {type: "themeColor", default: "primary"},
    autoContrast: {type: "boolean", default: false},
    disabled: {type: "boolean", default: false},
} satisfies Controls;

// Shows the current page next to the pagination, like a real list would
function PaginationDemo(props: PaginationProps) {
    const [page, setPage] = useState(1);
    return (
        <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 16}}>
            <Pagination {...props} page={page} onPageChange={setPage} />
            <p className="hint" style={{margin: 0}}>Showing page {Math.min(page, props.total)} of {props.total}</p>
        </div>
    );
}

export const paginationEntry = defineEntry({
    name: "Pagination",
    category: "Navigation",
    description: "Page numbers with … for the gaps. It always shows the same number of buttons, so nothing jumps while you click.",
    layout: "centered",
    controls,
    render: props => <PaginationDemo {...props} />,
    code: values => {
        // total isn't optional, so it's always in the code
        const props = [`total={${values.total}}`, ...jsxProps(controls, values, ["total"]), "page={page}", "onPageChange={setPage}"];
        return `import { useState } from "react";
import { Pagination } from "bettergovregiondavaoui";

const [page, setPage] = useState(1);

${openTag("Pagination", props, "", true)}`;
    },
});
