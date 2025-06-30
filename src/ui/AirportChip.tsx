import {Airport} from "@customTypes/global.types.ts";

/**
 * Standalone component with containerized styling to show currently selected airports as chips under the Add Route button
 * @param airport
 * @constructor
 */
function Chip({airport}: { airport: Airport }) {
    return (
        <div className="inline-flex items-center bg-gray-300 text-gray-800 rounded-full px-3 py-1 text-sm">
            <span>{airport.iata}</span>
            <button
                type="button"
                className="ml-2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-700"
            >
                ✕
            </button>
        </div>
    );
}

export default Chip;
