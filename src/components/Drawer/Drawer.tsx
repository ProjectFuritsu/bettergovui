import {isSizePreset, toCssLength, type Size, type SizePreset} from "../../utils/size";
import {DialogBase, type DialogProps} from "../Dialog/DialogBase";

const DRAWER_SIZES: Record<SizePreset, string> = {xs: "16rem", sm: "20rem", md: "25rem", lg: "32rem", xl: "40rem"};

export type DrawerPosition = "left" | "right" | "top" | "bottom";

export interface DrawerProps extends DialogProps {
    /** Which edge it slides in from. Default "right". */
    position?: DrawerPosition;
    /**
     * Width (or height, for top and bottom): a preset (xs 256px, sm 320px, md 400px, lg 512px, xl 640px),
     * a number in pixels, or any CSS length. Never wider than the screen. Default "md".
     */
    size?: Size;
}

/**
 * A panel that slides in from an edge of the screen, e.g. for filters or a menu.
 * Control it with `open` and `onClose`.
 */
export function Drawer({position = "right", size = "md", ...props}: DrawerProps) {
    return (
        <DialogBase
            kind="drawer"
            position={position}
            size={isSizePreset(size) ? DRAWER_SIZES[size] : toCssLength(size)}
            {...props}
        />
    );
}
