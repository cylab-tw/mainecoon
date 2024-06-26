import { DicomTags, fetchDicomJson } from '../dicom-webs/index.js';
import {combineUrl} from "../search/index.js";

/**
 * Information about an annotation within a DICOM study.
 * @typedef {Object} AnnotationInfo
 * @property {string} modality - The imaging modality.
 * @property {string} instanceUID - Unique identifier for the instance.
 * @property {string} graphicType - The type of graphic (e.g., POLYLINE, POLYGON).
 * @property {Object} pointsData - Detailed data about points, can contain binary data or a URI.
 * @property {Object} indexesData - Data about indexes, can contain binary data or a URI.
 */


/**
 * Retrieves series information based on given UIDs.
 * @param {string} baseUrl - The base URL for the DICOM web server.
 * @param {string} studyUid - The study UID.
 * @param {string} seriesUid - The series UID.
 * @returns {Promise<Object|null>} The series information or null if no data is found.
 */
export const getSeriesInfo = async (baseUrl, studyUid, seriesUid) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/metadata' });
    if (!dicomJson || dicomJson.length === 0) {
        return null;
    }

    const metadata = dicomJson[0];
    const modality = metadata[DicomTags.Modality]?.Value?.[0];

    if (modality === 'SM') {
        return {
            modality,
            imageType: metadata[DicomTags.ImageType]?.Value,
        };
    } else if (modality === 'ANN') {
        const referencedSeriesSequence = metadata[DicomTags.ReferencedSeriesSequence]?.Value?.[0];
        return {
            modality,
            referencedSeriesUid: referencedSeriesSequence[DicomTags.SeriesInstanceUID]?.Value?.[0] ?? '',
        };
    }

    return null;
};

/**
 * Sorts imaging information by the total pixel matrix size and number of frames.
 * @param {Object} a - The first imaging information.
 * @param {Object} b - The second imaging information.
 * @returns {number} Sorting order number.
 */
export const sortImagingInfo = (a, b) => {
    if (!a || !b) return 0;
    const aSize = a.totalPixelMatrixColumns * a.totalPixelMatrixRows;
    const bSize = b.totalPixelMatrixColumns * b.totalPixelMatrixRows;
    return aSize === bSize ? a.numberOfFrames - b.numberOfFrames : aSize - bSize;
};

/**
 * Retrieves detailed imaging information for each instance in a series.
 * @param {string} baseUrl - The base URL for the DICOM web server.
 * @param {string} studyUid - The study UID.
 * @param {string} seriesUid - The series UID.
 * @returns {Promise<Array>} Array of imaging information.
 */
export const getImagingInfo = async (baseUrl, studyUid, seriesUid) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/instances' });
    const instanceUids = dicomJson.map(instance => instance[DicomTags.SOPInstanceUID]?.Value?.[0]);
    const metadata = (await Promise.all(instanceUids.map(instanceUid => fetchDicomJson({ baseUrl, studyUid, seriesUid, instanceUid, pathname: '/metadata' })))).flat();

    const instances = metadata.map((metadata,index) => {
        // const modality = metadata[DicomTags.Modality]?.Value?.[0];
        const modality = metadata[DicomTags.Modality]?.Value?.[0];

        if (modality === 'SM') {
            return {
                modality,
                imageType: metadata[DicomTags.ImageType]?.Value,
                instanceUID: metadata[DicomTags.SOPInstanceUID]?.Value?.[0],
                numberOfFrames: metadata[DicomTags.NumberOfFrames]?.Value?.[0],
                rows: metadata[DicomTags.Rows]?.Value?.[0],
                columns: metadata[DicomTags.Columns]?.Value?.[0],
                pixelSpacing: metadata[DicomTags.PixelSpacing]?.Value,
                totalPixelMatrixColumns: metadata[DicomTags.TotalPixelMatrixColumns]?.Value?.[0],
                totalPixelMatrixRows: metadata[DicomTags.TotalPixelMatrixRows]?.Value?.[0],
            };
        }
    });


    return instances.filter(isValidSmImage).sort(sortImagingInfo);
};

const isValidSmImage = image => {
    if (!image) return false;
    return !image.imageType.includes('LABEL') && !image.imageType.includes('OVERVIEW');
};

/**
 * Retrieves annotation information for instances in a series.
 * @param {string} baseUrl - The base URL for the DICOM web server.
 * @param {string} studyUid - The study UID.
 * @param {string} seriesUid - The series UID.
 * @returns {Promise<Array>} Array of annotation information.
 */
export const getAnnotations = async (baseUrl, studyUid, seriesUid) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/instances' });
    const instanceUids = dicomJson.map(instance => instance[DicomTags.SOPInstanceUID]?.Value?.[0]);
    const metadata = (await Promise.all(instanceUids.map(instanceUid => fetchDicomJson({ baseUrl, studyUid, seriesUid, instanceUid, pathname: '/metadata' })))).flat();
    const instances = metadata.flatMap(metadata => {
        const modality = metadata[DicomTags.Modality]?.Value?.[0];
        const referencedSeriesSequence = metadata[DicomTags.ReferencedSeriesSequence]?.Value?.[0];
        const referencedInstance = referencedSeriesSequence[DicomTags.ReferencedInstanceSequence]?.Value?.[0];
        const annotations = metadata[DicomTags.AnnotationGroupSequence]?.Value;
        return annotations.map(annotation => {
            let coordinates = annotation[DicomTags.PointCoordinatesData];
            coordinates ??= annotation[DicomTags.DoublePointCoordinatesData];
            const name = annotation[DicomTags.GroupName];
            const indexes = annotation[DicomTags.LongPrimitivePointIndexList];
            const graphicType = annotation[DicomTags.GraphicType]?.Value?.[0];
            const hasIndexes = graphicType === 'POLYLINE' || graphicType === 'POLYGON';

            if (modality === 'ANN') {
                return {
                    modality,
                    annGroupName:name,
                    instanceUID: referencedInstance[DicomTags.ReferencedSOPInstanceUID]?.Value?.[0],
                    pointsData: {
                        vr: coordinates.vr,
                        ...(coordinates.BulkDataURI ? { uri: coordinates.BulkDataURI } : { inlineBinary: coordinates.InlineBinary }),
                    },
                    indexesData: hasIndexes ? {
                        vr: indexes.vr,
                        ...(indexes.BulkDataURI ? { uri: indexes.BulkDataURI } : { inlineBinary: indexes.InlineBinary }),
                    } : {},
                    graphicType,
                };

            }
        });
    });

    return instances.filter(Boolean);
};

export const getAnnotationsGroup = async (baseUrl, studyUid, seriesUid) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/instances' });
    const instanceUids = dicomJson.map(instance => instance[DicomTags.SOPInstanceUID]?.Value?.[0]);
    const metadata = (await Promise.all(instanceUids.map(instanceUid => fetchDicomJson({ baseUrl, studyUid, seriesUid, instanceUid, pathname: '/metadata' })))).flat();
    const metadatas = metadata.flatMap(metadata => {
        const modality = metadata[DicomTags.Modality]?.Value?.[0];
        if (modality === 'ANN') return metadata

    });
    return metadatas.flat(Boolean);
}