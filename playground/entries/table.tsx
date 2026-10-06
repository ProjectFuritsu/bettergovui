import {Badge, Table, type TableColumn} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

interface Application {
    id: string;
    service: string;
    filed: Date;
    fee: number;
    status: "Approved" | "In review" | "Needs action";
}

const APPLICATIONS: Application[] = [
    {id: "BP-2026-0142", service: "Business permit", filed: new Date(2026, 8, 12), fee: 2500, status: "Approved"},
    {id: "RPT-2026-0877", service: "Real property tax", filed: new Date(2026, 9, 1), fee: 4320.5, status: "Needs action"},
    {id: "BC-2026-1203", service: "Barangay clearance", filed: new Date(2026, 8, 28), fee: 100, status: "In review"},
    {id: "BLD-2026-0031", service: "Building permit", filed: new Date(2026, 7, 5), fee: 15800, status: "In review"},
];

const STATUS_COLORS = {"Approved": "success", "In review": "info", "Needs action": "warning"} as const;
const peso = new Intl.NumberFormat("en-PH", {style: "currency", currency: "PHP"});

const controls = {
    caption: {type: "text", default: "Your applications"},
    sortable: {type: "boolean", default: true},
    striped: {type: "boolean", default: false},
    highlightOnHover: {type: "boolean", default: true},
    stackOnMobile: {type: "boolean", default: true},
    // Not a prop: shows the table with no rows
    empty: {type: "boolean", default: false},
} satisfies Controls;

function columns(sortable: boolean): TableColumn<Application>[] {
    return [
        {key: "id", header: "Reference"},
        {key: "service", header: "Service", sortable},
        {key: "filed", header: "Filed", sortable, render: row => row.filed.toLocaleDateString("en-PH", {dateStyle: "medium"})},
        {key: "fee", header: "Fee", sortable, align: "right", render: row => peso.format(row.fee)},
        {key: "status", header: "Status", render: row => <Badge color={STATUS_COLORS[row.status]}>{row.status}</Badge>},
    ];
}

export const tableEntry = defineEntry({
    name: "Table",
    category: "Data display",
    description: "Rows and columns from your data. Click a sortable heading to sort. Try the Phone view: each row becomes a small card.",
    layout: "full",
    controls,
    render: ({sortable, empty, caption, ...props}) => (
        <Table
            caption={caption || undefined}
            columns={columns(sortable)}
            data={empty ? [] : APPLICATIONS}
            rowKey="id"
            {...props}
        />
    ),
    code: values => {
        const sortable = values.sortable ? ", sortable: true" : "";
        const props = compact([
            values.caption && `caption="${values.caption}"`,
            "columns={columns}",
            "data={applications}",
            `rowKey="id"`,
            ...jsxProps(controls, values, ["caption", "sortable", "empty"]),
        ]);
        return `import { Badge, Table, type TableColumn } from "bettergovregiondavaoui";

const columns: TableColumn<Application>[] = [
    { key: "id", header: "Reference" },
    { key: "service", header: "Service"${sortable} },
    { key: "filed", header: "Filed"${sortable}, render: row => row.filed.toLocaleDateString() },
    { key: "fee", header: "Fee", align: "right"${sortable}, render: row => peso.format(row.fee) },
    { key: "status", header: "Status", render: row => <Badge>{row.status}</Badge> },
];

${openTag("Table", props, "", true)}`;
    },
});
