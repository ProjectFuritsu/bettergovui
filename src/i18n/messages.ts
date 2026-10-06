/**
 * Every text the components show or say to screen readers on their own, in English, Filipino and
 * Bisaya (Cebuano). Texts you pass as props always win over these.
 *
 * The Filipino and Bisaya texts should be checked by native speakers before a site goes live.
 */
export interface Messages {
    /** Close buttons (Alert, Modal, Drawer, toasts) */
    close: string;
    /** Loader, for screen readers */
    loading: string;
    /** Code's copy button */
    copy: string;
    copied: string;
    /** Added for screen readers to links that open in a new tab */
    opensInNewTab: string;
    /** The name of the Breadcrumbs navigation */
    breadcrumb: string;
    pagination: {
        /** The name of the Pagination navigation */
        label: string;
        previous: string;
        next: string;
        first: string;
        last: string;
        page: (page: number) => string;
    };
    /** Added for screen readers to finished Stepper steps */
    stepCompleted: string;
    /** The name of the toast area */
    notifications: string;
    /** The name of the main navigation (Navbar, ScaffoldNavbar) */
    mainNavigation: string;
    /** The name of the footer's navigation (FooterBlock) */
    footerNavigation: string;
    /** The ☰ button */
    menu: string;
    closeMenu: string;
    skipToContent: string;
    /** Table with no rows */
    tableEmpty: string;
    fileUpload: {
        /** The link-colored part of the drop area, then the rest */
        chooseFile: string;
        chooseFiles: string;
        dragItHere: string;
        dragThemHere: string;
        /** Before the file name, on each remove button */
        remove: string;
        /** The name of the list of chosen files */
        chosenFiles: string;
        wrongType: (fileName: string) => string;
        tooLarge: (fileName: string, maxSize: string) => string;
        tooMany: (maxFiles: number) => string;
    };
    address: {
        legend: string;
        region: string;
        province: string;
        city: string;
        barangay: string;
        choose: string;
        loading: string;
        waiting: string;
        none: string;
        failed: string;
        retry: string;
    };
    mobile: {
        label: string;
        invalid: string;
    };
    peso: {
        belowMin: (amount: string) => string;
        aboveMax: (amount: string) => string;
    };
    blocks: {
        faqTitle: string;
        newsTitle: string;
        contactTitle: string;
        contactAddress: string;
        contactPhone: string;
        contactEmail: string;
        contactHours: string;
        mapTitle: string;
    };
}

export const en: Messages = {
    close: "Close",
    loading: "Loading",
    copy: "Copy",
    copied: "Copied",
    opensInNewTab: "(opens in a new tab)",
    breadcrumb: "Breadcrumb",
    pagination: {
        label: "Pagination",
        previous: "Previous page",
        next: "Next page",
        first: "First page",
        last: "Last page",
        page: page => `Page ${page}`,
    },
    stepCompleted: "completed",
    notifications: "Notifications",
    mainNavigation: "Main",
    footerNavigation: "Footer",
    menu: "Menu",
    closeMenu: "Close menu",
    skipToContent: "Skip to main content",
    tableEmpty: "Nothing to show yet.",
    fileUpload: {
        chooseFile: "Choose a file",
        chooseFiles: "Choose files",
        dragItHere: "or drag it here",
        dragThemHere: "or drag them here",
        remove: "Remove",
        chosenFiles: "Chosen files",
        wrongType: name => `${name} isn't an allowed type of file.`,
        tooLarge: (name, size) => `${name} is larger than ${size}.`,
        tooMany: max => `You can add up to ${max} ${max === 1 ? "file" : "files"}.`,
    },
    address: {
        legend: "Address",
        region: "Region",
        province: "Province",
        city: "City / Municipality",
        barangay: "Barangay",
        choose: "Choose…",
        loading: "Loading…",
        waiting: "Choose the one above first",
        none: "None in this region",
        failed: "Couldn't load the list. Check your internet connection.",
        retry: "Try again",
    },
    mobile: {
        label: "Mobile number",
        invalid: "Enter a mobile number like 917 123 4567.",
    },
    peso: {
        belowMin: amount => `Enter at least ₱${amount}.`,
        aboveMax: amount => `Enter no more than ₱${amount}.`,
    },
    blocks: {
        faqTitle: "Frequently asked questions",
        newsTitle: "Latest news",
        contactTitle: "Contact us",
        contactAddress: "Address",
        contactPhone: "Phone",
        contactEmail: "Email",
        contactHours: "Office hours",
        mapTitle: "Map of the office location",
    },
};

