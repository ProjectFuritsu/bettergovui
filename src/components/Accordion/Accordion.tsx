import {createContext, useContext, useId, type DetailsHTMLAttributes, type HTMLAttributes, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import styles from "./Accordion.module.css";

// The group name that makes the items close each other (undefined when several may be open)
const AccordionContext = createContext<string | undefined>(undefined);

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
    /** Let several items be open at once. By default, opening one closes the others. */
    multiple?: boolean;
    /** "contained" (default): one box with lines between the items. "separated": each item is its own box. */
    variant?: "contained" | "separated";
}

/**
 * A list of sections that open and close, e.g. FAQs or "requirements" for each permit.
 * Built on the browser's own `<details>`, so it works with the keyboard and screen readers, and
 * the browser's find (Ctrl+F) opens the item that has the match.
 */
export function Accordion({multiple = false, variant = "contained", className, ...rest}: AccordionProps) {
    const name = useId();
    return (
        <AccordionContext.Provider value={multiple ? undefined : name}>
            <div className={cx(styles.accordion, className)} data-variant={variant} {...rest} />
        </AccordionContext.Provider>
    );
}

export interface AccordionItemProps extends Omit<DetailsHTMLAttributes<HTMLDetailsElement>, "title"> {
    /** The line that's always visible and opens the item when clicked, e.g. a question. */
    title: ReactNode;
    /** Start open. (To control it yourself, use `open` with `onToggle`.) */
    defaultOpen?: boolean;
}

/** One section of an Accordion: its title, and the content shown when it's open. */
export function AccordionItem({title, defaultOpen, open, className, children, ...rest}: AccordionItemProps) {
    const name = useContext(AccordionContext);
    return (
        <details className={cx(styles.item, className)} name={name} open={open ?? defaultOpen} {...rest}>
            <summary className={styles.summary}>
                <span>{title}</span>
                <svg className={styles.chevron} viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </summary>
            <div className={styles.content}>{children}</div>
        </details>
    );
}
