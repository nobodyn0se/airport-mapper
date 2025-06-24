import {useCallback, useEffect, useMemo, useRef} from "react";
import mapboxgl from "mapbox-gl";

import {useAtomValue} from "jotai";
import {airportMarkerAtom, polylinesAtom} from "../state/atoms.jsx";

import 'mapbox-gl/dist/mapbox-gl.css';

function MapComponent() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
    const markerRef = useRef();

    const airportMarkers = useAtomValue(airportMarkerAtom);
    const polylines = useAtomValue(polylinesAtom)

    function getResponsiveZoom() {

        const width = window.innerWidth;
        if (width < 480) return 0.8;
        if (width < 768) return 1.2;
        return 2;
    }

    const initialZoom = useMemo(() => getResponsiveZoom(), []);

    const handleResize = useCallback(() => {
        if (mapRef.current) {
            const newZoom = getResponsiveZoom();
            mapRef.current.easeTo({zoom: newZoom, duration: 500});
            mapRef.current.resize();
        }
    }, []);

    useEffect(() => {

        mapboxgl.accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [-74.0242, 40.6941],
            zoom: initialZoom
        })

        return () => {
            mapRef.current.remove();
        };
    }, [initialZoom])

    useEffect(() => {
        if (!mapRef.current) {
            return
        }

        markerRef.current?.forEach((marker) => marker.remove())
        markerRef.current = [];

        if (airportMarkers.length > 0) {
            airportMarkers.forEach((coordinate) => {
                const marker = new mapboxgl.Marker({
                    color: "#B22222"
                })
                    .setLngLat([coordinate.long, coordinate.lat])
                    .setPopup(new mapboxgl.Popup({closeButton: false}).setText(coordinate.name)) // Optional: Add popup with city name
                    .addTo(mapRef.current);

                markerRef.current.push(marker); // track it
            });

            // move the map to the latest airport marker
            const lastAirport = airportMarkers[airportMarkers.length - 1];
            mapRef.current.easeTo({center: [lastAirport.long, lastAirport.lat], duration: 500});
        }

    }, [airportMarkers])

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

    useEffect(() => {
        if (!mapRef.current || !mapRef.current.isStyleLoaded()) {
            return;
        }

        const addPolylines = () => {
            const existingLayers = mapRef.current.getStyle().layers.map(layer => layer.id);
            existingLayers.forEach(layerId => {
                if (layerId.startsWith('poly-')) {
                    mapRef.current.removeLayer(layerId);
                    mapRef.current.removeSource(layerId);
                }
            });

            // Add new polylines
            polylines.forEach(polyline => {
                mapRef.current.addSource(polyline.id, {
                    type: 'geojson',
                    data: {
                        type: 'Feature',
                        geometry: {
                            type: 'LineString',
                            coordinates: polyline.coordinates,
                        },
                    },
                });

                mapRef.current.addLayer({
                    id: polyline.id,
                    type: 'line',
                    source: polyline.id,
                    layout: {
                        'line-join': 'round',
                        'line-cap': 'round',
                    },
                    paint: {
                        'line-color': '#000',
                        'line-width': 2,
                    },
                });
            });
        }
        addPolylines();

        const clearPolylines = () => {
            const existingLayers = mapRef.current.getStyle().layers.map(layer => layer.id);
            existingLayers.forEach(layerId => {
                if (layerId.startsWith('poly-')) {
                    mapRef.current.removeLayer(layerId);
                    mapRef.current.removeSource(layerId);
                }
            });
        }

        if (polylines.length === 0) {
            clearPolylines();
        }

    }, [polylines])


    return (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-black" id='map-container'
             ref={mapContainerRef}>
        </div>
    )
}

export default MapComponent