import { Geometry, LineString, MultiPoint, Polygon } from 'ol/geom';
import { Feature } from 'ol';
import { multipartDecode } from '../utils/multipart';
import { Projection } from 'ol/proj';
import { TileGrid } from 'ol/tilegrid';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import { XYZ } from 'ol/source';
import { getCenter } from 'ol/extent';
import { toDicomWebUrl } from '../dicom-webs';
/**
 * @typedef {import("../dicom-webs/series").AnnotationInfo} AnnotationInfo
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

const calculateEllipsePoints = (points) => {
    const [highest, lowest, leftmost, rightmost] = points;

    // Calculate semi-major axis (a) and semi-minor axis (b)
    const a = Math.sqrt((rightmost[0] - leftmost[0]) ** 2 + (rightmost[1] - leftmost[1]) ** 2) / 2;
    const b = Math.sqrt((highest[0] - lowest[0]) ** 2 + (highest[1] - lowest[1]) ** 2) / 2;

    // Determine the center (h, k) of the ellipse
    const h = (leftmost[0] + rightmost[0]) / 2;
    const k = (highest[1] + lowest[1]) / 2;

    // Estimate the rotation angle theta
    const theta = Math.atan2(rightmost[1] - leftmost[1], rightmost[0] - leftmost[0]);

    // Calculate 50 evenly distributed points along the ellipse
    const pointsOnEllipse = [];
    for (let i = 0; i < 50; i++) {
        const t = (2 * Math.PI * i) / 50;
        const xPrime = a * Math.cos(t) * Math.cos(theta) - b * Math.sin(t) * Math.sin(theta) + h;
        const yPrime = a * Math.cos(t) * Math.sin(theta) + b * Math.sin(t) * Math.cos(theta) + k;
        pointsOnEllipse.push([xPrime, yPrime]);
    }

    return pointsOnEllipse;
};

export const computeAnnotationFeatures = async (
    annotations,
    resolutions,
) => {
    const features = [];

    if (!annotations) {
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

        const referencedResolution = resolutions.find((res) => res.instanceUID === instanceUID)?.resolution;

        points = points?.map((point) => point * (referencedResolution || 0));

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

        for (let i = 0; i < points.length; i += 2) {
            coordinates.push([points[i], -points[i + 1]]);
        }

        if ((graphicType === 'POLYLINE' || graphicType === 'POLYGON') && !indexes) {
            // eslint-disable-next-line no-console
            console.warn('Missing indexes data for graphic type: ', graphicType);
            continue;
        }

        switch (graphicType) {
            case 'POINT':
                features.push(new Feature({ geometry: new MultiPoint(coordinates) }));
                break;
            case 'POLYLINE':
                if (indexes && coordinates) {
                    for (let i = 0; i < indexes.length; i++) {
                        const coord = coordinates.slice(indexes[i], indexes[i + 1] || coordinates.length);
                        if (coord.length > 1) {
                            features.push(new Feature({ geometry: new LineString(coord) }));
                        }
                    }
                }
                break;
            case 'POLYGON':
                if (indexes && coordinates) {
                    for (let i = 0; i < indexes.length; i++) {
                        const start = Math.floor(indexes[i] / 2);
                        const end = indexes[i + 1] ? Math.floor(indexes[i + 1] / 2) : coordinates.length;
                        const coord = coordinates.slice(start, end).concat([coordinates[start]]);
                        if (coord.length > 1) {
                            features.push(new Feature({ geometry: new Polygon([coord]) }));
                        }
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
                // eslint-disable-next-line no-console
                console.error('Unrecognized graphic type: ', graphicType);
        }
    }

    return features;
};

export const computePyramidInfo = (baseUrl, studyUid, seriesUid, images) => {
    const pyramidTileSizes = [];
    const pyramidGridSizes = [];
    const pyramidResolutions = [];
    const pyramidOrigins = [];
    const pyramidPixelSpacings = [];
    const pyramidImageSizes = [];
    const pyramidPhysicalSizes = [];
    const offset = [0, -1];
    // 因為image是陣列裡面的json ** ，所以我先寫死
    const baseTotalPixelMatrixColumns = images.length > 0 ? images[images.length - 1].totalPixelMatrixColumns : 0;
    const baseTotalPixelMatrixRows = images.length > 0 ? images[images.length - 1].totalPixelMatrixRows : 0;

    for (let j = images.length - 1; j >= 0; j--) {
        const image = images[j];
        const columns = image.columns;
        const rows = image.rows;
        const totalPixelMatrixColumns = image.totalPixelMatrixColumns;
        const totalPixelMatrixRows = image.totalPixelMatrixRows;
        const pixelSpacing = image.pixelSpacing || [1, 1];

        const nColumns = Math.ceil(totalPixelMatrixColumns / columns);
        const nRows = Math.ceil(totalPixelMatrixRows / rows);

        pyramidTileSizes.push([columns, rows]);
        pyramidGridSizes.push([nColumns, nRows]);
        pyramidPixelSpacings.push(pixelSpacing);

        pyramidImageSizes.push([totalPixelMatrixColumns, totalPixelMatrixRows]);
        pyramidPhysicalSizes.push([
            (totalPixelMatrixColumns * pixelSpacing[1]).toFixed(4),
            (totalPixelMatrixRows * pixelSpacing[0]).toFixed(4),
        ]);

        const zoomFactor = Math.round(baseTotalPixelMatrixColumns / totalPixelMatrixColumns);
        pyramidResolutions.push(zoomFactor);

        pyramidOrigins.push(offset);
    }

    pyramidResolutions.reverse();
    pyramidTileSizes.reverse();
    pyramidGridSizes.reverse();
    pyramidOrigins.reverse();
    pyramidPixelSpacings.reverse();
    pyramidImageSizes.reverse();
    pyramidPhysicalSizes.reverse();

    const resolutions = images.map(image => ({
        instanceUID: image.instanceUID,
        resolution: Math.round(baseTotalPixelMatrixColumns / image.totalPixelMatrixColumns),
    }));

    const extent = [0, -(baseTotalPixelMatrixRows + 1), baseTotalPixelMatrixColumns, -1];
    const projection = new Projection({ code: 'DICOM', units: 'm', global: true, extent: extent });

    const tileGrid = new TileGrid({
        extent: extent,
        origins: pyramidOrigins,
        resolutions: pyramidResolutions,
        sizes: pyramidGridSizes,
        tileSizes: pyramidTileSizes,
    });
    //console.log('extent',extent)

    const layer = new TileLayer({
        source: new XYZ({
            tileUrlFunction: ([z, x, y]) => {
                const { instanceUID, totalPixelMatrixColumns, columns } = images[z];
                const frame = x + y * Math.ceil(totalPixelMatrixColumns / columns) + 1;
                const url = toDicomWebUrl({
                    baseUrl: baseUrl,
                    studyUid: studyUid,
                    seriesUid: seriesUid,
                    instanceUid: instanceUID,
                    frame: frame,
                    pathname: '/rendered',
                });
                // console.log('Generated tile URL:', url);
                return url;
            },
            tileGrid: tileGrid,
            projection: projection,
            wrapX: false,
            maxZoom: pyramidResolutions.length - 1,
            minZoom: 0,
        }),
        extent: extent,
        visible: true,
        useInterimTilesOnError: false,
    });
    //console.log('pyramidResolutions:', pyramidResolutions);
    //console.log('pyramidTileSizes:', pyramidTileSizes);

    const view = new View({
        center: getCenter(extent),
        projection: projection,
        // resolutions: pyramidResolutions, // FIXME
        constrainOnlyCenter: false,
        smoothResolutionConstraint: true,
        showFullExtent: true,
        extent: extent,
        zoom: 2,
    });

    return { extent, layer, view, resolutions };
};