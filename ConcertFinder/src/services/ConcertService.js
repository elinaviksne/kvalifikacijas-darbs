const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

const BILESU_API = "https://www.bilesuparadize.lv/api";
const BILESU_VENUE_IDS = [54, 720];

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
