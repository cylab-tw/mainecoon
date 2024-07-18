import {MultiLineString, MultiPoint, MultiPolygon, Polygon} from 'ol/geom';
import {Feature} from 'ol';
import {multipartDecode} from '../utils/multipart';

const decodeData = (encodedData, vr) => {
    let buffer;
    if (!encodedData) {
        return null
    }
    if (typeof encodedData === 'string') {
        const decodedData = atob(encodedData);

        const byteArray = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
            byteArray[i] = decodedData.charCodeAt(i);
        }

        buffer = byteArray.buffer;
    } else {
        buffer = encodedData[0];
    }

    switch (vr) {
        case 'OL':
            return new Uint32Array(buffer);
        case 'OF':
            return new Float32Array(buffer);
        case 'OD':
            return new Float64Array(buffer);
        default:
            return new TextDecoder().decode(buffer);
    }
}

const calculateEllipsePoints = (points) => {
    const [highest, lowest, leftmost, rightmost] = points;
    const a = Math.sqrt((rightmost[0] - leftmost[0]) ** 2 + (rightmost[1] - leftmost[1]) ** 2) / 2;
    const b = Math.sqrt((highest[0] - lowest[0]) ** 2 + (highest[1] - lowest[1]) ** 2) / 2;
    const h = (leftmost[0] + rightmost[0]) / 2;
    const k = (highest[1] + lowest[1]) / 2;
    const theta = Math.atan2(rightmost[1] - leftmost[1], rightmost[0] - leftmost[0]);

    const pointsOnEllipse = [];
    for (let i = 0; i < 50; i++) {
        const t = (2 * Math.PI * i) / 50;
        const xPrime = a * Math.cos(t) * Math.cos(theta) - b * Math.sin(t) * Math.sin(theta) + h;
        const yPrime = a * Math.cos(t) * Math.sin(theta) + b * Math.sin(t) * Math.cos(theta) + k;
        pointsOnEllipse.push([xPrime, yPrime]);
    }

    return pointsOnEllipse;
};

export const computeAnnotationFeatures = async (annotations, resolutions) => {
    const features = [];
    let groups;
    if (Object.keys(annotations).length === 0) return { features, groups };
    const annotation = annotations;
    const { group, referencedInstanceUID,seriesUid } = annotation[0];
    groups = group

    const referencedResolution = resolutions.find(res => res.instanceUID === referencedInstanceUID)?.resolution
        || resolutions[resolutions.length - 1].resolution;

    let points, indexes;
    await Promise.all(Object.values(group).map(async (g) => {
        const feature = [];
        const { pointsData, indexesData, graphicType } = g

        if (pointsData.inlineBinary) {
            points = decodeData(pointsData.inlineBinary, pointsData.vr);
        } else if (pointsData.uri) {
            const response = await fetch(pointsData.uri);
            const vr = pointsData.vr === 'UR' ? 'OF' : pointsData.vr;
            points = decodeData(multipartDecode(await response.arrayBuffer()), vr);
        }

        if (indexesData) {
            if (indexesData.inlineBinary) {
                indexes = decodeData(indexesData.inlineBinary, indexesData.vr);
            } else if (indexesData.uri) {
                const response = await fetch(indexesData.uri);
                const vr = pointsData.vr === 'UR' ? 'OL' : pointsData.vr;
                indexes = decodeData(multipartDecode(await response.arrayBuffer()), vr);
            }
        }

        indexes = indexes?.map(index => index - 1);
        points = points?.map(point => point * referencedResolution);

        if (!points || points.length === 0) {
            console.warn('Missing points data for graphic type:', graphicType);
        }
        if (indexes && indexes.length === 0) {
            console.warn('Missing indexes data for graphic type:', graphicType);
        }

        const coordinates = [];
        let hasNegativeCoordinates = false;

        for (let i = 0; i < points.length; i += 2) {
            const x = points[i];
            const y = points[i + 1];
            if (x < 0 || y < 0) hasNegativeCoordinates = true;
            coordinates.push([x, -y]);
        }

        if (hasNegativeCoordinates) {
            console.warn('Detected negative coordinates, some annotations may be out of bounds.');
        }

        if ((graphicType === 'POLYLINE' || graphicType === 'POLYGON') && !indexes) {
            console.warn('Missing indexes data for graphic type:', graphicType);
        }

        switch (graphicType) {
            case 'POINT':
                feature.push(new Feature({ geometry: new MultiPoint(coordinates) }));
                break;
            case 'POLYLINE':
                handlePolylineFeature(feature, coordinates, indexes);
                break;
            case 'POLYGON':
                handlePolygonFeature(feature, coordinates, indexes);
                break;
            case 'ELLIPSE':
                handleEllipseFeature(feature, coordinates);
                break;
            case 'RECTANGLE':
                handleRectangleFeature(feature, coordinates);
                break;
            default:
                console.error('Unrecognized graphic type:', graphicType);
        }
        features.push(feature);
    }));

    return { features, groups,seriesUid };
};


const handlePolylineFeature = (feature, coordinates, indexes) => {
    let lineStringCoords = [];
    for (let i = 0; i < indexes.length; i++) {
        const coord = coordinates.slice(indexes[i], indexes[i + 1] || coordinates.length);
        if (coord && coord.length > 1) {
            lineStringCoords.push(coord);
            if (lineStringCoords.length > 10000) {
                feature.push(new Feature({geometry: new MultiLineString(lineStringCoords)}));
                lineStringCoords = [];
            }
        }
    }
    if (lineStringCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiLineString(lineStringCoords)}));
    }
};

const handlePolygonFeature = (feature, coordinates, indexes) => {
    let polygonCoords = [];
    for (let i = 0; i < indexes.length; i++) {
        const start = Math.floor(indexes[i] / 2);
        const end = Math.floor(indexes[i + 1] / 2) || coordinates.length;
        const coord = coordinates.slice(start, end).concat([coordinates[start]]);
        if (coord && coord.length > 1) {
            polygonCoords.push([coord]);
            if (polygonCoords.length > 10000) {
                feature.push(new Feature({geometry: new MultiPolygon(polygonCoords)}));
                polygonCoords = [];
            }
        }
    }
    if (polygonCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(polygonCoords)}));
    }
};

const handleEllipseFeature = (feature, coordinates) => {
    let ellipseCoords = [];
    for (let i = 0; i < coordinates.length; i += 4) {
        const coord = calculateEllipsePoints(coordinates.slice(i, i + 4));
        ellipseCoords.push([coord]);
        if (ellipseCoords.length > 10000) {
            feature.push(new Feature({geometry: new MultiPolygon(ellipseCoords)}));
            ellipseCoords = [];
        }
    }
    if (ellipseCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(ellipseCoords)}));
    }
};

const handleRectangleFeature = (feature, coordinates) => {
    let rectangleCoords = [];
    for (let i = 0; i < coordinates.length; i += 4) {
        const coord = coordinates.slice(i, i + 4).concat([coordinates[i]]);
        rectangleCoords.push([coord]);
        if (rectangleCoords.length > 10000) {
            feature.push(new Feature({geometry: new MultiPolygon(rectangleCoords)}));
            rectangleCoords = [];
        }
    }
    if (rectangleCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(rectangleCoords)}));
    }
};
