import {isSizePreset, toCssLength, type Size, type SizePreset} from "../../utils/size";
import {DialogBase, type DialogProps} from "../Dialog/DialogBase";

const MODAL_WIDTHS: Record<SizePreset, string> = {xs: "20rem", sm: "25rem", md: "32rem", lg: "40rem", xl: "50rem"};

export interface ModalProps extends DialogProps {
    /** Width: a preset (xs 320px, sm 400px, md 512px, lg 640px, xl 800px), a number in pixels, or any CSS length. Default "md". */
    size?: Size;
}

/**
 * A box in the middle of the screen that the user has to deal with before going back to the page,
 * e.g. "Submit your application?". Control it with `open` and `onClose`.
 */
export function Modal({size = "md", ...props}: ModalProps) {
    return <DialogBase kind="modal" size={isSizePreset(size) ? MODAL_WIDTHS[size] : toCssLength(size)} {...props} />;
}
