import {antarcticCircle, arcticCircle} from "./util.js";

const sourceArcticCircle = {
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: [
            arcticCircle,
        ]
    }
};

const sourceAntarcticCircle = {
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: [
            antarcticCircle,
        ]
    }
};

const layerArcticCircle = {
    id: 'arctic-circle-line',
    type: 'line',
    source: 'arctic-circle',
    paint: {
        'line-color': 'gray',
        'line-width': 4,
        'line-dasharray': [10, 15],
    },
    layout: {
        'line-join': 'round',
        'line-cap': 'round'
    }
};

const layerAntarcticCircle = {
    id: 'antarctic-circle-line',
    type: 'line',
    source: 'antarctic-circle',
    paint: {
        'line-color': 'gray',
        'line-width': 4,
        'line-dasharray': [10, 15],
    },
    layout: {
        'line-join': 'round',
        'line-cap': 'round'
    }
};

const sourceArcticCenter = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 90]
        }
    }
};
const layerArcticLabel = {
    id: 'arctic-circle-label',
    type: 'symbol',
    source: 'arctic-circle-center',
    layout: {
        'text-field': 'North Pole Exclusion Zone',
        'text-size': 12,
        'text-allow-overlap': true,
        'text-ignore-placement': true
    },
    paint: {
        'text-color': 'black',
        'text-halo-color': 'white',
        'text-halo-width': 2
    }
};
const sourceAntarcticCenter = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, -85]
        }
    }
};
const layerAntarcticLabel = {
    id: 'antarctic-circle-label',
    type: 'symbol',
    source: 'antarctic-circle-center',
    layout: {
        'text-field': 'South Pole Exclusion Zone',
        'text-size': 12,
        'text-allow-overlap': true,
        'text-ignore-placement': true
    },
    paint: {
        'text-color': 'black',
        'text-halo-color': 'white',
        'text-halo-width': 2
    }
};

export {
    sourceArcticCircle,
    sourceAntarcticCircle,
    layerArcticCircle,
    layerAntarcticCircle,
    sourceArcticCenter,
    layerArcticLabel,
    sourceAntarcticCenter,
    layerAntarcticLabel
};