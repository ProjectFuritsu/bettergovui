import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Accordion, AccordionItem} from "../../components/Accordion/Accordion";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./FaqBlock.module.css";

export interface FaqBlockItem {
    question: ReactNode;
    answer: ReactNode;
}

export interface FaqBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    eyebrow?: ReactNode;
    /** The section's heading (an `<h2>`). Default "Frequently asked questions". */
    title?: ReactNode;
    description?: ReactNode;
    /** The questions and their answers. */
    items: FaqBlockItem[];
    /** A button under the description, e.g. `{ label: "Contact the help desk", href: "/help" }`. */
    action?: BlockAction;
    /** Let several answers be open at once. */
    multiple?: boolean;
}

/** Questions and answers that open one at a time, with the title beside them on wide screens. */
export function FaqBlock({
    eyebrow,
    title = "Frequently asked questions",
    description,
    items,
    action,
    multiple = false,
    className,
    ...rest
}: FaqBlockProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className={cx(shared.section, className)} {...rest}>
            <Container className={styles.inner}>
                <div className={styles.intro}>
                    {eyebrow && <p className={shared.eyebrow}>{eyebrow}</p>}
                    <h2 id={titleId} className={shared.title}>{title}</h2>
                    {description && <p className={shared.description}>{description}</p>}
                    {action && <div className={shared.actions}>{renderAction(action, {variant: "outline"})}</div>}
                </div>
                <Accordion multiple={multiple}>
                    {items.map((item, index) => (
                        <AccordionItem key={index} title={item.question}>{item.answer}</AccordionItem>
                    ))}
                </Accordion>
            </Container>
        </section>
    );
}
