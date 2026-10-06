import type {HTMLAttributes} from "react";
import {cx} from "../../utils/cx";
import styles from "./Kbd.module.css";

/** A keyboard key, e.g. <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>. */
export function Kbd({className, ...rest}: HTMLAttributes<HTMLElement>) {
    return <kbd className={cx(styles.kbd, className)} {...rest} />;
}
