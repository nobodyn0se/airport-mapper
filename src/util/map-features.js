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

export {sourceArcticCircle, sourceAntarcticCircle}