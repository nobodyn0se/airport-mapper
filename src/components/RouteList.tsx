import {polylinesAtom} from "@state/atoms.ts";
import {useAtomValue} from "jotai";
import {calculateTotalDistance} from "@util/util.ts";

/**
 * Shows the list of routes below the search bar [SearchPane]
 * @constructor
 */
function RouteList() {
    const polylines = useAtomValue(polylinesAtom);
    const totalAllRoutes = calculateTotalDistance(polylines.map(polyline => polyline.totalRouteDistance));

    return (
        <div>
            <div className="mb-4 p-4 border border-gray-300 rounded">
                <h4 className="font-semibold">Total Distance: {totalAllRoutes} km</h4>
                <ul className="list-disc pl-5">
                    <li>Route breakdown will appear here</li>
                </ul>
            </div>
            {/* Add more route placeholders as needed */}
            {polylines && polylines.map((route) => (
                <ul className="max-w-md mx-auto rounded-lg overflow-hidden divide-y divide-gray-200">
                    <li key={route.name} className="px-4 py-3">
                        <div className="flex justify-between items-center">
                            <div className="flex flex-col space-x-2">
                                {route.airports.slice(0, -1).map((airport, i) => (
                                    <div key={`${airport}-${i}`} className="flex items-center">
                                        <span className="font-medium text-white-700">{airport}</span>
                                        <span className="mx-1 text-gray-500">→</span>
                                        <span className="font-medium text-white-700">{route.airports[i + 1]}</span>
                                    </div>
                                ))}
                            </div>

                            <aside className="flex flex-col">
                                {route.distance.map((distance, i) => (
                                    <span
                                        key={i}
                                        className="font-semibold text-right"
                                    >
                                    {distance.toFixed(2)}
                                    </span>
                                ))}
                            </aside>
                        </div>
                    </li>
                </ul>
            ))}
        </div>
    )
}

export default RouteList