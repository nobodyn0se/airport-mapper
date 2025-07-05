import {polylinesAtom} from "@state/atoms.ts";
import {useAtomValue} from "jotai";
import {calculateTotalDistance} from "@util/util.ts";
import {MdRemoveCircle} from "react-icons/md";

/**
 * Shows the list of routes below the search bar [SearchPane]
 * @constructor
 */
function RouteList() {
    const polylines = useAtomValue(polylinesAtom);
    const totalAllRoutes = calculateTotalDistance(polylines.map(polyline => polyline.totalRouteDistance));

    return (
        <div className="h-5/6">
            <div className="mb-4 p-4 border border-gray-300 rounded">
                <h4 className="font-semibold">Total Distance: {totalAllRoutes} km</h4>
                <ul className="list-disc pl-5">
                    <li>Route breakdown will appear here</li>
                </ul>
            </div>
            {/* Add more route placeholders as needed */}
            <section className="h-5/6 overflow-y-auto divide-y divide-gray-500">
                {polylines && polylines.map((route) => (
                    <ul className="max-w-md mx-auto my-2 rounded-lg overflow-hidden">
                        <li key={route.name} className="pl-2 pr-1 py-3">
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

                                <aside className="flex">
                                    <div className="flex flex-col">
                                        {route.distance.map((distance, i) => (
                                            <span
                                                key={i}
                                                className="font-semibold text-right"
                                            >
                                    {distance.toFixed(2)} <span className="text-gray-800 font-medium">km</span>
                                    </span>
                                        ))}
                                    </div>
                                    <div
                                        className="cursor-pointer rounded-full text-lg p-1 text-amber-500 flex items-center hover:bg-gray-200">
                                        <MdRemoveCircle/></div>
                                </aside>
                            </div>
                        </li>
                    </ul>
                ))}
            </section>
        </div>
    )
}

export default RouteList