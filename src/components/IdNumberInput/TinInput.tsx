import {forwardRef} from "react";
import {useMessages} from "../../i18n/LanguageProvider";
import {GroupedNumberInput, type GroupedNumberInputProps} from "./GroupedNumberInput";

export interface TinInputProps extends Omit<GroupedNumberInputProps, "groups" | "separator" | "validLengths" | "onValueChange"> {
    /**
     * Also ask for the branch code after the 9 digits: 3 digits on older BIR forms, 5 on newer ones
     * ("000" or "00000" for a head office or an individual). Off by default; most people only know their 9 digits.
     */
    branchCode?: boolean;
    /** Called as the number changes: all the digits, plus the 9-digit TIN and the branch code split out. */
    onValueChange?: (digits: string, details: {complete: boolean; tin: string; branch: string}) => void;
}

/**
 * A BIR Tax Identification Number, shown as 123-456-789 (or 123-456-789-00000 with `branchCode`).
 * With `name`, the form sends the digits (no dashes).
 */
export const TinInput = forwardRef<HTMLInputElement, TinInputProps>(function TinInput(
    {branchCode = false, label, invalidMessage, placeholder, onValueChange, ...rest},
    ref,
) {
    const t = useMessages();
    return (
        <GroupedNumberInput
            ref={ref}
            groups={branchCode ? [3, 3, 3, 5] : [3, 3, 3]}
            validLengths={branchCode ? [12, 14] : [9]}
            label={label ?? t.tin.label}
            invalidMessage={invalidMessage ?? (branchCode ? t.tin.invalidWithBranch : t.tin.invalid)}
            placeholder={placeholder ?? (branchCode ? "123-456-789-00000" : "123-456-789")}
            onValueChange={(digits, {complete}) => onValueChange?.(digits, {complete, tin: digits.slice(0, 9), branch: digits.slice(9)})}
            {...rest}
        />
    );
});
