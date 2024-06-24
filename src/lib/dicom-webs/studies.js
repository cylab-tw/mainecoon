import { DicomTags, fetchDicomJson } from '../dicom-webs/index.js';

export const getStudiesByFilter = async (baseUrl, filter, fetcher = fetch) => {
    const searchParams = new URLSearchParams({ [DicomTags.ModalitiesInStudy]: 'SM' });
    if (filter.patientId) searchParams.set(DicomTags.PatientID, filter.patientId);
    if (filter.patientName) searchParams.set(DicomTags.PatientName, filter.patientName);
    if (filter.studyUid) searchParams.set(DicomTags.StudyInstanceUID, filter.studyUid);
    if (filter.accessionNumber) searchParams.set(DicomTags.AccessionNumber, filter.accessionNumber);
    if (filter.studyDate) searchParams.set(DicomTags.StudyDate, filter.studyDate);

    const dicomJson = await fetchDicomJson({ baseUrl, pathname: '/studies', searchParams }, fetcher);


    return dicomJson.map(study => ({
        studyDate: study[DicomTags.StudyDate]?.Value?.[0] ?? '',
        accessionNumber: study[DicomTags.AccessionNumber]?.Value?.[0] ?? '',
        modalities: study[DicomTags.ModalitiesInStudy]?.Value ?? '',
        patientName: study[DicomTags.PatientName]?.Value?.[0]?.Alphabetic ?? '',
        patientId: study[DicomTags.PatientID]?.Value?.[0] ?? '',
        patientBirthDate: study[DicomTags.PatientBirthDate]?.Value?.[0] ?? '',
        patientSex: study[DicomTags.PatientSex]?.Value?.[0] ?? '',
        studyUid: study[DicomTags.StudyInstanceUID]?.Value?.[0] ?? '',
    }));
};

const fetchSeriesMetadata = async (baseUrl, studyUid, seriesUid) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/metadata' });
    return dicomJson[0];
};

const toGraphicType = ann => ann[DicomTags.GraphicType]?.Value;

const getSeriesInstanceCount = async (baseUrl, studyUid, seriesUid, fetcher = fetch) => {
    if (!studyUid || !seriesUid) return null;
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, seriesUid, pathname: '/instances' }, fetcher);
    return dicomJson.length;
};

export const getStudyInfo = async (baseUrl, studyUid, fetcher = fetch) => {
    const dicomJson = await fetchDicomJson({ baseUrl, studyUid, pathname: '/series' }, fetcher);
    const seriesUids = dicomJson.map(series => series[DicomTags.SeriesInstanceUID]?.Value?.[0]);
    const metadata = await Promise.all(seriesUids.map(seriesUid => fetchSeriesMetadata(baseUrl, studyUid, seriesUid)));

    const series = metadata.map(metadata => {
        const modality = metadata[DicomTags.Modality]?.Value?.[0];

        if (modality === 'SM') {
            return {
                modality,
                numberOfFrames: metadata[DicomTags.NumberOfFrames]?.Value?.[0] ?? null,
                seriesUid: metadata[DicomTags.SeriesInstanceUID]?.Value?.[0] ?? null,
                studyUid,
            };
        } else if (modality === 'ANN') {
            const annotations = metadata[DicomTags.AnnotationGroupSequence]?.Value;

            return {
                modality,
                graphicType: [...new Set(annotations?.flatMap(toGraphicType))],
                seriesUid: metadata[DicomTags.SeriesInstanceUID]?.Value?.[0] ?? null,
                studyUid,
            };
        }
    });

    const sm = series.filter(s => s?.modality === 'SM').sort((a, b) => (a?.numberOfFrames ?? 0) - (b?.numberOfFrames ?? 0))[0];

    if (sm) {
        sm.thumbnail = sm.seriesUid ? `${baseUrl}/studies/${studyUid}/series/${sm.seriesUid}/thumbnail` : undefined;
        sm.instances = (await getSeriesInstanceCount(baseUrl, studyUid, sm.seriesUid)) ?? undefined;
    }

    return {
        sm,
        annotations: series.filter(s => s?.modality === 'ANN'),
    };
};

export const sortSmImages = (a, b) => {
    const aColumns = a[DicomTags.TotalPixelMatrixColumns].Value[0];
    const aRows = a[DicomTags.TotalPixelMatrixRows].Value[0];
    const aFrames = a[DicomTags.NumberOfFrames].Value[0];
    const bColumns = b[DicomTags.TotalPixelMatrixColumns].Value[0];
    const bRows = b[DicomTags.TotalPixelMatrixRows].Value[0];
    const bFrames = b[DicomTags.NumberOfFrames].Value[0];
    const aSize = aColumns * aRows;
    const bSize = bColumns * bRows;
    return aSize === bSize ? aFrames - bFrames : aSize - bSize;
};
