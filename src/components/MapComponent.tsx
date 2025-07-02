import {useEffect, useRef} from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from '@mapbox/mapbox-gl-draw'; // Mapbox GL Draw plugin
import * as MapboxDrawGeodesic from 'mapbox-gl-draw-geodesic';

import {useAtom, useAtomValue} from "jotai";
import {airportMarkerAtom, markerDeletionAtom, polylinesAtom} from "@state/atoms.ts";

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import {
    layerAntarcticCircle, layerAntarcticLabel,
    layerArcticCircle, layerArcticLabel, sourceAntarcticCenter,
    sourceAntarcticCircle, sourceArcticCenter,
    sourceArcticCircle
} from "@util/map-features.ts";
import {AirportMarker} from "@customTypes/global.types.ts";

function MapComponent() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    const markerRef = useRef<AirportMarker[]>([]);
    const drawRef = useRef<MapboxDraw | null>(null);

    const airportMarkers = useAtomValue(airportMarkerAtom);
    const polylines = useAtomValue(polylinesAtom);
    const [iataMarkerToDelete, setIATAMarkerToDelete] = useAtom(markerDeletionAtom);

    /**
     * Tracks browser window width for responsiveness
     * Returns a number to set the map zoom directly
     */
    function getResponsiveZoom() {

        const width = window.innerWidth;
        if (width < 480) return 0.8;
        if (width < 768) return 1.2;
        return 2;
    }

    /**
     * Removes all route lines from the map
     * @param drawInstance
     */
    const clearPolylines = (drawInstance: MapboxDraw | null) => {
        if (drawInstance) {
            drawInstance.deleteAll();
        }
    }

    useEffect(() => {
        const initialZoom = getResponsiveZoom();

        mapboxgl.accessToken = import.meta.env.VITE_MAP_ACCESS_TOKEN
        if (mapContainerRef.current) {
            mapRef.current = new mapboxgl.Map({
                container: mapContainerRef.current,
                center: [-74.0242, 40.6941],
                zoom: initialZoom
            });
        }

        /**
         * Resizes the map according to the current window width
         */
        const handleResize = () => {
            if (mapRef.current) {
                const newZoom = getResponsiveZoom();
                mapRef.current.easeTo({zoom: newZoom, duration: 500});
                mapRef.current.resize();
            }
        }

        window.addEventListener('resize', handleResize);

        return () => {
            mapRef.current?.remove();
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

        console.log('Markers length', airportMarkers.length);

        if (!markerRef.current.some(markedAirport => markedAirport.iata === unmarkedAirport.iata)) {
            console.log('Entered marker creation')
            const marker: AirportMarker = new mapboxgl.Marker({
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
        }

        // Cleanup function interferes with the marker list persistence, hence disabled
    }, [airportMarkers])

    useEffect(() => {
        if (iataMarkerToDelete !== '') {
            console.log('Entered marker deletion block')
            const updatedMarkers = markerRef.current?.filter(marker => {
                if (marker.iata === iataMarkerToDelete) {
                    marker.remove();
                }
            });
            markerRef.current.push(...updatedMarkers);
            setIATAMarkerToDelete('');
        }
    }, [iataMarkerToDelete]);

    useEffect(() => {
        if (!mapRef.current) return;

        const mapInstance = mapRef.current; // Get the current map instance

        /**
         * Initializes and adds geodesic draw tool reference for creating polyline-based routes
         */
        const initGeodesicDrawTool = () => {
            let modes = MapboxDraw.modes;
            modes = MapboxDrawGeodesic.enable(modes);

            drawRef.current = new MapboxDraw({
                // ignore ts assertions until a proper declaration is available
                // @ts-ignore
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

        /**
         * Adds polar cap centers, dashed circular boundary and labels
         */
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
            initGeodesicDrawTool();
            loadPolarCircles();
        });

        return () => {
            if (mapInstance && drawRef.current) {
                clearPolylines(drawRef.current); // Clear all features managed by Draw
                mapInstance.removeControl(drawRef.current);
                drawRef.current = null; // Clear the ref
                mapInstance.off('load', initGeodesicDrawTool); // Remove event listener
                mapInstance.off('load', loadPolarCircles);
            }
        };
    }, []);

    useEffect(() => {
        if (!mapRef.current || !drawRef.current) {
            return;
        }

        /**
         * Creates a new polyline route from the latest addition to the polyline tracking list
         */
        const addPolylines = () => {
            const newPolyline = polylines[polylines.length - 1];
            const airportsInRouteSet = new Set(newPolyline.airports);   // contains IATA list

            // adding a counter to make deletion easier if airport NOT in more than one routes
            for (const airport of airportMarkers) {
                if (airportsInRouteSet.has(airport.iata)) {
                    if (typeof airport.usedInRoute === 'number') {
                        airport.usedInRoute += 1;
                    } else {
                        airport.usedInRoute = 1;
                    }
                }
            }

            console.log(airportMarkers);

            drawRef.current?.add({
                id: newPolyline.name,
                type: 'Feature',
                geometry: {
                    type: 'LineString',
                    coordinates: newPolyline.coordinates,
                },
                properties: {}
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