import {useAtom} from "jotai";
import {airportMarkerAtom, currentAirportMarkerAtom, polylinesAtom} from "../state/atoms.jsx";
import {MdDeleteForever} from "react-icons/md";
import {useCallback, useEffect, useMemo, useState} from "react";
import debounce from "lodash.debounce";
import SuggestedAirport from "../ui/SuggestedAirport.jsx";

async function getAirportSearch(query) {
    const coordinates = [{
        name: 'Almaty', long: 77.043, lat: 43.354
    }, {name: 'Tashkent', long: 69.281, lat: 41.258}, {name: 'Baku', long: 50.047, lat: 40.467}, {
        name: 'Tehran',
        long: 51.152198791503906,
        lat: 35.416099548339844
    }]

    const params = new URLSearchParams({searchTerm: query});

    try {
        const response = await fetch(`${import.meta.env.VITE_API_BASEURL}/airports/get/search?${params}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(coordinates);
        }, 1000);
    })
}

function SearchPane() {
    const [, setAirportMarkers] = useAtom(airportMarkerAtom);
    const [currentAirportMarkers, setCurrentAirportMarkers] = useAtom(currentAirportMarkerAtom);
    const [, setPolylines] = useAtom(polylinesAtom);

    const [searchSuggestions, setSearchSuggestions] = useState([]);
    const [query, setQuery] = useState('');

    const handleSearch = async (searchQuery) => {
        const suggestions = await getAirportSearch(searchQuery);
        setSearchSuggestions(suggestions);
    }

    const handleDeleteAll = () => {
        setAirportMarkers([]);
        setCurrentAirportMarkers([]);
        setPolylines([]);
    }

    const handleSelectAirport = (selectedAirport) => {
        setAirportMarkers((airportList) => {
            if (airportList.some(existingAirport => existingAirport.name === selectedAirport.name)) return airportList;
            return [...airportList, selectedAirport];
        });

        setCurrentAirportMarkers((currentAirports) => [...currentAirports, selectedAirport]);

        setQuery('');
        setSearchSuggestions([]);
    }

    const handlePolylines = () => {
        if (currentAirportMarkers.length < 2) {
            console.warn('At least 2 airports needed for a route');
            return;
        }

        const newPolyline = {
            id: `poly-${Date.now()}`,
            coordinates: currentAirportMarkers.map((airport) => [airport.long, airport.lat]),
            name: `Route ${Date.now()}`
        }

        setPolylines(prev => {
            if (prev.some(existingPolyline => existingPolyline.coordinates === newPolyline.coordinates)) {
                console.log('Same polyline detected')
                return prev;
            }
            return [...prev, newPolyline]
        });
        setCurrentAirportMarkers([]);
    }

    const debouncedSearch = useMemo(() => {
        return debounce(async (searchQuery) => {
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
                <input
                    type="text"
                    placeholder="Enter airport code"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                />
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
        </div>
    )
}

export default SearchPane;