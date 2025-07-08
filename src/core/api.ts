import {Airport} from "@customTypes/global.types.ts";

const offlineAirportData: Airport[] = [
    {
        "name": "Hassi R'Mel Airport",
        "icao": "DAFH",
        "iata": "HRM",
        "lat": 32.930401,
        "long": 3.31154,
        "municipality": "Hassi R'Mel",
        "country": "DZ"
    },
    {
        "name": "Djerba Zarzis International Airport",
        "icao": "DTTJ",
        "iata": "DJE",
        "lat": 33.875,
        "long": 10.7755,
        "municipality": "Mellita",
        "country": "TN"
    },
    {
        "name": "Gordil Airport",
        "icao": "FEGL",
        "iata": "GDI",
        "lat": 9.581117,
        "long": 21.728172,
        "municipality": "Melle",
        "country": "CF"
    },
    {
        "name": "Melilla Airport",
        "icao": "GEML",
        "iata": "MLN",
        "lat": 35.2798,
        "long": -2.95626,
        "municipality": "Melilla",
        "country": "ES"
    },
    {
        "name": "Beni Mellal Airport",
        "icao": "GMMD",
        "iata": "BEM",
        "lat": 32.401895,
        "long": -6.315905,
        "municipality": "Oulad Yaich",
        "country": "MA"
    },
    {
        "name": "Sania Ramel Airport",
        "icao": "GMTN",
        "iata": "TTU",
        "lat": 35.594299,
        "long": -5.32002,
        "municipality": "Tétouan",
        "country": "MA"
    },
    {
        "name": "Bujumbura Melchior Ndadaye International Airport",
        "icao": "HBBA",
        "iata": "BJM",
        "lat": -3.32402,
        "long": 29.318501,
        "municipality": "Bujumbura",
        "country": "BI"
    },
    {
        "name": "Accomack County Airport",
        "icao": "KMFV",
        "iata": "MFV",
        "lat": 37.646900177,
        "long": -75.761100769,
        "municipality": "Melfa",
        "country": "US"
    },
    {
        "name": "Melbourne Orlando International Airport",
        "icao": "KMLB",
        "iata": "MLB",
        "lat": 28.1028,
        "long": -80.645302,
        "municipality": "Melbourne",
        "country": "US"
    },
    {
        "name": "Hévíz–Balaton Airport",
        "icao": "LHSM",
        "iata": "SOB",
        "lat": 46.686391,
        "long": 17.159084,
        "municipality": "Sármellék",
        "country": "HU"
    }];

/**
 * Fetches the list of airports for a given search string [query]
 * @param query
 * @returns {Airport[]} a list of objects of type {@link Airport} if successful
 */
export async function getAirportSearch(query: string): Promise<Airport[]> {
    return new Promise(async (resolve) => {
        const params = new URLSearchParams({searchTerm: query});
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/airports/get/search?${params}`);

            if (!response.ok) {
                const httpError: { url: string, status: number, message: string } = await response.json();
                console.log(`Error ${httpError.status}: ${httpError.message}`);
                // set toast message to indicate limited offline data
                resolve(offlineAirportData);
            }
            const data: Airport[] = await response.json();
            console.log(data);
            resolve(data);
        } catch (error) {
            console.log('Could not fetch real-time airports', error);
            resolve(offlineAirportData);
        }
    })
}