/** Filipino */
export const fil: Messages = {
    close: "Isara",
    loading: "Naglo-load",
    copy: "Kopyahin",
    copied: "Nakopya na",
    opensInNewTab: "(magbubukas sa bagong tab)",
    breadcrumb: "Kinaroroonan",
    pagination: {
        label: "Mga pahina",
        previous: "Nakaraang pahina",
        next: "Susunod na pahina",
        first: "Unang pahina",
        last: "Huling pahina",
        page: page => `Pahina ${page}`,
    },
    stepCompleted: "tapos na",
    notifications: "Mga abiso",
    mainNavigation: "Pangunahin",
    footerNavigation: "Ibabang bahagi",
    menu: "Menu",
    closeMenu: "Isara ang menu",
    skipToContent: "Lumaktaw sa pangunahing nilalaman",
    tableEmpty: "Wala pang maipapakita.",
    fileUpload: {
        chooseFile: "Pumili ng file",
        chooseFiles: "Pumili ng mga file",
        dragItHere: "o i-drag ito rito",
        dragThemHere: "o i-drag ang mga ito rito",
        remove: "Alisin",
        chosenFiles: "Mga napiling file",
        wrongType: name => `Hindi pinapayagan ang ganitong uri ng file: ${name}.`,
        tooLarge: (name, size) => `Lampas sa ${size} ang ${name}.`,
        tooMany: max => `Hanggang ${max} file lang ang maaaring idagdag.`,
    },
    address: {
        legend: "Tirahan",
        region: "Rehiyon",
        province: "Lalawigan",
        city: "Lungsod / Bayan",
        barangay: "Barangay",
        choose: "Pumili…",
        loading: "Naglo-load…",
        waiting: "Pumili muna sa itaas",
        none: "Wala sa rehiyong ito",
        failed: "Hindi ma-load ang listahan. Tingnan ang iyong koneksyon sa internet.",
        retry: "Subukang muli",
    },
    mobile: {
        label: "Numero ng mobile",
        invalid: "Maglagay ng numero ng mobile tulad ng 917 123 4567.",
    },
    peso: {
        belowMin: amount => `Maglagay ng hindi bababa sa ₱${amount}.`,
        aboveMax: amount => `Maglagay ng hindi hihigit sa ₱${amount}.`,
    },
    blocks: {
        faqTitle: "Mga madalas itanong",
        newsTitle: "Pinakabagong balita",
        contactTitle: "Makipag-ugnayan sa amin",
        contactAddress: "Lokasyon",
        contactPhone: "Telepono",
        contactEmail: "Email",
        contactHours: "Oras ng opisina",
        mapTitle: "Mapa ng lokasyon ng opisina",
    },
};

/** Bisaya (Cebuano) */
export const ceb: Messages = {
    close: "Isira",
    loading: "Naga-load",
    copy: "Kopyaha",
    copied: "Nakopya na",
    opensInNewTab: "(moabli sa bag-ong tab)",
    breadcrumb: "Nahimutangan",
    pagination: {
        label: "Mga panid",
        previous: "Miaging panid",
        next: "Sunod nga panid",
        first: "Unang panid",
        last: "Katapusang panid",
        page: page => `Panid ${page}`,
    },
    stepCompleted: "nahuman na",
    notifications: "Mga pahibalo",
    mainNavigation: "Panguna",
    footerNavigation: "Ubos nga bahin",
    menu: "Menu",
    closeMenu: "Isira ang menu",
    skipToContent: "Laktaw ngadto sa panguna nga sulod",
    tableEmpty: "Wala pay ikapakita.",
    fileUpload: {
        chooseFile: "Pagpili og file",
        chooseFiles: "Pagpili og mga file",
        dragItHere: "o i-drag kini dinhi",
        dragThemHere: "o i-drag sila dinhi",
        remove: "Tangtanga",
        chosenFiles: "Mga napili nga file",
        wrongType: name => `Dili gitugotan kini nga klase sa file: ${name}.`,
        tooLarge: (name, size) => `Labaw sa ${size} ang ${name}.`,
        tooMany: max => `Hangtod ${max} ka file lang ang madugang.`,
    },
    address: {
        legend: "Address",
        region: "Rehiyon",
        province: "Probinsya",
        city: "Siyudad / Lungsod",
        barangay: "Barangay",
        choose: "Pagpili…",
        loading: "Naga-load…",
        waiting: "Pagpili una sa ibabaw",
        none: "Wala niining rehiyon",
        failed: "Dili ma-load ang listahan. Susiha ang imong koneksyon sa internet.",
        retry: "Sulayi pag-usab",
    },
    mobile: {
        label: "Numero sa mobile",
        invalid: "Isulod ang numero sa mobile sama sa 917 123 4567.",
    },
    peso: {
        belowMin: amount => `Isulod ang dili moubos sa ₱${amount}.`,
        aboveMax: amount => `Isulod ang dili molapas sa ₱${amount}.`,
    },
    blocks: {
        faqTitle: "Kanunay nga pangutana",
        newsTitle: "Pinakabag-ong balita",
        contactTitle: "Kontaka mi",
        contactAddress: "Lokasyon",
        contactPhone: "Telepono",
        contactEmail: "Email",
        contactHours: "Oras sa opisina",
        mapTitle: "Mapa sa lokasyon sa opisina",
    },
};
