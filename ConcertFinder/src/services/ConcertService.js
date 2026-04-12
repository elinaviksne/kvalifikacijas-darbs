const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const BILESU_API = "https://www.bilesuparadize.lv/api";
const BILESU_VENUE_IDS = [54, 720];

/** Ticketmaster žanru meklējumiem — vairāk ierakstu vienā atbildē (Discovery API `size`). */
const GENRE_TICKETMASTER_PAGE_SIZE = 40;

/** Īslaicīgs kešs, lai žanru un sākumlapas pieprasījumi neatkārtotu to pašu venue /repertoire. */
const BILESU_REPERTOIRE_TTL_MS = 5 * 60 * 1000;
const bilesuRepertoireCache = new Map();

export function clearBilesuRepertoireCache() {
    bilesuRepertoireCache.clear();
}

async function fetchBilesuVenueRepertoire(venueId) {
    const now = Date.now();
    const hit = bilesuRepertoireCache.get(venueId);
    if (hit && now - hit.ts < BILESU_REPERTOIRE_TTL_MS) {
        return hit.data;
    }
    const r = await fetch(`${BILESU_API}/venue/${venueId}/repertoire`);
    if (!r.ok) {
        return [];
    }
    const data = await r.json();
    const list = Array.isArray(data) ? data : [];
    bilesuRepertoireCache.set(venueId, { data: list, ts: now });
    return list;
}

/** Vietas žanru pārlūkam — plašāks Rīgas kultūras norišu loks. */
const BILESU_GENRE_VENUE_IDS = [
    54, 720, 11, 28, 67, 10, 1927, 38, 2267, 1159, 360, 1589, 701,
];

