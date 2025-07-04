import {atom} from 'jotai'
import {Airport, PolylineRoute} from "@customTypes/global.types.ts";

export const airportMarkerAtom = atom<Airport[]>([])
export const currentAirportMarkerAtom = atom<Airport[]>([])
export const polylinesAtom = atom<PolylineRoute[]>([])
export const markerDeletionAtom = atom<string>('')
export const lookupActiveAtom = atom<boolean>(false)