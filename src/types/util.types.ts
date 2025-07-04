export type GCCoordinates = [number, number][] | [number, number][][];
export type Coordinate = [number, number];

export enum LookupState {
    IDLE = 'IDLE',
    LOADING = 'LOADING',
    ERROR = 'ERROR',
    HASDATA = 'HASDATA',
    NODATA = 'NODATA',
}