import {useCallback, useEffect, useMemo, useRef} from "react";
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

    const handleResize = useCallback(() => {
        if (mapRef.current) {
            const newZoom = getResponsiveZoom();
            mapRef.current.easeTo({zoom: newZoom, duration: 500});
            mapRef.current.resize();
        }
    }, []);

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
        })
        // console.log('Map created')

        return () => {
            mapRef.current.remove();
            mapRef.current = null;
        };
    }, [])

    useEffect(() => {
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [handleResize]);

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
                id: 'arctic-circle-fill',
                type: 'fill',
                source: 'arctic-circle',
                paint: {
                    'fill-color': '#88d6fe',
                    'fill-opacity': 1
                },
            });

            mapInstance.addLayer({
                id: 'antarctic-circle-fill',
                type: 'fill',
                source: 'antarctic-circle',
                paint: {
                    'fill-color': '#e7eef2',
                    'fill-opacity': 1
                },
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
            polylines.forEach(polyline => {
                drawRef.current.add({
                    id: polyline.id,
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: polyline.coordinates,
                    }
                })
            });
        }

        addPolylines();

        if (polylines.length === 0) {
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