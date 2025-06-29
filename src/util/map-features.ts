import {antarcticCircle, arcticCircle} from "@util/util.ts";
import {GeoJSONSourceSpecification, LineLayerSpecification, SymbolLayerSpecification} from "mapbox-gl";

const sourceArcticCircle: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: [
            arcticCircle,
        ]
    }
};

const sourceAntarcticCircle: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
        type: 'FeatureCollection',
        features: [
            antarcticCircle,
        ]
    }
};

const layerArcticCircle: LineLayerSpecification = {
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

const layerAntarcticCircle: LineLayerSpecification = {
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

const sourceArcticCenter: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, 90]
        },
        properties: {}
    },
};
const layerArcticLabel: SymbolLayerSpecification = {
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
const sourceAntarcticCenter: GeoJSONSourceSpecification = {
    type: 'geojson',
    data: {
        type: 'Feature',
        geometry: {
            type: 'Point',
            coordinates: [0, -85]
        },
        properties: {}
    }
};
const layerAntarcticLabel: SymbolLayerSpecification = {
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