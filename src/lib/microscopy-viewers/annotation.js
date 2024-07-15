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
    console.log('annotations:', annotations);
    console.log('resolutions:', resolutions);
    const features = [];
    let groups = [];
    if (annotations.length === 0) return [];

    for (let index = 0; index < annotations.length; index++) {
        let feature = []
        const {group, referencedInstanceUID, pointsData, indexesData, graphicType} = annotations[index];
        groups.push(group)
        let points, indexes;
        if (pointsData.inlineBinary) {
            points = decodeData(pointsData.inlineBinary, pointsData.vr);
        } else if (pointsData.uri) {
            const response = await fetch(pointsData.uri);
            const vr = pointsData.vr === 'UR' ? 'OF' : pointsData.vr;
            points = decodeData(multipartDecode(await response.arrayBuffer()), vr);
        }

        let referencedResolution = resolutions.find((res) => res.instanceUID === referencedInstanceUID)?.resolution;
        if (!referencedResolution) {
            referencedResolution = resolutions[resolutions.length - 1].resolution
        }
        points = points?.map((point) => point * referencedResolution)

        if (indexesData) {
            if (indexesData.inlineBinary) {
                indexes = decodeData(indexesData.inlineBinary, indexesData.vr);
            } else if (indexesData.uri) {
                const response = await fetch(indexesData.uri);
                const vr = pointsData.vr === 'UR' ? 'OL' : pointsData.vr;
                indexes = decodeData(multipartDecode(await response.arrayBuffer()),vr);
            }
        }

        // Decrement indexes by 1 to match the 0-based index
        indexes = indexes?.map((index) => index - 1);

        if (!points || points.length === 0) {
            continue;
        }

        const coordinates = [];
        let hasNegativeCoordinates = false;

        for (let i = 0; i < points.length; i += 2) {
            const [x, y] = [points[i], points[i + 1]];
            if (x < 0 || y < 0) hasNegativeCoordinates = true;
            coordinates.push([points[i], -points[i + 1]]);
        }

        if (hasNegativeCoordinates) {
            console.warn('Detected negative coordinates, some annotations may be out of bounds.');
        }

        if ((graphicType === 'POLYLINE' || graphicType === 'POLYGON') && !indexes) {
            console.warn('Missing indexes data for graphic type: ', graphicType);
            continue;
        }

        switch (graphicType) {
            case 'POINT':
                feature.push(new Feature({geometry: new MultiPoint(coordinates)}));
                break;
            case 'POLYLINE': {
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
                break;
            }
            case 'POLYGON': {
                let polygonCoords = [];
                for (let i = 0; i < indexes.length; i++) {
                    const start = Math.floor(indexes[i] / 2);
                    const end = Math.floor(indexes[i + 1] / 2) || coordinates.length;
                    const coord = coordinates.slice(start, end).concat([coordinates[start]]);
                    if (coord && coord.length > 1) {
                        polygonCoords.push([coord]);
                        if (polygonCoords.length > 10000) {
                            feature.push(new Feature({ geometry: new MultiPolygon(polygonCoords) }));
                            polygonCoords = [];
                        }
                    }
                }
                if (polygonCoords.length > 0) {
                    feature.push(new Feature({ geometry: new MultiPolygon(polygonCoords) }));
                }
                break;
            }
            case 'ELLIPSE': {
                let ellipseCoords = [];
                for (let i = 0; i < coordinates.length; i += 4) {
                    const coord = calculateEllipsePoints(coordinates.slice(i, i + 4));
                    ellipseCoords.push([coord]);
                    if (ellipseCoords.length > 10000) {
                        feature.push(new Feature({ geometry: new MultiPolygon(ellipseCoords) }));
                        ellipseCoords = [];
                    }
                }
                if (ellipseCoords.length > 0) {
                    feature.push(new Feature({ geometry: new MultiPolygon(ellipseCoords) }));
                }
                break;
            }
            case 'RECTANGLE': {
                let rectangleCoords = [];
                for (let i = 0; i < coordinates.length; i += 4) {
                    const coord = coordinates.slice(i, i + 4).concat([coordinates[i]]);
                    rectangleCoords.push([coord]);
                    if (rectangleCoords.length > 10000) {
                        feature.push(new Feature({ geometry: new MultiPolygon(rectangleCoords) }));
                        rectangleCoords = [];
                    }
                }
                if (rectangleCoords.length > 0) {
                    feature.push(new Feature({ geometry: new MultiPolygon(rectangleCoords) }));
                }
                break;
            }
            default:
                console.error('Unrecognized graphic type: ', graphicType);
        }

        features.push(feature)
    }
    return {features, groups};
};
