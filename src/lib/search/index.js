import dicomWebServerConfig from "../../config/DICOMWebServer.config.js";
import {QIDO_RS_Response} from "./QIDO_RS.jsx";

function combineUrl(server){
    const config = dicomWebServerConfig[server].QIDO;
    const protocol = config.enableHTTPS ? 'https://' : 'http://';
    const hostname = config.hostname;
    const port = config.port ? `:${config.port}` : '';
    const pathname = config.pathname;
    return `${protocol}${hostname}${port}${pathname}`;
}

function CombineSearchURL(parameter,server, pageLimit, pageOffset) {
    const url = combineUrl(server);
    let searchParams = new URLSearchParams();

    const addParam = (key, value) => {
        if (value !== undefined && value !== '') {searchParams.append(key, value);}
    }
    addParam('PatientID', parameter.PatientID);
    addParam('PatientName', parameter.PatientName);
    addParam('StudyInstanceUID', parameter.StudyInstanceUID);
    addParam('AccessionNumber', parameter.AccessionNumber);
    addParam('StudyDate', parameter.StudyDate);
    addParam('StudyTime', parameter.StudyTime);
    addParam('ModalitiesInStudy', parameter.ModalitiesInStudy);
    addParam('ReferringPhysicianName', parameter.ReferringPhysicianName);
    addParam('StudyID', parameter.StudyID);

    searchParams.append('limit', pageLimit);
    searchParams.append('offset', pageOffset);
    const searchUrl = `${url}/studies?${searchParams.toString()}`;
    return searchUrl;
}

function formatDate(date) {
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    return `${year}/${month}/${day}`;
}

function formatTime(inputTime) {
    const hours = inputTime.substring(0, 2);
    const minutes = inputTime.substring(2, 4);
    const seconds = inputTime.substring(4, 6);
    return `${hours}:${minutes}:${seconds}`;
}

function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
    const metadataValue = qidorsSingleStudy[metadataTag]?.Value;
    return metadataValue !== undefined && metadataValue.length > 0 ? metadataValue[0] : defaultValue;
}

function processMetadataValue(data, metadataTag, defaultValue, formatter) {
    const rawValue = data ? getQidorsSingleStudyMetadataValue(data, metadataTag, defaultValue) : "loading";
    if (rawValue === "NotFound" || rawValue === "loading") {
        return rawValue;
    }
    return formatter ? formatter(rawValue) : rawValue;
}

function fetchPatientDetails(data) {
    const patientID = processMetadataValue(data, QIDO_RS_Response.PatientID, "NotFound");
    const patientName = processMetadataValue(data, QIDO_RS_Response.PatientName, "NotFound", value => value.Alphabetic);
    const patientBirthDate = processMetadataValue(data, QIDO_RS_Response.PatientBirthDate, "NotFound", formatDate);
    const patientSex = processMetadataValue(data, QIDO_RS_Response.PatientSex, "NotFound");
    const accessionNumber = processMetadataValue(data, QIDO_RS_Response.AccessionNumber, "NotFound");
    const studyDate = processMetadataValue(data, QIDO_RS_Response.StudyDate, "NotFound", formatDate);
    const studyTime = processMetadataValue(data, QIDO_RS_Response.StudyTime, "NotFound", formatTime);
    const studyInstanceUID = processMetadataValue(data, QIDO_RS_Response.StudyInstanceUID, "NotFound");

    return {patientID, patientName, patientBirthDate, patientSex, accessionNumber, studyDate, studyTime, studyInstanceUID
    };
}

export {combineUrl,CombineSearchURL,formatDate,formatTime,fetchPatientDetails}