import {useCallback, useEffect, useLayoutEffect, useRef, useState, type HTMLAttributes, type ReactNode} from "react";
import {dateLocale, useLanguage, useMessages} from "../../i18n/LanguageProvider";
import {cx} from "../../utils/cx";
import styles from "./StatusChecker.module.css";

/**
 * - "online" / "slow": it answered (slow: after `slowAfter`)
 * - "offline": it's known to be down (a strict or custom check failed)
 * - "unreachable": the browser got no answer it can use. The site may be down, or it may block checks from
 *   other sites (many sites behind Cloudflare do, e.g. GOV.PH). Use serverCheck to know for sure.
 * - "no-connection": the visitor's own internet is off
 * - "checking": only on the first check; later checks keep the last result on screen until they finish
 */
export type SiteStatus = "checking" | "online" | "slow" | "offline" | "unreachable" | "no-connection";

export interface StatusCheckDetails {
    /** How long the site took to answer, in milliseconds (when it answered). */
    responseTime?: number;
    checkedAt: Date;
}

export interface StatusCheckerProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
    /** The address to check, e.g. "https://www.gov.ph" or a health address like "/api/health". */
    url: string;
    /** The site's name, e.g. "Business permit portal". Default: the address's host name. */
    label?: ReactNode;
    /** Check again every this many seconds. 0 checks once. Default 60. */
    interval?: number;
    /** Count the site as offline when it takes longer than this many seconds. Default 10. */
    timeout?: number;
    /** Count the site as slow when it takes longer than this many milliseconds. Default 3000. */
    slowAfter?: number;
    /**
     * Online only when the site answers with success (200–299). This needs an address on your own site, or a
     * server that allows other sites to read its answers (CORS). Without it, any answer counts as online,
     * because browsers hide other sites' answers. Default: on for your own site, off for others.
     */
    strict?: boolean;
    /** Your own check instead, e.g. `serverCheck("/api/site-status")`. Resolve true for online, false for offline. */
    check?: (url: string, signal: AbortSignal) => Promise<boolean>;
    /** Called when the status changes. */
    onStatusChange?: (status: SiteStatus, details: StatusCheckDetails) => void;
    /** "card" (default): name, address, status, response time and a "Check again" button. "badge": a small pill. */
    variant?: "card" | "badge";
}

// Whether the browser can read the site's answer: on your own site, or with strict (needs CORS)
function isReadable(url: string, strict: boolean | undefined) {
    return strict ?? new URL(url, window.location.href).origin === window.location.origin;
}

async function defaultCheck(url: string, signal: AbortSignal, strict: boolean | undefined) {
    const target = new URL(url, window.location.href);
    const readable = isReadable(url, strict);
    // Readable: ask for the answer and look at its status. Otherwise a light HEAD request whose answer the
    // browser hides ("opaque"): it arriving at all means the server is up. A failure means it isn't.
    const response = await fetch(target, {
        method: readable ? "GET" : "HEAD",
        mode: readable ? "cors" : "no-cors",
        cache: "no-store",
        credentials: "omit",
        signal,
    });
    return readable ? response.ok : true;
}

