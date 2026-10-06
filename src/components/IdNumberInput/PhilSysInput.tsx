import {forwardRef} from "react";
import {useMessages} from "../../i18n/LanguageProvider";
import {GroupedNumberInput, type GroupedNumberInputProps} from "./GroupedNumberInput";

export type PhilSysInputProps = Omit<GroupedNumberInputProps, "groups" | "separator" | "validLengths">;

/**
 * The 16-digit PhilSys Card Number (PCN) printed on the PhilID, shown as 1234-5678-9012-3456.
 * Ask for this one, not the 12-digit PhilSys Number (PSN), which is meant to stay private.
 * `onValueChange` gives the 16 digits; with `name`, the form sends them (no dashes).
 */
export const PhilSysInput = forwardRef<HTMLInputElement, PhilSysInputProps>(function PhilSysInput(
    {label, invalidMessage, placeholder = "1234-5678-9012-3456", ...rest},
    ref,
) {
    const t = useMessages();
    return (
        <GroupedNumberInput
            ref={ref}
            groups={[4, 4, 4, 4]}
            label={label ?? t.philsys.label}
            invalidMessage={invalidMessage ?? t.philsys.invalid}
            placeholder={placeholder}
            {...rest}
        />
    );
});
