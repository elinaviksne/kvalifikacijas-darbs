const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

export async function fetchConcerts({ keyword = "rock", city, latlong } = {}) {
    try {
        const urlParams = new URLSearchParams();
        urlParams.append("apikey", API_KEY);
        urlParams.append("keyword", keyword);

        if (latlong) {
            urlParams.append("latlong", `${latlong.latitude},${latlong.longitude}`);
            urlParams.append("radius", "200");
        } else if (city) {
            urlParams.append("city", city);
        }

        const response = await fetch(`${BASE_URL}?${urlParams.toString()}`);
        const data = await response.json();

        if (!data._embedded?.events) return [];

        return data._embedded.events.map(event => ({
            id: event.id,
            name: event.name,
            date: event.dates.start.localDate,
            venue: event._embedded.venues?.[0]?.name ?? "Unknown venue",
            url: event.url,
            image: event.images?.[0]?.url ?? null
        }));
    } catch (error) {
        console.error("Error fetching concerts:", error);
        return [];
    }
}
