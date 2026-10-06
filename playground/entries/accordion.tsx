import {Accordion, AccordionItem} from "../../src";
import {compact, jsxProps, openTag} from "../workbench/code";
import {defineEntry, type Controls} from "../workbench/types";

const FAQS = [
    {
        question: "What do I need for a new business permit?",
        answer: "A barangay clearance, your DTI or SEC registration, a lease contract or land title, and a valid ID.",
    },
    {
        question: "How long does it take?",
        answer: "Usually 3 to 5 working days once your documents are complete. We'll send you an email when it's ready.",
    },
    {
        question: "Can I pay online?",
        answer: "Yes. You can pay with GCash, Maya or a debit card on the Payments page, or at the City Treasurer's Office.",
    },
];

const controls = {
    variant: {type: "select", options: ["contained", "separated"] as const, default: "contained"},
    multiple: {type: "boolean", default: false},
    // Not a prop of Accordion: whether the first item starts open (its defaultOpen)
    firstOpen: {type: "boolean", default: true},
} satisfies Controls;

export const accordionEntry = defineEntry({
    name: "Accordion",
    category: "Data display",
    description: "Sections that open and close, e.g. FAQs. By default opening one closes the others; multiple lets several stay open.",
    layout: "fill",
    controls,
    render: ({firstOpen, ...props}) => (
        // A new key when `multiple` changes, so the items regroup
        <Accordion key={String(props.multiple)} {...props}>
            {FAQS.map((faq, index) => (
                <AccordionItem key={faq.question} title={faq.question} defaultOpen={index === 0 && firstOpen}>
                    {faq.answer}
                </AccordionItem>
            ))}
        </Accordion>
    ),
    code: values => {
        const items = FAQS.map((faq, index) => {
            const props = compact([`title="${faq.question}"`, index === 0 && values.firstOpen && "defaultOpen"]);
            return `${openTag("AccordionItem", props, "    ")}\n        ${faq.answer}\n    </AccordionItem>`;
        });
        return `import { Accordion, AccordionItem } from "bettergovregiondavaoui";

${openTag("Accordion", jsxProps(controls, values, ["firstOpen"]))}
${items.join("\n")}
</Accordion>`;
    },
});
