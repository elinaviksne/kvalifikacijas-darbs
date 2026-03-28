const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const BILESU_API = "https://www.bilesuparadize.lv/api";
const BILESU_VENUE_IDS = [54, 720];

/** Vietas žanru pārlūkam — plašāks Rīgas kultūras norišu loks. */
const BILESU_GENRE_VENUE_IDS = [
    54, 720, 11, 28, 67, 10, 1927, 38, 2267, 1159, 360, 1589, 701,
];

const GENRE_MATCHERS = {
    rock: [/rock/i, /punk/i, /indie/i, /grunge/i, /alternative/i],
    pop: [/pop/i, /disco/i],
    hiphop: [/hip[\s-]?hop/i, /\brap\b/i, /\btrap\b/i, /hiphop/i],
    jazz: [/jazz/i],
    metal: [/metal/i, /heavy\s*metal/i],
    country: [/country/i, /bluegrass/i],
    edm: [/electronic/i, /\bedm\b/i, /techno/i, /\bhouse\b/i, /trance/i, /dubstep/i],
    classical: [
        /classic\s+music/i,
        /chamber/i,
        /choir/i,
        /\borgan\b/i,
        /symphon/i,
        /orchestra/i,
        /\bballet\b/i,
        /vocal\s+music/i,
    ],
    folk: [/\bfolk\b/i, /tautas/i, /ethnic/i],
    opera: [/\bopera\b/i, /operett/i, /ballet/i],
    schlager: [/schlager/i],
    blues: [/blues/i],
    gospel: [/gospel/i, /spiritual/i, /sacred/i],
};

const GENRE_LABEL_TO_ID = {
    Rock: "rock",
    Pop: "pop",
    "Hip-Hop": "hiphop",
    Jazz: "jazz",
    Metal: "metal",
    Country: "country",
    EDM: "edm",
    Classical: "classical",
    Folk: "folk",
    Opera: "opera",
    Schlager: "schlager",
    Blues: "blues",
    Gospel: "gospel",
};

export function genreIdFromLabel(label) {
    if (!label || typeof label !== "string") return null;
    return GENRE_LABEL_TO_ID[label] ?? null;
}

function bilesuCategoryAndTitleText(event) {
    const parts = [];
    const p = event.performance;
    if (p?.categories?.length) {
        for (const c of p.categories) {
            if (c.en) parts.push(c.en);
            if (c.lv) parts.push(c.lv);
            if (c.ru) parts.push(c.ru);
        }
    }
    if (p?.titles) {
        if (p.titles.en) parts.push(p.titles.en);
        if (p.titles.lv) parts.push(p.titles.lv);
        if (p.titles.ru) parts.push(p.titles.ru);
    }
    return parts.join(" \n ");
}

export function bilesuEventMatchesGenre(event, genreId) {
    const matchers = GENRE_MATCHERS[genreId];
    if (!matchers?.length) return false;
    const haystack = bilesuCategoryAndTitleText(event);
    return matchers.some((re) => re.test(haystack));
}

/**
 * Žanru režīms: vairāku vietu repertuāri, filtrē pēc kategorijām un nosaukuma (nav atsevišķa „žanru” API).
 */
export async function fetchBilesuParadizeForGenre(
    genreId,
    { venueIds = BILESU_GENRE_VENUE_IDS, maxTotal = 60 } = {}
) {
    if (!genreId || !GENRE_MATCHERS[genreId]) return [];

    try {
        const lists = await Promise.all(
            venueIds.map((id) =>
                fetch(`${BILESU_API}/venue/${id}/repertoire`).then((r) => (r.ok ? r.json() : []))
            )
        );
        const seen = new Set();
        const matched = [];
        for (const list of lists) {
            if (!Array.isArray(list)) continue;
            for (const e of list) {
                if (!e?.id || seen.has(e.id)) continue;
                seen.add(e.id);
                if (!bilesuEventMatchesGenre(e, genreId)) continue;
                matched.push({ ...e, id: `bp-${e.id}` });
                if (matched.length >= maxTotal) {
                    matched.sort((a, b) => (a.dateTime || "").localeCompare(b.dateTime || ""));
                    return matched;
                }
            }
        }
        matched.sort((a, b) => (a.dateTime || "").localeCompare(b.dateTime || ""));
        return matched;
    } catch (error) {
        console.error("Error fetching Biļešu Paradīze genre repertoire:", error);
        return [];
    }
}

/**
 * Biļešu Paradīzes publiskais API: norises vietu repertuārs.
 * Katram ierakstam id ir prefikss `bp-`, lai nesaplūstu ar Ticketmaster id FlatList atslēgām.
 */
export async function fetchBilesuParadizeConcerts({ venueIds = BILESU_VENUE_IDS, maxTotal = 24 } = {}) {
    try {
        const lists = await Promise.all(
            venueIds.map((id) =>
                fetch(`${BILESU_API}/venue/${id}/repertoire`).then((r) => (r.ok ? r.json() : []))
            )
        );
        const seen = new Set();
        const out = [];
        for (const list of lists) {
            if (!Array.isArray(list)) continue;
            for (const e of list) {
                if (!e?.id || seen.has(e.id)) continue;
                seen.add(e.id);
                out.push({ ...e, id: `bp-${e.id}` });
                if (out.length >= maxTotal) return out;
            }
        }
        return out;
    } catch (error) {
        console.error("Error fetching Biļešu Paradīze repertoire:", error);
        return [];
    }
}

/**
 * Ticketmaster Discovery API — notikumu meklēšana pēc atslēgvārda un (pēc izvēles) pilsētas vai koordinātām.
 * Atgriež vienotu masīvu kartītēm: id, name, date, venue, url, image.
 */
export async function fetchConcerts({ keyword = "rock", city, latlong, radius = 250 } = {}) {
    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&keyword=${keyword}`;

        if (city) {
            url += `&city=${encodeURIComponent(city)}`;
        } else if (latlong) {
            url += `&latlong=${latlong.latitude},${latlong.longitude}&radius=${radius}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (!data._embedded?.events) return [];

        return data._embedded.events
            .filter(event =>
                event.id &&
                event.name &&
                event.dates?.start?.localDate &&
                event._embedded?.venues?.[0]?.name &&
                event.url &&
                event.images?.length
            )
            .map(event => ({
                id: event.id,
                name: event.name,
                date: event.dates.start.localDate,
                venue: event._embedded.venues[0].name,
                url: event.url,
                image: event.images[0].url,
            }));
    } catch (error) {
        console.error("Error fetching concerts:", error);
        return [];
    }
}