const GENRE_MATCHERS = {
    rock: [/rock/i, /punk/i, /indie/i, /grunge/i, /alternative/i],
    pop: [/pop/i, /disco/i],
    hiphop: [
        /hip[\s-]?hop/i,
        /\brap\b/i,
        /\btrap\b/i,
        /hiphop/i,
        /\bdrill\b/i,
        /\br\s*&\s*b\b/i,
        /\brnb\b/i,
        /\br&b\b/i,
        /рэп/i,
        /\brepa\b/i,
    ],
    jazz: [/jazz/i],
    metal: [/metal/i, /heavy\s*metal/i],
    country: [/country/i, /bluegrass/i],
    edm: [
        /electronic/i,
        /\bedm\b/i,
        /techno/i,
        /\bhouse\b/i,
        /trance/i,
        /dubstep/i,
        /\belectro\b/i,
        /\bdnb\b/i,
        /drum\s*(?:&|and)\s*bass/i,
        /\bjungle\b/i,
        /breakbeat/i,
        /hardstyle/i,
        /ambient/i,
        /\buk\s*garage\b/i,
    ],
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

/**
 * Ticketmaster atslēgvārdi pēc žanra — labāka atbilstība nekā viens UI etiķetes vārds (piem., „EDM” → electronic).
 */
const GENRE_ID_TO_TICKETMASTER_KEYWORDS = {
    rock: ["rock", "alternative rock", "indie rock"],
    pop: ["pop", "dance pop"],
    hiphop: ["hip hop", "rap", "hiphop"],
    jazz: ["jazz"],
    metal: ["metal", "heavy metal"],
    country: ["country", "country music"],
    folk: ["folk", "world music"],
    edm: ["electronic", "edm", "techno"],
    classical: ["classical", "orchestra", "symphony"],
    opera: ["opera", "operetta"],
    schlager: ["schlager", "volksmusik", "traditional pop"],
    blues: ["blues", "rhythm and blues"],
    gospel: ["gospel", "spiritual", "choir"],
};

export function ticketmasterKeywordsForGenreId(genreId, displayLabelFallback = "music") {
    if (genreId && GENRE_ID_TO_TICKETMASTER_KEYWORDS[genreId]?.length) {
        return GENRE_ID_TO_TICKETMASTER_KEYWORDS[genreId];
    }
    const label = typeof displayLabelFallback === "string" && displayLabelFallback.trim()
        ? displayLabelFallback.trim()
        : "music";
    return [label];
}

function mergeTicketmasterEventsById(batches) {
    const seen = new Set();
    const out = [];
    for (const batch of batches) {
        if (!Array.isArray(batch)) continue;
        for (const e of batch) {
            if (!e?.id || seen.has(e.id)) continue;
            seen.add(e.id);
            out.push(e);
        }
    }
    out.sort((a, b) => (a.date || "").localeCompare(b.date || ""));
    return out;
}

/**
 * Vairāki TM meklējumi pēc žanram — Baltijas valstis + Rīga + tikai atslēgvārds (globāla meklēšana),
 * lai retiem žanriem būtu rezultāti, ne tikai LV. Nav GPS.
 * `geoModes` var pārrakstīt testiem.
 */
export async function fetchTicketmasterGenreConcerts(
    genreId,
    displayLabel,
    {
        geoModes: geoModesOverride,
        cityFallback = "Riga",
        countryCode = "LV",
    } = {}
) {
    const keywords = ticketmasterKeywordsForGenreId(genreId, displayLabel);
    const geoModes = geoModesOverride ?? [
        { countryCode },
        { city: cityFallback, countryCode },
        { countryCode: "EE" },
        { countryCode: "LT" },
        {},
    ];

    const tasks = [];
    for (const geo of geoModes) {
        for (const keyword of keywords) {
            tasks.push(
                fetchConcerts({
                    keyword,
                    ...geo,
                    size: GENRE_TICKETMASTER_PAGE_SIZE,
                })
            );
        }
    }

    try {
        const batches = await Promise.all(tasks);
        return mergeTicketmasterEventsById(batches);
    } catch (error) {
        console.error("Error fetching Ticketmaster genre concerts:", error);
        return [];
    }
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
    { venueIds = BILESU_GENRE_VENUE_IDS, maxTotal = 60, onPartial } = {}
) {
    if (!genreId || !GENRE_MATCHERS[genreId]) return [];

    try {
        const seen = new Set();
        const matched = [];

        const ingestList = (list) => {
            if (!Array.isArray(list)) return false;
            for (const e of list) {
                if (!e?.id || seen.has(e.id)) continue;
                seen.add(e.id);
                if (!bilesuEventMatchesGenre(e, genreId)) continue;
                matched.push({ ...e, id: `bp-${e.id}` });
                if (matched.length >= maxTotal) return true;
            }
            return false;
        };

        const emitPartial = () => {
            if (!onPartial) return;
            const copy = [...matched].sort((a, b) =>
                (a.dateTime || "").localeCompare(b.dateTime || "")
            );
            onPartial(copy);
        };

        await Promise.all(
            venueIds.map((id) =>
                fetchBilesuVenueRepertoire(id).then((list) => {
                    if (ingestList(list)) {
                        emitPartial();
                        return;
                    }
                    emitPartial();
                })
            )
        );

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
        const lists = await Promise.all(venueIds.map((id) => fetchBilesuVenueRepertoire(id)));
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
 * Ticketmaster Discovery API — notikumu meklēšana pēc atslēgvārda un (pēc izvēles) pilsētas, valsts koda vai koordinātām.
 * Atgriež vienotu masīvu kartītēm: id, name, date, venue, url, image.
 */
export async function fetchConcerts({
    keyword = "rock",
    city,
    latlong,
    radius = 250,
    countryCode,
    size,
} = {}) {
    try {
        let url = `${BASE_URL}?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}`;

        if (city) {
            url += `&city=${encodeURIComponent(city)}`;
        } else if (latlong) {
            url += `&latlong=${latlong.latitude},${latlong.longitude}&radius=${radius}`;
        }
        if (countryCode) {
            url += `&countryCode=${encodeURIComponent(countryCode)}`;
        }
        if (size != null && Number.isFinite(size) && size > 0) {
            const capped = Math.min(Math.floor(size), 200);
            url += `&size=${capped}`;
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
