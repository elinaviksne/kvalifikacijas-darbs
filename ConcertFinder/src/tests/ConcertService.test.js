import { fetchConcerts } from '../services/ConcertService';

global.fetch = require('jest-fetch-mock');

beforeEach(() => {
    fetch.resetMocks();
});

// Mock API atbilde ar vienu koncertu
const mockApiResponse = {
    _embedded: {
        events: [
            {
                id: '1',
                name: 'Rock Concert',
                dates: { start: { localDate: '2025-11-15' } },
                _embedded: { venues: [{ name: 'Madison Square Garden' }] },
                url: 'https://ticketmaster.com/event/1',
                images: [{ url: 'https://image.url/1.jpg' }]
            }
        ]
    }
};

// Tests: fetchConcerts pareizi atgriež datus, kad ir norādīta pilsēta
test('fetchConcerts returns mapped events correctly with city', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));

    const concerts = await fetchConcerts({ keyword: 'rock', city: 'New York' });

    expect(concerts.length).toBe(1);
    expect(concerts[0]).toEqual({
        id: '1',
        name: 'Rock Concert',
        date: '2025-11-15',
        venue: 'Madison Square Garden',
        url: 'https://ticketmaster.com/event/1',
        image: 'https://image.url/1.jpg'
    });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('keyword=rock'));
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('city=New%20York'));
});

// Tests: fetchConcerts pareizi atgriež datus pēc GPS koordinātām
test('fetchConcerts returns mapped events correctly with latlong', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));
    const latlong = { latitude: 40.7128, longitude: -74.0060 };

    const concerts = await fetchConcerts({ keyword: 'rock', latlong });

    expect(concerts.length).toBe(1);
    expect(concerts[0].name).toBe('Rock Concert');

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(`latlong=${latlong.latitude},${latlong.longitude}`)
    );
});

// Tests: ja nav atrasti koncerti, atgriež tukšu masīvu
test('fetchConcerts returns empty array if no events', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));

    const concerts = await fetchConcerts({ keyword: 'pop', city: 'Los Angeles' });

    expect(concerts).toEqual([]);
});

// Tests: fetch kļūdas gadījumā funkcija atgriež tukšu masīvu
test('fetchConcerts handles fetch errors gracefully', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    const concerts = await fetchConcerts({ keyword: 'rock', city: 'New York' });

    expect(concerts).toEqual([]);
});

// Tests: noklusējuma keyword ir "rock"
test('fetchConcerts defaults keyword to "rock"', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));

    await fetchConcerts({ city: 'Chicago' });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('keyword=rock'));
});

// Tests: ja trūkst izvēles lauku, tiek izmantoti default vērtības
test('fetchConcerts handles missing optional fields', async () => {
    const incompleteResponse = {
        _embedded: { events: [{ id: '2', name: 'Jazz Night', dates: { start: { localDate: '2025-11-20' } } }] }
    };
    fetch.mockResponseOnce(JSON.stringify(incompleteResponse));

    const concerts = await fetchConcerts({ keyword: 'jazz' });

    expect(concerts[0].venue).toBe('Unknown venue');
    expect(concerts[0].image).toBeNull();
});

// Tests: vairāku koncertu atgriešana un pareiza datu transformācija
test('fetchConcerts maps multiple events correctly', async () => {
    const multiEventResponse = {
        _embedded: {
            events: [
                { ...mockApiResponse._embedded.events[0] },
                {
                    id: '2',
                    name: 'Pop Concert',
                    dates: { start: { localDate: '2025-12-01' } },
                    _embedded: { venues: [{ name: 'Staples Center' }] },
                    url: 'https://ticketmaster.com/event/2',
                    images: []
                }
            ]
        }
    };
    fetch.mockResponseOnce(JSON.stringify(multiEventResponse));

    const concerts = await fetchConcerts({ keyword: 'music' });

    expect(concerts.length).toBe(2);
    expect(concerts[1].venue).toBe('Staples Center');
    expect(concerts[1].image).toBeNull();
});