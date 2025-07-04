import {useAtom} from "jotai";
import {airportMarkerAtom, currentAirportMarkerAtom, lookupActiveAtom, polylinesAtom} from "@state/atoms.ts";
import {MdDeleteForever} from "react-icons/md";
import {useEffect, useMemo, useState} from "react";
import debounce from "lodash.debounce";
import SuggestedAirport from "@ui/SuggestedAirport.tsx";
import {createNewPolylineRoute} from "@util/util.ts";

import {Airport, PolylineRoute} from "@customTypes/global.types.ts";
import AirportChip from "@ui/AirportChip.tsx";
import {FaSpinner} from "react-icons/fa";

/**
 * Fetches the list of airports for a given search string [query]
 * @param query
 * @returns {Airport[]} a list of objects of type {@link Airport} if successful
 */
async function getAirportSearch(query: string): Promise<Airport[]> {
    const coordinates: Airport[] = [{
        "name": "Hassi R'Mel Airport",
        "icao": "DAFH",
        "iata": "HRM",
        "lat": 32.930401,
        "long": 3.31154,
        "municipality": "Hassi R'Mel",
        "country": "DZ"
    }, {
        "name": "Djerba Zarzis International Airport",
        "icao": "DTTJ",
        "iata": "DJE",
        "lat": 33.875,
        "long": 10.7755,
        "municipality": "Mellita",
        "country": "TN"
    }, {
        "name": "Gordil Airport",
        "icao": "FEGL",
        "iata": "GDI",
        "lat": 9.581117,
        "long": 21.728172,
        "municipality": "Melle",
        "country": "CF"
    }, {
        "name": "Melilla Airport",
        "icao": "GEML",
        "iata": "MLN",
        "lat": 35.2798,
        "long": -2.95626,
        "municipality": "Melilla",
        "country": "ES"
    }, {
        "name": "Beni Mellal Airport",
        "icao": "GMMD",
        "iata": "BEM",
        "lat": 32.401895,
        "long": -6.315905,
        "municipality": "Oulad Yaich",
        "country": "MA"
    }, {
        "name": "Sania Ramel Airport",
        "icao": "GMTN",
        "iata": "TTU",
        "lat": 35.594299,
        "long": -5.32002,
        "municipality": "Tétouan",
        "country": "MA"
    }, {
        "name": "Bujumbura Melchior Ndadaye International Airport",
        "icao": "HBBA",
        "iata": "BJM",
        "lat": -3.32402,
        "long": 29.318501,
        "municipality": "Bujumbura",
        "country": "BI"
    }, {
        "name": "Accomack County Airport",
        "icao": "KMFV",
        "iata": "MFV",
        "lat": 37.646900177,
        "long": -75.761100769,
        "municipality": "Melfa",
        "country": "US"
    }, {
        "name": "Melbourne Orlando International Airport",
        "icao": "KMLB",
        "iata": "MLB",
        "lat": 28.1028,
        "long": -80.645302,
        "municipality": "Melbourne",
        "country": "US"
    }, {
        "name": "Hévíz–Balaton Airport",
        "icao": "LHSM",
        "iata": "SOB",
        "lat": 46.686391,
        "long": 17.159084,
        "municipality": "Sármellék",
        "country": "HU"
    }];

    const params = new URLSearchParams({searchTerm: query});

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/airports/get/search?${params}`);
        const data: Airport[] = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log(error);
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(coordinates);
        });
    })
}

/**
 * Contains the search bar and route creation button
 * Displays a dropdown suggestion when the user searches for an airport
 * @constructor
 */
function SearchPane() {
    const [, setAirportMarkers] = useAtom(airportMarkerAtom);
    const [currentAirportMarkers, setCurrentAirportMarkers] = useAtom(currentAirportMarkerAtom);
    const [, setPolylines] = useAtom(polylinesAtom);
    const [lookupActive, setLookupActive] = useAtom(lookupActiveAtom);

    const [searchSuggestions, setSearchSuggestions] = useState<Airport[]>([]);
    const [query, setQuery] = useState('');

    const handleSearch = async (searchQuery: string) => {
        setLookupActive(true);
        const suggestions = await getAirportSearch(searchQuery).finally(() => setLookupActive(false));
        setSearchSuggestions(suggestions);
    }

    /**
     * Clears display markers (airportMarkers), routing markers (currentAirportMarkers) and routes (polylines)
     */
    const handleDeleteAll = () => {
        setAirportMarkers([]);
        setCurrentAirportMarkers([]);
        setPolylines([]);
    }

    /**
     * Triggers when a user selects an airport from the dropdown suggestions
     * Sets airportMarkers for displaying labels and currentAirportMarkers for route creation purposes
     * @param selectedAirport
     */
    const handleSelectAirport = (selectedAirport: Airport) => {
        setAirportMarkers((airportList) => {
            if (airportList.some(existingAirport => existingAirport.name === selectedAirport.name)) return airportList;
            return [...airportList, selectedAirport];
        });

        setCurrentAirportMarkers((currentAirports) => {
            if (currentAirports.length > 0 && currentAirports[currentAirports.length - 1].name === selectedAirport.name) {
                return currentAirports;
            }
            return [...currentAirports, selectedAirport];
        });

        setQuery('');
        setSearchSuggestions([]);
    }

    /**
     * Creates a polyline route if at least 2 airports are selected (currentAirportMarkers)
     * Prevents the same route from being duplicated in the list
     */
    const handlePolylines = () => {
        if (currentAirportMarkers.length < 2) {
            console.warn('At least 2 airports needed for a route');
            return;
        }

        const newPolyline: PolylineRoute = createNewPolylineRoute(currentAirportMarkers);

        setPolylines(prev => {
            // prevent duplicate route addition
            if (prev.some(existingPolyline => existingPolyline.name === newPolyline.name)) {
                // display already exists toast
                return prev;
            }
            return [...prev, newPolyline]
        });

        setCurrentAirportMarkers([]);
    }

    const debouncedSearch = useMemo(() => {
        return debounce(async (searchQuery: string) => {
            if (!searchQuery.trim()) {
                setSearchSuggestions([]);
                return;
            }

            await handleSearch(searchQuery);

        }, 500);
    }, [])

    useEffect(() => {
        debouncedSearch(query)
    }, [query, debouncedSearch])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <div className="mb-4 relative">
            <div className="flex w-full">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Enter airport code"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    {lookupActive && (<div className="absolute pb-1.5 right-2 top-1/2 transform -translate-y-1/2">
                        <FaSpinner className="animate-spin text-xl text-gray-500"/>
                    </div>)}
                </div>
                <div className="mb-2 flex items-center px-3 rounded cursor-pointer">
                    <MdDeleteForever title="Delete All Routes" className="text-xl text-red-500"
                                     onClick={handleDeleteAll}/>
                </div>
            </div>

            {searchSuggestions.length > 0 && (
                <ul className="absolute left-0 right-0 border bg-gray-242424 border-gray-300 z-10 max-h-48 overflow-y-auto">
                    {searchSuggestions.map((item) => (
                        <li
                            key={item.name}
                            className="p-2 hover:bg-gray-100 hover:text-black cursor-pointer"
                            onClick={() => {
                                handleSelectAirport(item)
                            }}
                        >
                            <SuggestedAirport item={item}/>
                        </li>
                    ))}
                </ul>
            )}
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handlePolylines}>
                Add Route
            </button>
            {currentAirportMarkers.length > 0 && (
                currentAirportMarkers.map((currentAirport, index) => (
                    <AirportChip airport={currentAirport} deletionIndex={index}/>
                ))
            )}
        </div>
    )
}

export default SearchPane;