/** Shows whether a website is up: Online, Slow or Offline, with how fast it answered. Checks again on its own. */
export function StatusChecker({
    url,
    label,
    interval = 60,
    timeout = 10,
    slowAfter = 3000,
    strict,
    check,
    onStatusChange,
    variant = "card",
    className,
    ...rest
}: StatusCheckerProps) {
    const t = useMessages();
    const language = useLanguage();
    const [status, setStatus] = useState<SiteStatus>("checking");
    const [details, setDetails] = useState<StatusCheckDetails | null>(null);
    const [busy, setBusy] = useState(false);
    const running = useRef<AbortController | null>(null);
    const lastCheck = useRef(0);

    // The latest options, so the check below doesn't have to restart the timer when they change
    const latest = useRef({check, strict, timeout, slowAfter, onStatusChange});
    useLayoutEffect(() => {
        latest.current = {check, strict, timeout, slowAfter, onStatusChange};
    });

    const runCheck = useCallback(async () => {
        running.current?.abort();
        const controller = new AbortController();
        running.current = controller;
        const {check: customCheck, strict: isStrict, timeout: seconds, slowAfter: slowMs} = latest.current;
        const report = (next: SiteStatus, info: StatusCheckDetails) => {
            setStatus(next);
            setDetails(info);
            latest.current.onStatusChange?.(next, info);
        };

        lastCheck.current = Date.now();
        // Can't reach anything without internet: say so instead of blaming the site
        if (!navigator.onLine) {
            report("no-connection", {checkedAt: new Date()});
            return;
        }

        setBusy(true);
        const timer = window.setTimeout(() => controller.abort(), seconds * 1000);
        const started = performance.now();
        let up = false;
        try {
            up = await (customCheck ? customCheck(url, controller.signal) : defaultCheck(url, controller.signal, isStrict));
        } catch {
            up = false;
        }
        window.clearTimeout(timer);
        // A newer check replaced this one, or the component is gone
        if (running.current !== controller) return;
        const responseTime = Math.round(performance.now() - started);
        setBusy(false);
        // A failed check of another site that hides its answers can't tell "down" from "blocks checks"
        let readable = true;
        try {
            readable = Boolean(customCheck) || isReadable(url, isStrict);
        } catch {
            // Not a valid address: it can't be reached either way
        }
        report(up ? (responseTime > slowMs ? "slow" : "online") : readable ? "offline" : "unreachable", {
            responseTime: up ? responseTime : undefined,
            checkedAt: new Date(),
        });
    }, [url]);

    useEffect(() => {
        runCheck();
        const repeat = interval > 0 ? interval * 1000 : 0;
        // Check on a timer, but not while the tab is hidden (saves mobile data); catch up when it's shown again
        const timer = repeat ? window.setInterval(() => !document.hidden && runCheck(), repeat) : undefined;
        const onVisible = () => repeat && !document.hidden && Date.now() - lastCheck.current >= repeat && runCheck();
        const onOnline = () => runCheck();
        const onOffline = () => {
            running.current?.abort();
            running.current = null;
            setBusy(false);
            setStatus("no-connection");
        };
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        return () => {
            window.clearInterval(timer);
            document.removeEventListener("visibilitychange", onVisible);
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
            running.current?.abort();
            running.current = null;
        };
    }, [runCheck, interval]);

    let host = url;
    try {
        host = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.href).host;
    } catch {
        // Not a full address; show it as it is
    }
    const name = label ?? host;
    const statusText = t.siteStatus[status === "no-connection" ? "noConnection" : status];
    const time = details?.checkedAt.toLocaleTimeString(dateLocale(language), {hour: "numeric", minute: "2-digit"});

    // The status is a live region: screen readers hear it when it changes (not on every check, since the
    // text only changes when the status does), with the site's name, e.g. "Business permit portal: Online"
    const pill = (
        <span className={styles.pill} data-status={status} role="status">
            <span className={styles.srOnly}>{name}: </span>
            <span className={styles.dot} aria-hidden="true" />
            {statusText}
        </span>
    );

    if (variant === "badge") {
        return (
            <div className={cx(styles.badge, className)} aria-busy={busy || undefined} {...rest}>
                <span className={styles.badgeName}>{name}</span>
                {pill}
            </div>
        );
    }

    return (
        <div className={cx(styles.card, className)} aria-busy={busy || undefined} {...rest}>
            <div className={styles.main}>
                <span className={styles.name}>{name}</span>
                {label !== undefined && <span className={styles.host}>{host}</span>}
            </div>
            <div className={styles.side}>
                {pill}
                {details && (
                    <span className={styles.meta}>
                        {details.responseTime !== undefined && `${details.responseTime} ms · `}
                        {t.siteStatus.checkedAt(time ?? "")}
                    </span>
                )}
            </div>
            <button type="button" className={styles.recheck} onClick={() => runCheck()} disabled={busy}>
                <svg viewBox="0 0 24 24" aria-hidden="true" data-spinning={busy || undefined}>
                    <path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />
                </svg>
                {t.siteStatus.recheck}
            </button>
        </div>
    );
}

/**
 * A check that asks your own server whether the site is up. Servers aren't bound by the browser's rules about
 * other sites, so this is the reliable way to check any website. Your endpoint gets `?url=…` and answers
 * JSON like `{ "online": true }`. Only let it check addresses on an allow-list (see the README).
 */
export function serverCheck(endpoint: string) {
    return async (url: string, signal: AbortSignal) => {
        const address = new URL(endpoint, window.location.href);
        address.searchParams.set("url", url);
        const response = await fetch(address, {cache: "no-store", signal});
        if (!response.ok) throw new Error(`Status check failed (${response.status})`);
        const result = (await response.json()) as {online?: boolean};
        return result.online === true;
    };
}
