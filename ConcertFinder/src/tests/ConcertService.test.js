import {
    fetchConcerts,
    fetchBilesuParadizeConcerts,
    bilesuEventMatchesGenre,
    genreIdFromLabel,
    fetchBilesuParadizeForGenre,
    clearBilesuRepertoireCache,
    ticketmasterKeywordsForGenreId,
    fetchTicketmasterGenreConcerts,
} from '../services/ConcertService';

globalThis.fetch = require('jest-fetch-mock');

beforeEach(() => {
    fetch.resetMocks();
    clearBilesuRepertoireCache();
});

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

test('fetchConcerts returns empty array if no events', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));

    const concerts = await fetchConcerts({ keyword: 'pop', city: 'Los Angeles' });

    expect(concerts).toEqual([]);
});

test('fetchConcerts handles fetch errors gracefully', async () => {
    fetch.mockRejectOnce(new Error('Network error'));

    const concerts = await fetchConcerts({ keyword: 'rock', city: 'New York' });

    expect(concerts).toEqual([]);
});

test('fetchConcerts defaults keyword to "rock"', async () => {
    fetch.mockResponseOnce(JSON.stringify(mockApiResponse));

    await fetchConcerts({ city: 'Chicago' });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('keyword=rock'));
});

test('fetchConcerts filters events missing required fields', async () => {
    const incompleteResponse = {
        _embedded: {
            events: [
                { id: '2', name: 'Jazz Night', dates: { start: { localDate: '2025-11-20' } } },
            ]
        }
    };
    fetch.mockResponseOnce(JSON.stringify(incompleteResponse));

    const concerts = await fetchConcerts({ keyword: 'jazz' });

    expect(concerts).toEqual([]);
});

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
                    images: [{ url: 'https://image.url/2.jpg' }]
                }
            ]
        }
    };
    fetch.mockResponseOnce(JSON.stringify(multiEventResponse));

    const concerts = await fetchConcerts({ keyword: 'music' });

    expect(concerts.length).toBe(2);
    expect(concerts[1]).toEqual({
        id: '2',
        name: 'Pop Concert',
        date: '2025-12-01',
        venue: 'Staples Center',
        url: 'https://ticketmaster.com/event/2',
        image: 'https://image.url/2.jpg'
    });
});

test('fetchBilesuParadizeConcerts merges venue repertoires with stable ids', async () => {
    const bpEvent = {
        id: 999,
        urls: { en: 'https://www.bilesuparadize.lv/en/event/999' },
        dateTime: '2026-04-01T19:00:00',
        performance: {
            titles: { en: 'Riga Live', lv: 'Rīga' },
            posterImageUrls: { lv: 'https://media.bilesuparadize.lv/poster.jpg' },
        },
        hall: { address: 'Rīga, Example 1', titles: { en: 'Main Hall' } },
        venue: { id: 54, titles: {} },
    };
    fetch.mockResponseOnce(JSON.stringify([bpEvent]));
    fetch.mockResponseOnce(JSON.stringify([]));

    const concerts = await fetchBilesuParadizeConcerts({ venueIds: [54, 720], maxTotal: 10 });

    expect(concerts).toHaveLength(1);
    expect(concerts[0].id).toBe('bp-999');
    expect(concerts[0].performance.titles.en).toBe('Riga Live');
    expect(fetch).toHaveBeenCalledWith('https://www.bilesuparadize.lv/api/venue/54/repertoire');
    expect(fetch).toHaveBeenCalledWith('https://www.bilesuparadize.lv/api/venue/720/repertoire');
});

test('fetchBilesuParadizeConcerts returns empty array on error', async () => {
    fetch.mockRejectOnce(new Error('fail'));

    const concerts = await fetchBilesuParadizeConcerts({ venueIds: [1] });

    expect(concerts).toEqual([]);
});

test('genreIdFromLabel maps Discovery labels', () => {
    expect(genreIdFromLabel('Pop')).toBe('pop');
    expect(genreIdFromLabel('Hip-Hop')).toBe('hiphop');
    expect(genreIdFromLabel('Unknown')).toBeNull();
});

test('ticketmasterKeywordsForGenreId maps edm and hip-hop to broader TM terms', () => {
    expect(ticketmasterKeywordsForGenreId('edm')).toEqual(['electronic', 'edm', 'techno']);
    expect(ticketmasterKeywordsForGenreId('hiphop')).toContain('hip hop');
    expect(ticketmasterKeywordsForGenreId('hiphop')).toContain('rap');
    expect(ticketmasterKeywordsForGenreId(null, 'Weird')).toEqual(['Weird']);
});

test('fetchTicketmasterGenreConcerts merges keyword batches and dedupes by id', async () => {
    const body = JSON.stringify(mockApiResponse);
    fetch.mockResponse(body);
    fetch.mockResponse(body);
    fetch.mockResponse(body);

    const out = await fetchTicketmasterGenreConcerts('rock', 'Rock', {
        geoModes: [{ city: 'Riga' }],
    });

    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('1');
    expect(fetch.mock.calls.length).toBe(3);
});

test('fetchConcerts encodes multi-word keyword in URL', async () => {
    fetch.mockResponseOnce(JSON.stringify({}));

    await fetchConcerts({ keyword: 'hip hop', city: 'Riga' });

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('keyword=hip%20hop'));
});

test('bilesuEventMatchesGenre uses categories and titles', () => {
    const rockPop = {
        performance: {
            categories: [{ en: 'Rock & Pop', lv: 'Roks' }],
            titles: { en: 'Some show' },
        },
    };
    expect(bilesuEventMatchesGenre(rockPop, 'rock')).toBe(true);
    expect(bilesuEventMatchesGenre(rockPop, 'pop')).toBe(true);
    expect(bilesuEventMatchesGenre(rockPop, 'classical')).toBe(false);

    const jazzOnly = {
        performance: {
            categories: [{ en: 'Jazz & Blues' }],
            titles: {},
        },
    };
    expect(bilesuEventMatchesGenre(jazzOnly, 'jazz')).toBe(true);

    const titleRap = {
        performance: {
            categories: [{ en: 'Concerts' }],
            titles: { en: 'Latvian Rap Night' },
        },
    };
    expect(bilesuEventMatchesGenre(titleRap, 'hiphop')).toBe(true);

    const drillTitle = {
        performance: {
            categories: [{ en: 'Concerts' }],
            titles: { en: 'UK Drill Night' },
        },
    };
    expect(bilesuEventMatchesGenre(drillTitle, 'hiphop')).toBe(true);

    const dnbCat = {
        performance: {
            categories: [{ en: 'DNB / Bass' }],
            titles: { en: 'Club night' },
        },
    };
    expect(bilesuEventMatchesGenre(dnbCat, 'edm')).toBe(true);
});

test('fetchBilesuParadizeForGenre filters and caps results', async () => {
    const jazzEvent = {
        id: 1,
        dateTime: '2026-05-01T20:00:00',
        performance: { categories: [{ en: 'Jazz & Blues' }], titles: {} },
    };
    const rockEvent = {
        id: 2,
        dateTime: '2026-04-01T20:00:00',
        performance: { categories: [{ en: 'Classic music' }], titles: {} },
    };
    fetch.mockResponseOnce(JSON.stringify([jazzEvent, rockEvent]));

    const out = await fetchBilesuParadizeForGenre('jazz', {
        venueIds: [54],
        maxTotal: 10,
    });

    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('bp-1');
    expect(out[0].performance.categories[0].en).toBe('Jazz & Blues');
});
