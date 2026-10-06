import {useState} from "react";
import {Code, Stack, StatusChecker, type SiteStatus} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls, type ValuesOf} from "../workbench/types";

const controls = {
    url: {type: "text", default: "https://psgc.gitlab.io/api/regions/"},
    label: {type: "text", default: "PSGC address API"},
    variant: {type: "select", options: ["card", "badge"] as const, default: "card"},
    // seconds; 0 = check once
    interval: {type: "number", min: 0, max: 300, step: 15, default: 60},
    // Not a prop: strict is left out ("auto": on for this site, off for others) unless chosen here
    strict: {type: "select", options: ["auto", "on", "off"] as const, default: "auto"},
    // Not a prop: shows more checkers below, one of each kind of result
    examples: {type: "boolean", default: true},
} satisfies Controls;

// A component so it can show what onStatusChange gives back
function StatusDemo({strict, examples, label, ...props}: ValuesOf<typeof controls>) {
    const [last, setLast] = useState<{status: SiteStatus; responseTime?: number} | null>(null);
    return (
        <Stack gap="md" style={{width: "100%"}}>
            <StatusChecker
                // Start over when the address changes
                key={props.url}
                label={label || undefined}
                strict={strict === "auto" ? undefined : strict === "on"}
                onStatusChange={(status, details) => setLast({status, responseTime: details.responseTime})}
                {...props}
            />
            <Code block>{`onStatusChange gave: ${last ? `"${last.status}"${last.responseTime !== undefined ? `, ${last.responseTime} ms` : ""}` : "nothing yet"}`}</Code>
            {examples && (
                <Stack gap="sm">
                    {/* This toolkit itself: same site, so the check is strict (needs a success answer) */}
                    <StatusChecker url="/" label="This toolkit (same site, strict)" variant={props.variant} interval={0} />
                    {/* Up, but it blocks checks from other sites, so a browser can't tell. A serverCheck would. */}
                    <StatusChecker url="https://www.gov.ph" label="GOV.PH (blocks browser checks)" variant={props.variant} interval={0} />
                    {/* .invalid addresses never exist, so this is always offline */}
                    <StatusChecker url="https://portal.example.invalid" label="A site that doesn't exist" variant={props.variant} interval={0} timeout={5} />
                </Stack>
            )}
        </Stack>
    );
}

export const statusCheckerEntry = defineEntry({
    name: "StatusChecker",
    category: "Feedback",
    description: "Shows whether a website is up, with how fast it answered. \"Can't reach\" means no usable answer: the site is down, or it blocks checks from other sites (like GOV.PH). serverCheck tells for sure.",
    layout: "fill",
    controls,
    render: values => <StatusDemo {...values} />,
    code: values => {
        const props = compact([
            ...jsxProps(controls, values, ["strict", "examples"]),
            values.strict === "on" && "strict",
            values.strict === "off" && "strict={false}",
        ]);
        return `import { StatusChecker } from "bettergovregiondavaoui";

// Browsers hide other sites’ answers: any answer counts as online, none shows "Can’t reach".
// For a sure answer, check from your server: check={serverCheck("/api/site-status")} (see the README).
${openTag("StatusChecker", props, "", true)}`;
    },
});
