export type Airport = {
    name: string;
    icao: string;
    iata: string;
    lat: number;
    long: number;
    municipality: string;
    country: string;
};

export type PolylineRoute = {
    id: string;
    coordinates: [number, number][];
    distance: number[];
    name: string;
    airports: string[];
}