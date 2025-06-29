import {useEffect, useRef} from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw'; // Mapbox GL Draw plugin
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic';

import {useAtomValue} from "jotai";
import {airportMarkerAtom, polylinesAtom} from "@state/atoms.jsx";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import {
    layerAntarcticCircle, layerAntarcticLabel,
    layerArcticCircle, layerArcticLabel, sourceAntarcticCenter,
    sourceAntarcticCircle, sourceArcticCenter,
    sourceArcticCircle
} from "@util/map-features.js";

function MapComponent() {
    const mapRef = useRef();
    const mapContainerRef = useRef();
    const markerRef = useRef([]);
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

        const removeAllMarkers = () => {
            markerRef.current?.forEach((marker) => marker.remove())
            markerRef.current = [];
        }

        if (airportMarkers.length === 0) {
            removeAllMarkers();
            return;
        }

        const unmarkedAirport = airportMarkers[airportMarkers.length - 1];

        const marker = new mapboxgl.Marker({
            color: "#B22222"
        })
            .setLngLat([unmarkedAirport.long, unmarkedAirport.lat])
            .setPopup(new mapboxgl.Popup({closeButton: false}).setText(unmarkedAirport.name)) // Optional: Add popup with city name
            .addTo(mapRef.current);

        // Added iata ident to each marker
        marker.iata = unmarkedAirport.iata;
        markerRef.current.push(marker); // track it

        // move the map to the latest airport marker
        const lastAirport = airportMarkers[airportMarkers.length - 1];
        mapRef.current.easeTo({center: [lastAirport.long, lastAirport.lat], duration: 500});

        // Cleanup function interferes with the marker list persistence, hence disabled
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
            mapInstance.addSource('arctic-circle', sourceArcticCircle);
            mapInstance.addSource('antarctic-circle', sourceAntarcticCircle);

            mapInstance.addLayer(layerArcticCircle);
            mapInstance.addLayer(layerAntarcticCircle);

            mapInstance.addSource('arctic-circle-center', sourceArcticCenter);
            mapInstance.addLayer(layerArcticLabel);

            mapInstance.addSource('antarctic-circle-center', sourceAntarcticCenter);
            mapInstance.addLayer(layerAntarcticLabel);
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