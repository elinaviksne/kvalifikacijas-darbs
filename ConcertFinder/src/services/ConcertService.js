const API_KEY = "5lXcgONUwiIfm9ZIRYuA2t04jhvRErrk";
const BASE_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

// Funkcija, kas iegūst koncertu datus no Ticketmaster API
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
