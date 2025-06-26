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

export {sourceArcticCircle, sourceAntarcticCircle, layerArcticCircle, layerAntarcticCircle};