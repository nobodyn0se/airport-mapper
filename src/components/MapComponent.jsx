import {useEffect, useMemo, useRef} from "react";
import mapboxgl from "mapbox-gl";

import 'mapbox-gl/dist/mapbox-gl.css';

function MapComponent() {
    const mapRef = useRef();
    const mapContainerRef = useRef();

    const coordinates = useMemo(() => [{
        name: 'Almaty', long: 77.043, lat: 43.354
    }, {name: 'Tashkent', long: 69.281, lat: 41.258}, {name: 'Baku', long: 50.047, lat: 40.467}, {
        name: 'Tehran',
        long: 51.152198791503906,
        lat: 35.416099548339844
    }], [])

    useEffect(() => {

        mapboxgl.accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [-74.0242, 40.6941],
            zoom: 2.0
        })

        coordinates.forEach((coordinate) => {
            new mapboxgl.Marker()
                .setLngLat([coordinate.long, coordinate.lat])
                .setPopup(new mapboxgl.Popup({closeButton: false}).setText(coordinate.name)) // Optional: Add popup with city name
                .addTo(mapRef.current);
        });

        return () => mapRef.current.remove();
    }, [coordinates])

    return (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-black p-4" id='map-container'
             ref={mapContainerRef}>
        </div>
    )
}

export default MapComponent