import * as turf from '@turf/turf';

const generateGreatCircle = (start, end, numPoints = 4) => {
    const startPoint = turf.point(start);  // Start coordinates [longitude, latitude]
    const endPoint = turf.point(end);      // End coordinates [longitude, latitude]

    const greatCircle = turf.greatCircle(startPoint, endPoint, {npoints: numPoints});
    const gcCoordinates = greatCircle.geometry.coordinates;

    if (Array.isArray(gcCoordinates[0]) && Array.isArray(gcCoordinates[0][0])) {
        return gcCoordinates.flat();
    }

    return gcCoordinates;
};

const createGCPaths = (currentAirportMarkers) => {
    let allCoordinates = [];

    for (let i = 0; i < currentAirportMarkers.length - 1; i++) {
        const start = [currentAirportMarkers[i].long, currentAirportMarkers[i].lat];
        const end = [currentAirportMarkers[i + 1].long, currentAirportMarkers[i + 1].lat];

        // Generate the great circle path between consecutive markers
        const greatCircleCoordinates = generateGreatCircle(start, end);

        // Append the great circle coordinates to the allCoordinates array
        allCoordinates = allCoordinates.concat(greatCircleCoordinates);

        return allCoordinates;
    }
}

export {createGCPaths};