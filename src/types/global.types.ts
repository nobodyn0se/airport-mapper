import {Marker} from "mapbox-gl";

export type Airport = {
    name: string;
    icao: string;
    iata: string;
    lat: number;
    long: number;
    municipality: string;
    country: string;
    usedInRoute?: number
};

export type PolylineRoute = {
    id: string;
    coordinates: [number, number][];
    distance: number[];
    totalRouteDistance: number;
    name: string;
    airports: string[];
}

export interface AirportMarker extends Marker {
    iata?: string;
}