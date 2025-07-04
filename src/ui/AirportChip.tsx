import {Airport} from "@customTypes/global.types.ts";
import {airportMarkerAtom, currentAirportMarkerAtom, markerDeletionAtom} from "@state/atoms.ts";
import {useAtom} from "jotai";

/**
 * Standalone component with containerized styling to show currently selected airports as chips under the Add Route button
 * @param airport
 * @param deletionIndex
 * @constructor
 */
function Chip({airport, deletionIndex}: { airport: Airport, deletionIndex: number }) {
    const [, setMarkersToDelete] = useAtom(markerDeletionAtom);
    const [currentMarkers, setCurrentAirportMarkers] = useAtom(currentAirportMarkerAtom);
    const [, setAirportMarkers] = useAtom(airportMarkerAtom);

    /**
     * Delete an airport from the displayed markers if it's not being used in any other route
     * Track the target IATA list and trigger a deletion from airportMarkers
     * Keep the marker if airport already in 1 or more routes OR selected for 1+ sectors in current route plan
     * @param iata
     */
    const handleDeleteSelectedAirport = (iata: string) => {
        setCurrentAirportMarkers((currentSelectedAirports => {
            currentSelectedAirports.splice(deletionIndex, 1);
            
            /* delete airport from the selection then recheck the previous airport in the selection
             if same IATA, remove at current index and retain the previous
             eg. HRM-GDI-HRM, delete GDI, selection now HRM-HRM, remove latest HRM, selection now HRM
             prevents routing between the same airports according to app philosophy
             */
            if (currentSelectedAirports.length > 1) {
                const previousAirportIATA = currentSelectedAirports[deletionIndex - 1].iata;
                const currentAirportIATA = currentSelectedAirports[deletionIndex].iata

                previousAirportIATA === currentAirportIATA && currentSelectedAirports.splice(deletionIndex, 1);
            }
            return currentSelectedAirports;
        }));

        setAirportMarkers((markedAirports => {
            // dec usedInRoute if > 1, delete otherwise and setMarkersToDelete(iata) to trigger marker deletion
            const index = markedAirports.findIndex(markedAirport => markedAirport.iata === iata);
            const airport = markedAirports[index];
            // copy of currentList not updated immediately, so older list available for transformation
            const countInSelectedList = currentMarkers.reduce((count, airport) => {
                return airport.iata === iata ? count + 1 : count;
            }, 0);

            if (typeof airport?.usedInRoute === 'number' && airport.usedInRoute > 0 || countInSelectedList > 1) {
                // skip deletion if airport already in route(s) or spans multiple sectors in current selection eg. LHR-DXB-LHR
                return markedAirports;
            } else {
                // delete from the list n markers
                setMarkersToDelete(iata);
                return markedAirports.filter(airport => airport.iata !== iata);
            }
        }));
    }

    return (
        <div className="inline-flex items-center bg-gray-300 text-gray-800 rounded-full my-2 mx-1 px-3 py-1 text-sm">
            <span>{airport.iata}</span>
            <button
                type="button"
                className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700"
                onClick={() => {
                    handleDeleteSelectedAirport(airport.iata)
                }}
            >
                ✕
            </button>
        </div>
    );
}

export default Chip;
