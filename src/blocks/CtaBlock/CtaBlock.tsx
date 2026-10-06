import {useId, type HTMLAttributes, type ReactNode} from "react";
import {Container} from "../../components/Container/Container";
import {cx} from "../../utils/cx";
import {renderAction, type BlockAction} from "../action";
import shared from "../blocks.module.css";
import styles from "./CtaBlock.module.css";

export interface CtaBlockProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
    /** The question or invitation, e.g. "Ready to apply?" (an `<h2>`). */
    title: ReactNode;
    description?: ReactNode;
    /** The main button, e.g. `{ label: "Start your application", href: "/apply" }`. */
    primaryAction?: BlockAction;
    /** A second, quieter button. */
    secondaryAction?: BlockAction;
}

/** A tinted banner that asks people to take the next step, usually near the end of a page. */
export function CtaBlock({title, description, primaryAction, secondaryAction, className, ...rest}: CtaBlockProps) {
    const titleId = useId();
    return (
        <section aria-labelledby={titleId} className={cx(shared.section, className)} {...rest}>
            <Container>
                <div className={styles.box}>
                    <div className={styles.text}>
                        <h2 id={titleId} className={shared.title}>{title}</h2>
                        {description && <p className={shared.description}>{description}</p>}
                    </div>
                    {(primaryAction || secondaryAction) && (
                        <div className={shared.actions}>
                            {renderAction(primaryAction, {size: "lg"})}
                            {renderAction(secondaryAction, {size: "lg", variant: "outline"})}
                        </div>
                    )}
                </div>
            </Container>
        </section>
    );
}
