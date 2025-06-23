import {useAtom} from "jotai";
import {airportMarkerAtom} from "../state/atoms.jsx";
import {MdDeleteForever} from "react-icons/md";

async function mockAirportSearch() {
    const coordinates = [{
        name: 'Almaty', long: 77.043, lat: 43.354
    }, {name: 'Tashkent', long: 69.281, lat: 41.258}, {name: 'Baku', long: 50.047, lat: 40.467}, {
        name: 'Tehran',
        long: 51.152198791503906,
        lat: 35.416099548339844
    }]

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(coordinates);
        }, 1000);
    })
}

function SearchPane() {
    const [, setAirportMarkers] = useAtom(airportMarkerAtom);

    const handleSearch = async () => {
        const results = await mockAirportSearch();
        setAirportMarkers(results);
    }

    const handleDeleteAll = () => {
        setAirportMarkers([]);
    }

    return (
        <div className="mb-4">
            <div className="flex w-full">
                <input
                    type="text"
                    placeholder="Enter airport code"
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                />
                <div className="mb-2 flex items-center px-3 rounded cursor-pointer">
                    <MdDeleteForever className="text-xl text-red-500" onClick={handleDeleteAll}/>
                </div>
            </div>
            <button className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
                    onClick={handleSearch}>
                Add Route
            </button>
        </div>
    )
}

export default SearchPane;