import {useEffect, useRef} from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw'; // Mapbox GL Draw plugin
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic';

import {useAtomValue} from "jotai";
import {airportMarkerAtom, polylinesAtom} from "../state/atoms.jsx";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import {antarcticCircle, arcticCircle} from "../util/util.js";

function MapComponent() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
    const markerRef = useRef();
    const drawRef = useRef();

    const airportMarkers = useAtomValue(airportMarkerAtom);
    const polylines = useAtomValue(polylinesAtom)

    function getResponsiveZoom() {

        const width = window.innerWidth;
        if (width < 480) return 0.8;
        if (width < 768) return 1.2;
        return 2;
    }

    const clearPolylines = (drawInstance) => {
        if (drawInstance) {
            drawInstance.deleteAll();
        }
    }

    useEffect(() => {
        const initialZoom = getResponsiveZoom();

        mapboxgl.accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            center: [-74.0242, 40.6941],
            zoom: initialZoom
        });

        const handleResize = () => {
            if (mapRef.current) {
                const newZoom = getResponsiveZoom();
                mapRef.current.easeTo({zoom: newZoom, duration: 500});
                mapRef.current.resize();
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            mapRef.current.remove();
            mapRef.current = null;
            window.removeEventListener('resize', handleResize);
        };
    }, [])

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
        if (!mapRef.current) return;

        const mapInstance = mapRef.current; // Get the current map instance

        const handleMapLoad = () => {
            let modes = MapboxDraw.modes;
            modes = MapboxDrawGeodesic.enable(modes);

            drawRef.current = new MapboxDraw({
                modes: modes,
                styles: [
                    {
                        "id": "gl-draw-line",
                        "type": "line",
                        "filter": ["all", ["==", "$type", "LineString"]],
                        "layout": {
                            "line-cap": "round",
                            "line-join": "round"
                        },
                        "paint": {
                            "line-color": "#000",
                            "line-width": 2
                        }
                    }
                ]
            });

            mapInstance.addControl(drawRef.current);
        };

        function loadPolarCircles() {
            mapInstance.addSource('arctic-circle', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        arcticCircle,
                    ]
                }
            });

            mapInstance.addSource('antarctic-circle', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: [
                        antarcticCircle,
                    ]
                }
            });

            mapInstance.addLayer({
                id: 'arctic-circle-line',
                type: 'line',
                source: 'arctic-circle',
                paint: {
                    'line-color': 'gray',
                    'line-width': 4,
                    'line-dasharray': [10, 15],
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                }
            });

            mapInstance.addLayer({
                id: 'antarctic-circle-line',
                type: 'line',
                source: 'antarctic-circle',
                paint: {
                    'line-color': 'gray',
                    'line-width': 4,
                    'line-dasharray': [10, 15],
                },
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                }
            });

            mapInstance.addSource('arctic-circle-center', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, 90]
                    }
                }
            });

            mapInstance.addLayer({
                id: 'arctic-circle-label',
                type: 'symbol',
                source: 'arctic-circle-center',
                layout: {
                    'text-field': 'North Pole Exclusion Zone',
                    'text-size': 12,
                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                },
                paint: {
                    'text-color': 'black',
                    'text-halo-color': 'white',
                    'text-halo-width': 2
                }
            });

            mapInstance.addSource('antarctic-circle-center', {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [0, -85]
                    }
                }
            });

            mapInstance.addLayer({
                id: 'antarctic-circle-label',
                type: 'symbol',
                source: 'antarctic-circle-center',
                layout: {
                    'text-field': 'South Pole Exclusion Zone',
                    'text-size': 12,
                    'text-allow-overlap': true,
                    'text-ignore-placement': true
                },
                paint: {
                    'text-color': 'black',
                    'text-halo-color': 'white',
                    'text-halo-width': 2
                }
            });
        }

        mapInstance.on('load', () => {
            handleMapLoad();
            loadPolarCircles();
        });

        return () => {
            if (mapInstance && drawRef.current) {
                clearPolylines(drawRef.current); // Clear all features managed by Draw
                mapInstance.removeControl(drawRef.current);
                drawRef.current = null; // Clear the ref
                mapInstance.off('load', handleMapLoad); // Remove event listener
                mapInstance.off('load', loadPolarCircles);
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !drawRef.current) {
            return;
        }

        const addPolylines = () => {
            const newPolyline = polylines[polylines.length - 1];

            drawRef.current.add({
                id: newPolyline.name,
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: newPolyline.coordinates,
                }
            });
        }

        if (polylines.length > 0) {
            addPolylines();
        } else {
            clearPolylines(drawRef.current);
        }
    }, [polylines])

    return (
        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-black" id='map-container'
             ref={mapContainerRef}>
        </div>
    )
}

export default MapComponent