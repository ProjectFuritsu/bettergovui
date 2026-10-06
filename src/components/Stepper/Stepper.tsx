import {
    Children,
    isValidElement,
    type CSSProperties,
    type HTMLAttributes,
    type ReactElement,
    type ReactNode,
} from "react";
import {isLightThemeColor, resolveColor, type Color} from "../../utils/color";
import {cx} from "../../utils/cx";
import {isSizePreset, toCssLength, type Size} from "../../utils/size";
import styles from "./Stepper.module.css";

/* ---------- Step and StepperCompleted (read by Stepper, they don't render by themselves) ---------- */

export interface StepProps {
    /** The step's name, e.g. "Personal info". */
    label?: ReactNode;
    /** A short line under the label. */
    description?: ReactNode;
    /** Shown in the circle instead of the step number. */
    icon?: ReactNode;
    /** The content shown while this is the current step (e.g. that part of the form). */
    children?: ReactNode;
}

/** One step. Use it inside a Stepper. */
export function Step(_props: StepProps) {
    return null;
}

/** Content shown when every step is done (when `active` is past the last step). */
export function StepperCompleted({children}: {children?: ReactNode}) {
    return <>{children}</>;
}

/* ---------- Stepper ---------- */

export interface StepperProps extends HTMLAttributes<HTMLDivElement> {
    /** The current step, counting from 0. Steps before it are shown as done. */
    active: number;
    /** Called with a step's index when it's clicked. Without it, the steps aren't clickable. */
    onStepClick?: (index: number) => void;
    /** With onStepClick: also allow clicking steps after the current one. By default only done steps and the current one can be clicked. */
    allowNextSteps?: boolean;
    /** "horizontal" (default) switches to vertical by itself when there isn't room (under about 34rem wide). */
    orientation?: "horizontal" | "vertical";
    /** Color of done and current steps: "primary", "success"… or any CSS color. Default "primary". */
    color?: Color;
    /** A preset ("xs"–"xl"), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
    /** Screen reader text added to done steps. Default "completed". */
    completedLabel?: string;
}

type StepState = "completed" | "active" | "upcoming";

/** Shows progress through a multi-step process, like a form split into parts. */
export function Stepper({
    active,
    onStepClick,
    allowNextSteps = false,
    orientation = "horizontal",
    color,
    size = "md",
    completedLabel = "completed",
    className,
    style,
    children,
    ...rest
}: StepperProps) {
    const all = Children.toArray(children).filter(isValidElement);
    const steps = all.filter(child => child.type === Step) as ReactElement<StepProps>[];
    const completed = all.find(child => child.type === StepperCompleted);
    const preset = isSizePreset(size);

    const settings = {
        "--stepper-size": preset ? undefined : toCssLength(size),
        "--stepper-color": color === undefined ? undefined : resolveColor(color),
    } as CSSProperties;

    const content = active >= steps.length ? completed : steps[active]?.props.children;

    return (
        <div
            className={cx(styles.stepper, className)}
            data-size={preset ? size : undefined}
            data-auto-contrast={isLightThemeColor(color) || undefined}
            style={{...settings, ...style}}
            {...rest}>
            <ol className={styles.steps} data-orientation={orientation}>
                {steps.map((step, index) => {
                    const state: StepState = index < active ? "completed" : index === active ? "active" : "upcoming";
                    const clickable = Boolean(onStepClick) && (index <= active || allowNextSteps);
                    const {label, description, icon} = step.props;

                    const inner = (
                        <>
                            <span className={styles.indicator}>
                                {state === "completed" ? <CheckIcon /> : icon ?? index + 1}
                            </span>
                            {(label || description) && (
                                <span className={styles.text}>
                                    {label && (
                                        <span className={styles.label}>
                                            {label}
                                            {state === "completed" && <span className={styles.srOnly}> ({completedLabel})</span>}
                                        </span>
                                    )}
                                    {description && <span className={styles.description}>{description}</span>}
                                </span>
                            )}
                        </>
                    );

                    return (
                        <li key={index} className={styles.step} data-state={state}>
                            {clickable ? (
                                <button
                                    type="button"
                                    className={styles.stepButton}
                                    aria-current={state === "active" ? "step" : undefined}
                                    onClick={() => onStepClick?.(index)}>
                                    {inner}
                                </button>
                            ) : (
                                <div className={styles.stepButton} aria-current={state === "active" ? "step" : undefined}>
                                    {inner}
                                </div>
                            )}
                            {index < steps.length - 1 && <span className={styles.connector} aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
            {content && <div className={styles.content}>{content}</div>}
        </div>
    );
}

function CheckIcon() {
    return (
        <svg className={styles.check} viewBox="0 0 24 24" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}
