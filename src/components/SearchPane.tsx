import {useAtom} from "jotai";
import {airportMarkerAtom, currentAirportMarkerAtom, lookupStateAtom, polylinesAtom} from "@state/atoms.ts";
import {MdDeleteForever} from "react-icons/md";
import {useEffect, useMemo, useState} from "react";
import debounce from "lodash.debounce";
import SuggestedAirport from "@ui/SuggestedAirport.tsx";
import {createNewPolylineRoute} from "@util/util.ts";

import {Airport, PolylineRoute} from "@customTypes/global.types.ts";
import AirportChip from "@ui/AirportChip.tsx";
import {FaSpinner} from "react-icons/fa";
import {LookupState} from "@customTypes/util.types.ts";
import {getAirportSearch} from "../core/api.ts";

/**
 * Contains the search bar and route creation button
 * Displays a dropdown suggestion when the user searches for an airport
 * @constructor
 */
function SearchPane() {
    const [, setAirportMarkers] = useAtom(airportMarkerAtom);
    const [currentAirportMarkers, setCurrentAirportMarkers] = useAtom(currentAirportMarkerAtom);
    const [polylines, setPolylines] = useAtom(polylinesAtom);
    const [lookupState, setLookupState] = useAtom(lookupStateAtom);

    const [searchSuggestions, setSearchSuggestions] = useState<Airport[]>([]);
    const [query, setQuery] = useState('');

    const isDeleteAllDisabled = polylines.length === 0;

    const handleSearch = async (searchQuery: string) => {
        setLookupState(LookupState.LOADING);
        try {
            const suggestions = await getAirportSearch(searchQuery);
            if (suggestions.length === 0) {
                setLookupState(LookupState.NODATA);
            } else {
                setLookupState(LookupState.HASDATA);
            }
            setSearchSuggestions(suggestions);
        } catch (_) {
            setLookupState(LookupState.ERROR);
        }
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
        if (query === '') {
            setLookupState(LookupState.IDLE);
        }
        debouncedSearch(query)
    }, [query, debouncedSearch])

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    return (
        <div className="mb-4 relative">
            <div className="flex gap-1 w-full">
                <div className="relative w-full">
                    <input
                        type="text"
                        placeholder="Enter airport code"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded mb-2"
                    />
                    {lookupState === LookupState.LOADING && (
                        <div className="absolute pb-1.5 right-2 top-1/2 transform -translate-y-1/2">
                            <FaSpinner className="animate-spin text-xl text-gray-500"/>
                        </div>)}
                </div>
                <button
                    className={`mb-2 flex items-center px-3 rounded-full  ${isDeleteAllDisabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-200'}`}
                    title="Delete All Routes"
                    aria-label="This button deletes all routes so you can start afresh"
                    disabled={isDeleteAllDisabled}
                    onClick={handleDeleteAll}>
                    <MdDeleteForever
                        className={`text-xl  ${isDeleteAllDisabled ? 'text-gray-400' : 'text-red-500'}`}/>

                </button>
            </div>
            {lookupState === LookupState.HASDATA &&
                (
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
            {lookupState === LookupState.NODATA && (
                <span
                    className="absolute left-0 right-0 border bg-gray-242424
                border-gray-300 z-10 max-h-48 p-2 font-extralight text-gray-300 text-center">
                No results found for this airport</span>
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