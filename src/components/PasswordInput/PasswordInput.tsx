import {forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent} from "react";
import {useMessages} from "../../i18n/LanguageProvider";
import {Input, type InputProps} from "../Input/Input";
import styles from "./PasswordInput.module.css";

export interface PasswordInputProps extends Omit<InputProps, "type" | "rightSection"> {
    /** Show the password as text (true) or as dots (false). Pass this with onVisibleChange to control it yourself. */
    visible?: boolean;
    /** Show the password at first, when you don't control `visible`. Default false. */
    defaultVisible?: boolean;
    /** Called when the password is shown or hidden. */
    onVisibleChange?: (visible: boolean) => void;
    /** The eye button that shows and hides the password. Default true. */
    toggle?: boolean;
    /** What screen readers call the eye button while the password is hidden. Default "Show password". */
    showLabel?: string;
    /** What screen readers call the eye button while the password is shown. Default "Hide password". */
    hideLabel?: string;
}

/**
 * A password field with an eye button to show or hide what's typed. It also warns when Caps Lock is on,
 * and hides the password again when the form is sent.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
    {
        visible,
        defaultVisible = false,
        onVisibleChange,
        toggle = true,
        showLabel,
        hideLabel,
        description,
        autoComplete = "current-password",
        id,
        onKeyDown,
        onKeyUp,
        onBlur,
        ...rest
    },
    ref,
) {
    const t = useMessages();
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [internal, setInternal] = useState(defaultVisible);
    const [capsLock, setCapsLock] = useState(false);
    // Screen readers are told when the password is shown or hidden, but not when the page loads
    const [toggled, setToggled] = useState(false);
    const shown = visible ?? internal;

    function setShown(next: boolean) {
        if (visible === undefined) setInternal(next);
        onVisibleChange?.(next);
    }

    // Hide the password before the form is sent: a visible password is plain text, which browsers may
    // save in their list of things typed before
    useEffect(() => {
        const form = inputRef.current?.form;
        if (!shown || !form) return;
        function onSubmit() {
            if (inputRef.current) inputRef.current.type = "password";
            if (visible === undefined) setInternal(false);
            onVisibleChange?.(false);
        }
        form.addEventListener("submit", onSubmit);
        return () => form.removeEventListener("submit", onSubmit);
    }, [shown, visible, onVisibleChange]);

    const checkCapsLock = (event: KeyboardEvent<HTMLInputElement>) => setCapsLock(event.getModifierState("CapsLock"));

    return (
        <Input
            ref={node => {
                inputRef.current = node;
                if (typeof ref === "function") ref(node);
                else if (ref) ref.current = node;
            }}
            id={inputId}
            type={shown ? "text" : "password"}
            autoComplete={autoComplete}
            // Browsers' online spell-checkers can send what's typed in text fields to a server
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            description={
                description || capsLock ? (
                    <>
                        {description}
                        {capsLock && <span className={styles.capsLock}>{t.password.capsLock}</span>}
                    </>
                ) : undefined
            }
            rightSection={
                toggle && (
                    <>
                        <button
                            type="button"
                            className={styles.toggle}
                            aria-label={shown ? (hideLabel ?? t.password.hide) : (showLabel ?? t.password.show)}
                            aria-controls={inputId}
                            disabled={rest.disabled}
                            onClick={() => {
                                setShown(!shown);
                                setToggled(true);
                            }}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                {shown ? (
                                    // An eye with a line through it: "hide"
                                    <>
                                        <path d="M10.7 5.1a10.7 10.7 0 0 1 11.2 6.6 1 1 0 0 1 0 .6 10.7 10.7 0 0 1-1.4 2.5" />
                                        <path d="M14.1 14.2a3 3 0 0 1-4.3-4.3" />
                                        <path d="M17.5 17.5a10.8 10.8 0 0 1-15.4-5.2 1 1 0 0 1 0-.6 10.8 10.8 0 0 1 4.4-5.1" />
                                        <path d="m2 2 20 20" />
                                    </>
                                ) : (
                                    // An open eye: "show"
                                    <>
                                        <path d="M2.1 12.3a1 1 0 0 1 0-.6 10.8 10.8 0 0 1 19.8 0 1 1 0 0 1 0 .6 10.8 10.8 0 0 1-19.8 0" />
                                        <circle cx="12" cy="12" r="3" />
                                    </>
                                )}
                            </svg>
                        </button>
                        <span className={styles.srOnly} role="status">
                            {toggled ? (shown ? t.password.shown : t.password.hidden) : ""}
                        </span>
                    </>
                )
            }
            onKeyDown={event => {
                onKeyDown?.(event);
                checkCapsLock(event);
            }}
            onKeyUp={event => {
                onKeyUp?.(event);
                checkCapsLock(event);
            }}
            onBlur={event => {
                onBlur?.(event);
                setCapsLock(false);
            }}
            {...rest}
        />
    );
});
