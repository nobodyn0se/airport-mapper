import * as turf from '@turf/turf';
import {Airport, PolylineRoute} from "@customTypes/global.types.ts";
import {Coordinate, GCCoordinates} from "@customTypes/util.types.ts";
import {Feature, Polygon} from "geojson";

/**
 * Create a 1-level nested array of [numPoints] coordinates between start and end having format Coordinate
 * @param start
 * @param end
 * @param numPoints
 * @returns {Coordinate[]} coordinates of the great distance of type {@link Coordinate}
 */
const generateGreatCircle = (start: Coordinate, end: Coordinate, numPoints = 10): Coordinate[] => {
    const startPoint = turf.point(start);  // Start coordinates [longitude, latitude]
    const endPoint = turf.point(end);      // End coordinates [longitude, latitude]

    const greatCircle = turf.greatCircle(startPoint, endPoint, {npoints: numPoints});
    const gcCoordinates = greatCircle.geometry.coordinates as GCCoordinates;

    if (Array.isArray(gcCoordinates[0]) && Array.isArray(gcCoordinates[0][0])) {
        return gcCoordinates.flat() as Coordinate[];
    }
    return gcCoordinates as Coordinate[];
};

/**
 * Creates a custom object containing the great circle path for a given route with coordinates and distance for each subroute
 * @param currentAirportMarkers
 * @returns {coordinates: Coordinate[], distance: number[]} object containing a list of coordinates and corresponding great circle distance
 */
const createGCPaths = (currentAirportMarkers: Airport[]): { coordinates: Coordinate[], distance: number[] } => {
    let allCoordinates: Coordinate[] = [];
    let gcDistance: number[] = [];

    for (let i = 0; i < currentAirportMarkers.length - 1; ++i) {
        const start: Coordinate = [currentAirportMarkers[i].long, currentAirportMarkers[i].lat];
        const end: Coordinate = [currentAirportMarkers[i + 1].long, currentAirportMarkers[i + 1].lat];

        gcDistance.push(turf.distance(turf.point(start), turf.point(end)));

        // Generate the great circle path between consecutive markers
        const greatCircleCoordinates = generateGreatCircle(start, end);

        // Append the great circle coordinates to the allCoordinates array
        allCoordinates = allCoordinates.concat(greatCircleCoordinates);
    }

    return {coordinates: allCoordinates, distance: gcDistance};
}

/**
 * Create a circle of [radiumKm] kilometers with center at (0, lat)
 * @param lat
 * @param radiusKm
 * @param points
 * @returns {Feature<Polygon>} a circle polygon with provided center and radius
 */
const createPolarCircle = (lat: number, radiusKm: number, points = 64): Feature<Polygon> => {
    return turf.circle([0, lat], radiusKm, {
        steps: points,
        units: 'kilometers'
    });
}

const polarRadiusKm = 1100;

const arcticCircle = createPolarCircle(89.9, polarRadiusKm);     // Arctic circle
const antarcticCircle = createPolarCircle(-89.9, polarRadiusKm);      // Antarctic circle

/**
 * Creates a polyline path for a given route with added properties like name of the route and IATA list of airports in the route
 * @param currentAirportMarkers
 * @returns {PolylineRoute} custom polyline object containing route data
 */
function createNewPolylineRoute(currentAirportMarkers: Airport[]): PolylineRoute {
    const routePath = createGCPaths(currentAirportMarkers);
    const airportsIATAList = currentAirportMarkers.map(airport => airport.iata);
    const routeName = 'Route ' + airportsIATAList.join('-');

    return {
        id: `poly-${Date.now()}`,
        coordinates: routePath.coordinates,            // use createGCPaths() above
        distance: routePath.distance,
        totalRouteDistance: calculateTotalDistance(routePath.distance),
        name: routeName,
        airports: airportsIATAList
    };
}

function calculateTotalDistance(distanceList: number[]): number {
    return Math.round(distanceList.reduce((total, distance) => total + distance, 0));
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
    calculateTotalDistance
    // filterRouteLine
};