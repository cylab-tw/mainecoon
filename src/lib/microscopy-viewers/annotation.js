import { Geometry, LineString, MultiPoint, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { multipartDecode } from '../utils/multipart';

// If you want to pretend that there is a direct import while in JS (for developer clarity), add a JSDoc reference
/**
 * @typedef {import("../dicom-webs/series").AnnotationInfo} AnnotationInfo
 */

/**
 * Decodes base64 encoded data into an ArrayBuffer and converts it into a Float64Array or Float32Array based on the VR value.
 * @param {string | ArrayBuffer[]} encodedData - The encoded data.
 * @param {string} vr - The value representation to decide the data type for decoding.
 * @returns {Float64Array | Float32Array} The decoded coordinate data.
 */
const decodeCoordinatesData = (encodedData, vr) => {
    let buffer;

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

    if (vr === 'OD') {
        return new Float64Array(buffer);
    }

    return new Float32Array(buffer);
};

/**
 * Decodes base64 encoded data into an ArrayBuffer and converts it into a Uint32Array.
 * @param {string | ArrayBuffer[]} encodedData - The encoded data.
 * @returns {Uint32Array} The decoded index data.
 */
const decodeIndexesData = (encodedData) => {
    let buffer;

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

    return new Uint32Array(buffer);
};

/**
 * Calculates ellipse points given four control points.
 * @param {Array<Array<number>>} points - The control points [highest, lowest, leftmost, rightmost].
 * @returns {Array<Array<number>>} An array of points defining the ellipse.
 */
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

/**
 * Computes annotation features from given annotation data and resolutions.
 * @param {Array<Object>|undefined} annotations - Array of annotation data or undefined.
 * @param {Array<Object>} resolutions - Array of objects containing instanceUID and resolution data.
 * @returns {Array<Feature<Geometry>>} Array of OpenLayers feature objects.
 */
export const computeAnnotationFeatures = async (annotations, resolutions) => {
    const features = [];

    if (annotations.length === 0) {
        return [];
    }

    for (const { instanceUID, pointsData, indexesData, graphicType } of annotations ?? []) {
        let points;
        let indexes;

        if (pointsData.inlineBinary) {
            points = decodeCoordinatesData(pointsData.inlineBinary, pointsData.vr);
        } else if (pointsData.uri) {
            const response = await fetch(pointsData.uri);
            points = decodeCoordinatesData(multipartDecode(await response.arrayBuffer()), pointsData.vr);
        }

        let referencedResolution = resolutions.find((res) => res.instanceUID === instanceUID)?.resolution;
        if (!referencedResolution) {
            referencedResolution = resolutions[resolutions.length - 1].resolution;
            console.warn(`The referenced instance "${instanceUID}" could not be found, using the highest resolution.`);
        }

        console.log(referencedResolution);
        console.log(resolutions);

        points = points?.map((point) => point * referencedResolution);

        if (indexesData) {
            if (indexesData.inlineBinary) {
                indexes = decodeIndexesData(indexesData.inlineBinary);
            } else if (indexesData.uri) {
                const response = await fetch(indexesData.uri);
                indexes = decodeIndexesData(multipartDecode(await response.arrayBuffer()));
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
                features.push(new Feature({ geometry: new MultiPoint(coordinates) }));
                break;
            case 'POLYLINE':
                for (let i = 0; i < indexes.length; i++) {
                    const coord = coordinates.slice(indexes[i], indexes[i + 1] || coordinates.length);
                    if (coord && coord.length > 1) {
                        features.push(new Feature({ geometry: new LineString(coord) }));
                    }
                }
                break;
            case 'POLYGON':
                for (let i = 0; i < indexes.length; i++) {
                    const start = Math.floor(indexes[i] / 2);
                    const end = Math.floor(indexes[i + 1] / 2) || coordinates.length;
                    const coord = coordinates.slice(start, end).concat([coordinates[start]]);
                    if (coord && coord.length > 1) {
                        features.push(new Feature({ geometry: new Polygon([coord]) }));
                        console.log(coord.shift(), coord.pop());
                    }
                }
                break;
            case 'ELLIPSE':
                for (let i = 0; i < coordinates.length; i += 4) {
                    const coord = calculateEllipsePoints(coordinates.slice(i, i + 4));
                    const polygon = new Polygon([coord]);
                    features.push(new Feature({ geometry: polygon }));
                }
                break;
            case 'RECTANGLE':
                for (let i = 0; i < coordinates.length; i += 4) {
                    const polygon = new Polygon([coordinates.slice(i, i + 4).concat([coordinates[i]])]);
                    features.push(new Feature({ geometry: polygon }));
                }
                break;
            default:
                console.error('Unrecognized graphic type: ', graphicType);
        }
    }

    return features;
};
