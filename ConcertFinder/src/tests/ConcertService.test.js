import { fetchConcerts } from '../services/ConcertService';

global.fetch = require('jest-fetch-mock');

beforeEach(() => {
    fetch.resetMocks();
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

test('fetchConcerts returns mapped events correctly', async () => {
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

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('keyword=rock')
    );
    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('city=New York')
    );
});