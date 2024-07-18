import dicomWebServerConfig from "../../config/DICOMWebServer.config";
import {combineUrl} from "../../lib/search/index.js";
// 定義 DICOM JSON 的類型
const DicomJson = {};

// 定義 DICOM tags 的枚舉
const DicomTags = {
    ImageType: '00080008',
    SOPInstanceUID: '00080018',
    StudyDate: '00080020',
    AccessionNumber: '00080050',
    Modality: '00080060',
    ModalitiesInStudy: '00080061',
    ReferencedSeriesSequence: '00081115',
    ReferencedInstanceSequence: '0008114A',
    ReferencedSOPInstanceUID: '00081155',
    PatientName: '00100010',
    PatientID: '00100020',
    PatientBirthDate: '00100030',
    PatientSex: '00100040',
    StudyInstanceUID: '0020000D',
    SeriesInstanceUID: '0020000E',
    NumberOfFrames: '00280008',
    Rows: '00280010',
    Columns: '00280011',
    PixelSpacing: '00280030',
    TotalPixelMatrixColumns: '00480006',
    TotalPixelMatrixRows: '00480007',
    PointCoordinatesData: '00660016',
    DoublePointCoordinatesData: '00660022',
    LongPrimitivePointIndexList: '00660040',
    AnnotationGroupSequence: '006A0002',
    GraphicType: '00700023',
    GroupUID: '006A0003',
    GroupName: '006A0005',
    GroupGenerationType : '006A0007',
    PixelMeasuresSequence: '00289110',
    SharedFunctionalGroupsSequence: '52009229'
};

// 定義 DICOM Web URL 的解析函數
const parseDicomwebUrls = (urls) => {
    return urls.split(',').map(url => {
        const [name, urlValue] = url.split('=');
        return {name, url: urlValue || name};
    });
};

const server = dicomWebServerConfig
const key = Object.keys(server)
let DicomwebUrls = []
key.map((server) => {
    const url = combineUrl(server)
    const publicDicomwebUrls = `${server}=${url}`
    DicomwebUrls.push(publicDicomwebUrls)
})

DicomwebUrls = DicomwebUrls.join(',')


const PUBLIC_DICOMWEB_URLS = DicomwebUrls;
const DICOMWEB_URLS = parseDicomwebUrls(PUBLIC_DICOMWEB_URLS);


// 將輸入轉換為 DICOM Web URL
const toDicomWebUrl = (input) => {
    if (typeof input === 'object') {
        const {baseUrl, studyUid, seriesUid, instanceUid, frame, pathname, searchParams} = input;
        let url = baseUrl || '';
        if (studyUid) url += `/studies/${studyUid}`;
        if (seriesUid) url += `/series/${seriesUid}`;
        if (instanceUid) url += `/instances/${instanceUid}`;
        if (frame) url += `/frames/${frame}`;
        if (pathname) url += pathname;
        if (searchParams) url += `?${searchParams.toString()}`;
        return url;
    }
    return input;
};

/**
 * 從 DICOM Web 服務器獲取 JSON 數據。
 *
 * @param input 路徑或包含標識符和路徑的對象。
 * @param fetcher fetch 函數。
 * @returns JSON 數據。
 */
const fetchDicomJson = async (input, fetcher = fetch) => {
    const response = await fetcher(toDicomWebUrl(input));
    if (!response.ok) {
        // 在這裡處理錯誤
    }

    if (response.status === 204) {
        return [];
    }

    return await response.json();
};

// 導出模塊的內容
export {DicomJson, DicomTags, DICOMWEB_URLS, toDicomWebUrl, fetchDicomJson};
