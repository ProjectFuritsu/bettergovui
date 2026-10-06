import {isValidElement, useId, useRef, type ComponentType, type HTMLAttributes, type ReactElement, type ReactNode} from "react";
import {cx} from "../../utils/cx";
import {useMessages} from "../../i18n/LanguageProvider";
import {ContactBlock, type ContactBlockProps} from "../ContactBlock/ContactBlock";
import {CtaBlock, type CtaBlockProps} from "../CtaBlock/CtaBlock";
import {FaqBlock, type FaqBlockProps} from "../FaqBlock/FaqBlock";
import {FeaturesBlock, type FeaturesBlockProps} from "../FeaturesBlock/FeaturesBlock";
import {FooterBlock, type FooterBlockProps} from "../FooterBlock/FooterBlock";
import {HeaderBlock, type HeaderBlockProps} from "../HeaderBlock/HeaderBlock";
import {HeroBlock, type HeroBlockProps} from "../HeroBlock/HeroBlock";
import {NewsBlock, type NewsBlockProps} from "../NewsBlock/NewsBlock";
import {StatsBlock, type StatsBlockProps} from "../StatsBlock/StatsBlock";
import styles from "./LandingPage.module.css";

/** A section of the page: that block's props, your own element instead, or leave it out (or `false`) to skip it. */
export type LandingPageSection<Props> = Props | ReactElement | false;

export interface LandingPageProps extends HTMLAttributes<HTMLDivElement> {
    header?: LandingPageSection<HeaderBlockProps>;
    hero?: LandingPageSection<Omit<HeroBlockProps, "header" | "footer">>;
    stats?: LandingPageSection<StatsBlockProps>;
    features?: LandingPageSection<FeaturesBlockProps>;
    news?: LandingPageSection<NewsBlockProps>;
    faq?: LandingPageSection<FaqBlockProps>;
    contact?: LandingPageSection<ContactBlockProps>;
    cta?: LandingPageSection<CtaBlockProps>;
    footer?: LandingPageSection<FooterBlockProps>;
    /** Your own sections. They go just before the closing call-to-action banner. */
    children?: ReactNode;
    /**
     * The text of the "skip to main content" link, the first thing keyboard users reach. It only shows
     * when focused. `false` leaves it out. Default "Skip to main content".
     */
    skipLinkLabel?: string | false;
}

// Props -> that block; an element -> as it is; nothing or false -> skipped
function renderSection<Props extends object>(section: LandingPageSection<Props> | undefined, Block: ComponentType<Props>) {
    if (!section) return null;
    if (isValidElement(section)) return section;
    return <Block {...(section as Props)} />;
}

/**
 * A whole landing page from the blocks, in the usual order: header, hero, stats, features, news,
 * FAQ, contact, call to action, footer. Pass the props of the sections you want; leave the rest out.
 * It adds what a page needs around them: a skip link, and the `<main>` landmark around the content.
 */
export function LandingPage({
    header,
    hero,
    stats,
    features,
    news,
    faq,
    contact,
    cta,
    footer,
    children,
    skipLinkLabel,
    className,
    ...rest
}: LandingPageProps) {
    const t = useMessages();
    const skipText = skipLinkLabel ?? t.skipToContent;
    const mainId = useId();
    const mainRef = useRef<HTMLElement>(null);

    return (
        <div className={cx(styles.page, className)} {...rest}>
            {skipText !== false && (
                <a
                    href={`#${mainId}`}
                    className={styles.skipLink}
                    onClick={event => {
                        // Move focus without adding "#…" to the address, which can confuse routers
                        if (!mainRef.current) return;
                        event.preventDefault();
                        mainRef.current.focus();
                    }}>
                    {skipText}
                </a>
            )}
            {renderSection(header, HeaderBlock)}
            <main ref={mainRef} id={mainId} tabIndex={-1} className={styles.main}>
                {renderSection(hero, HeroBlock)}
                {renderSection(stats, StatsBlock)}
                {renderSection(features, FeaturesBlock)}
                {renderSection(news, NewsBlock)}
                {renderSection(faq, FaqBlock)}
                {renderSection(contact, ContactBlock)}
                {children}
                {renderSection(cta, CtaBlock)}
            </main>
            {renderSection(footer, FooterBlock)}
        </div>
    );
}
