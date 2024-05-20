import {getImagingStudyResponseListByDICOMSeriesInstanceUIDList} from "./getImagingStudyResponseListByDICOMSeriesInstanceUIDList.ts";
import {getImagingStudyResourceList} from "./getImagingStudyResourceList.ts";
import {getDiagnosticReportList} from "./getDiagnosticReportList.ts";
import {getDiagnosticReportConclusion} from "./getDiagnosticReportConclusion.ts";
import {getInitWADOService} from "../image/index.js"

// 查詢 DICOM File Study Level 底下的特定 Series 的所有物件
const renderSpecificSeries = async (studyInstanceUID) => {
        const wado = await getInitWADOService();
        wado.studyInstanceUID = studyInstanceUID;
        await wado.renderSpecificSeries(studyInstanceUID);
        return wado.response;
}

// 查詢 DICOM File Study Level 底下的全部 Series 的所有物件
const renderAllSeries = async (studyInstanceUID) => {
        const wado = await getInitWADOService();
        wado.studyInstanceUID = studyInstanceUID;
        await wado.renderAllSeries();
        return wado.response;
}

const queryReports = async (seriesInstanceUIDList) => {

        const isUseToken = false;
        const tokenObject = {};
        const queryResourceTypeName = "ImagingStudy";
        const fhirServerBaseURL = "https://raccoon.dicom.org.tw/api/fhir";
        const querySpecificResourceTypeURL = `${fhirServerBaseURL}/${queryResourceTypeName}?_pretty=true`

        // 取得 Resource Type 為 imagingStudy 的資料
        const imagingStudyResponseList = await getImagingStudyResponseListByDICOMSeriesInstanceUIDList(seriesInstanceUIDList, querySpecificResourceTypeURL, isUseToken, tokenObject);

        // 將 FHIR Server Response 過濾出資料數量大於0的 imagingStudyResourceList
        const imagingStudyResourceList = await getImagingStudyResourceList(imagingStudyResponseList);

        // 將 imagingStudyResourceList 裡面的 DiagnosticReport 的 List 抓出來
        const diagnosticReportList = await getDiagnosticReportList(imagingStudyResourceList, fhirServerBaseURL);

        // 將 DiagnosticReport 的 Conclusion 更新出來
        const result = await getDiagnosticReportConclusion(diagnosticReportList, isUseToken, tokenObject);

        return result;
}

export {queryReports,renderSpecificSeries,renderAllSeries}