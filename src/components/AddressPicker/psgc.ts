/** A place in the Philippine Standard Geographic Code (PSGC): its official code and its name. */
export interface AddressPlace {
    /** The PSGC code, e.g. "112402000" for the City of Davao. Save this; names can change. */
    code: string;
    name: string;
}

/**
 * Where AddressPicker gets its lists. Use `psgcApi()` (the default), point it at your own copy of the
 * data, or write your own, e.g. one that reads a JSON file for just your region.
 */
export interface AddressDataSource {
    regions(): Promise<AddressPlace[]>;
    /** A region's provinces. An empty list means the region has none (Metro Manila). */
    provinces(regionCode: string): Promise<AddressPlace[]>;
    /** A province's cities and municipalities, or a whole region's when it has no provinces. */
    cities(parent: {regionCode: string; provinceCode?: string}): Promise<AddressPlace[]>;
    barangays(cityCode: string): Promise<AddressPlace[]>;
}

interface PsgcItem {
    code: string;
    name: string;
    regionName?: string;
}

// "City of Davao" is sorted under D, where people look for it
const sortKey = (name: string) => name.replace(/^City of /i, "");

const byName = (items: PsgcItem[]): AddressPlace[] =>
    items
        .map(({code, name}) => ({code, name}))
        .sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name), "en", {numeric: true, sensitivity: "base"}));

/**
 * Loads the lists from a PSGC API: the free public one at psgc.gitlab.io by default, or your own copy
 * with the same paths (`/regions/`, `/regions/{code}/provinces/`, …), so your site doesn't depend on theirs.
 * Each list is fetched once and remembered.
 */
export function psgcApi(baseUrl = "https://psgc.gitlab.io/api"): AddressDataSource {
    const cache = new Map<string, Promise<PsgcItem[]>>();

    function get(path: string) {
        const url = `${baseUrl.replace(/\/$/, "")}${path}`;
        let request = cache.get(url);
        if (!request) {
            request = fetch(url).then(response => {
                if (!response.ok) throw new Error(`Couldn't load ${url} (${response.status})`);
                return response.json() as Promise<PsgcItem[]>;
            });
            // Forget failures, so "Try again" really tries again
            request.catch(() => cache.delete(url));
            cache.set(url, request);
        }
        return request;
    }

    return {
        // Kept in the official order (Region I, II, III…), shown as "Davao Region (Region XI)"
        regions: () =>
            get("/regions/").then(items =>
                items.map(({code, name, regionName}) => ({
                    code,
                    name: regionName && regionName !== name ? `${name} (${regionName})` : name,
                })),
            ),
        provinces: regionCode => get(`/regions/${regionCode}/provinces/`).then(byName),
        cities: ({regionCode, provinceCode}) =>
            get(provinceCode ? `/provinces/${provinceCode}/cities-municipalities/` : `/regions/${regionCode}/cities-municipalities/`).then(byName),
        barangays: cityCode => get(`/cities-municipalities/${cityCode}/barangays/`).then(byName),
    };
}
