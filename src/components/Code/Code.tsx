import {useEffect, useRef, useState, type HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import styles from "./Code.module.css";

export interface CodeProps extends HTMLAttributes<HTMLElement> {
    /** A separate block of code (keeps line breaks, scrolls sideways when long) instead of code inside a sentence. */
    block?: boolean;
    /** With `block`: a Copy button in the top-right corner that copies the code. */
    copyable?: boolean;
    /** Text on the copy button. Default "Copy". */
    copyLabel?: string;
    /** Text shown (and told to screen readers) after copying. Default "Copied". */
    copiedLabel?: string;
}

// Copies text, with an older fallback for pages on plain http (where the clipboard API isn't allowed)
async function copyText(text: string) {
    try {
        await navigator.clipboard.writeText(text);
    } catch {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        textarea.remove();
        if (!copied) throw new Error("Copy failed");
    }
}

/** Code in a monospace font, e.g. a command, a file name or a reference number. */
export function Code({
    block = false,
    copyable = false,
    copyLabel: copyLabelProp,
    copiedLabel: copiedLabelProp,
    className,
    children,
    ...rest
}: CodeProps) {
    const t = useMessages();
    const copyLabel = copyLabelProp ?? t.copy;
    const copiedLabel = copiedLabelProp ?? t.copied;
    const codeRef = useRef<HTMLElement>(null);
    const [copied, setCopied] = useState(false);
    const timer = useRef<number | undefined>(undefined);

    useEffect(() => () => clearTimeout(timer.current), []);

    async function copy() {
        try {
            // The text as shown, so it works whatever children were passed
            await copyText(codeRef.current?.textContent ?? "");
            setCopied(true);
            clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setCopied(false), 2000);
        } catch {
            // Copying isn't allowed here; the code can still be selected by hand
        }
    }

    if (!block) {
        return <code className={cx(styles.inline, className)} {...rest}>{children}</code>;
    }

    const pre = (
        <pre className={cx(styles.block, className)} data-copyable={copyable || undefined} {...rest}>
            <code ref={codeRef}>{children}</code>
        </pre>
    );

    if (!copyable) return pre;

    return (
        <div className={styles.wrapper}>
            {pre}
            <button type="button" className={styles.copy} onClick={copy}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                    {copied
                        ? <path d="M20 6 9 17l-5-5" />
                        : <><rect x="8" y="8" width="13" height="13" rx="2" /><path d="M4 16V5a2 2 0 0 1 2-2h11" /></>}
                </svg>
                {copied ? copiedLabel : copyLabel}
            </button>
            {/* Tells screen reader users the copy worked, without moving focus */}
            <span className={styles.srOnly} role="status">{copied ? copiedLabel : ""}</span>
        </div>
    );
}
