import {atom} from 'jotai'
import {Airport, PolylineRoute} from "../types/global.types.ts";

export const airportMarkerAtom = atom<Airport[]>([])
export const currentAirportMarkerAtom = atom<Airport[]>([])
export const polylinesAtom = atom<PolylineRoute[]>([])