import * as turf from '@turf/turf';
import {Airport, PolylineRoute} from "@customTypes/global.types.ts";
import {GCCoordinates} from "@customTypes/util.types.ts";

const generateGreatCircle = (start: [number, number], end: [number, number], numPoints = 10): [number, number][] => {
    const startPoint = turf.point(start);  // Start coordinates [longitude, latitude]
    const endPoint = turf.point(end);      // End coordinates [longitude, latitude]

    const greatCircle = turf.greatCircle(startPoint, endPoint, {npoints: numPoints});
    const gcCoordinates = greatCircle.geometry.coordinates as GCCoordinates;

    if (Array.isArray(gcCoordinates[0]) && Array.isArray(gcCoordinates[0][0])) {
        return gcCoordinates.flat() as [number, number][];
    }
    return gcCoordinates as [number, number][];
};

const createGCPaths = (currentAirportMarkers: Airport[]) => {
    let allCoordinates: [number, number][] = [];
    let gcDistance: number[] = [];

    for (let i = 0; i < currentAirportMarkers.length - 1; ++i) {
        const start: [number, number] = [currentAirportMarkers[i].long, currentAirportMarkers[i].lat];
        const end: [number, number] = [currentAirportMarkers[i + 1].long, currentAirportMarkers[i + 1].lat];

        gcDistance.push(turf.distance(turf.point(start), turf.point(end)));

        // Generate the great circle path between consecutive markers
        const greatCircleCoordinates = generateGreatCircle(start, end);

        // Append the great circle coordinates to the allCoordinates array
        allCoordinates = allCoordinates.concat(greatCircleCoordinates);
    }

    return {coordinates: allCoordinates, distance: gcDistance};
}

const createPolarCircle = (lat: number, radiusKm: number, points = 64) => {
    return turf.circle([0, lat], radiusKm, {
        steps: points,
        units: 'kilometers'
    });
}

const polarRadiusKm = 1100;

const arcticCircle = createPolarCircle(89.9, polarRadiusKm);     // Arctic circle
const antarcticCircle = createPolarCircle(-89.9, polarRadiusKm);      // Antarctic circle

function createNewPolylineRoute(currentAirportMarkers: Airport[]): PolylineRoute {
    const routePath = createGCPaths(currentAirportMarkers);
    const airportsIATAList = currentAirportMarkers.map(airport => airport.iata);
    const routeName = 'Route ' + airportsIATAList.join('-');

    return {
        id: `poly-${Date.now()}`,
        coordinates: routePath.coordinates,            // use createGCPaths() above
        distance: routePath.distance,
        name: routeName,
        airports: airportsIATAList
    };
}

// function doesRoutePassPoles(routeLineString, polarCircle) {
//     // routeLineString must be turf.lineString(geometry.coordinates)
//     return turf.booleanIntersects(routeLineString, polarCircle);
// }
//
// function filterRouteInsidePole(routeLineString, polarCircle) {
//     turf.lineSlice(turf.point(polarCircle.geometry.coordinates[0]), routeLineString, polarCircle);
// }
//
// function filterRouteLine(routeLine) {
//     const lineString = turf.lineString(routeLine.geometry.coordinates);
//     const intersectsArctic = doesRoutePassPoles(lineString, arcticCircle);
//     const intersectsAntarctic = doesRoutePassPoles(lineString, antarcticCircle);
//
//     if (intersectsArctic) {
//         console.log('Line intersects Arctic Circle');
//         return filterRouteInsidePole(lineString, arcticCircle);
//     }
//
//     if (intersectsAntarctic) {
//         console.log('Line intersects Antarctic Circle');
//         return filterRouteInsidePole(lineString, antarcticCircle);
//     }
//
//     console.log('Line does not intersect any circle');
//     return routeLine;
// }

export {
    createGCPaths, arcticCircle, antarcticCircle, createNewPolylineRoute,
    // filterRouteLine
};