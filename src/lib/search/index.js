import dicomWebServerConfig from "../../config/DICOMWebServer.config.js";
import QIDO from "csy-dicomweb-qido-rs";
import {QIDO_RS_Response} from "./QIDO_RS.jsx";

function getQidorsConfig(server) {
    if(server === undefined){
        return [];
    }
    const qidorsConfig = dicomWebServerConfig[server].QIDO;
    let result = {
        queryLevel: "studies",
        hostname: qidorsConfig.hostname,
        pathname: qidorsConfig.pathname,
        protocol: qidorsConfig.enableHTTPS ? "https" : "http",
        port: qidorsConfig.port,
        token: qidorsConfig.Token
    }
    return result;
}

async function getQidorsResponse(parameter,server){
    if(server === undefined){
        return [];
    }
    console.log("getQidorsResponse",server)
    const qido = new QIDO();

    await qido.init();
    const qidoConfig = getQidorsConfig(server);
    qido.hostname = qidoConfig.hostname;
    qido.pathname = qidoConfig.pathname;
    qido.protocol = qidoConfig.protocol;
    qido.port = qidoConfig.port;
    qido.queryLevel = qidoConfig.queryLevel;
    qido.queryParameter = parameter;

    // 有 TOKEN 就加入
    if (!(qidoConfig.token === null)) {
        const tokenValue = qidoConfig.token;
        const myHeaders = { "Authorization": tokenValue };
        await qido.setUseToken(myHeaders);
    }

    await qido.query();
    const result = qido.response

    return {qidoConfig,result};
}

const firstQuery = async (parameter,server) =>{
    if(server === undefined){
        return [];
    }
    console.log("firstQuery",server)
    const {qidoConfig,result} = await getQidorsResponse(parameter,server)
    return {qidoConfig,result};
}

function combineUrl(server){
    const config = dicomWebServerConfig[server].QIDO;
    const protocol = config.enableHTTPS ? 'https://' : 'http://';
    const hostname = config.hostname;
    const port = config.port ? `:${config.port}` : '';
    const pathname = config.pathname;
    return `${protocol}${hostname}${port}${pathname}`;
}

function formatDate(inputDate) {
    const year = inputDate.substring(0, 4);
    const month = inputDate.substring(4, 6);
    const day = inputDate.substring(6, 8);
    return `${year}-${month}-${day}`;
}

function formatSlashDate(date) {
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

function fetchPatientDetails(data){
    const patientID = data ? getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.PatientID, "NotFound") : "loading"
    const patientName = data ? (getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.PatientName, "NotFound")?.Alphabetic) : "loading"
    const rawPatientBirthDate = data ? getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.PatientBirthDate, "NotFound") : "loading";
    const patientBirthDate = rawPatientBirthDate !== "NotFound" && rawPatientBirthDate !== "loading" ? formatSlashDate(rawPatientBirthDate) : rawPatientBirthDate;
    const patientSex = data ? (getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.PatientSex, "NotFound")) : "loading"
    const accessionNumber = data ? (getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.AccessionNumber, "NotFound")) : "loading"
    const rawStudyDate = data ? getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.StudyDate, "NotFound") : "loading";
    const studyDate = rawStudyDate !== "NotFound" ? formatSlashDate(rawStudyDate) : rawStudyDate;
    const rawStudyTime = data ? getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.StudyTime, "NotFound") : "loading";
    const studyTime = rawStudyTime !== "NotFound" ? formatTime(rawStudyTime) : rawStudyTime;

    const studyInstanceUID = data ? (getQidorsSingleStudyMetadataValue(data, QIDO_RS_Response.StudyInstanceUID, "NotFound")) : "loading"
    return {patientID,patientName,patientBirthDate,patientSex,accessionNumber,studyDate,studyTime,studyInstanceUID}
}

const hasNext = (parameter) => {
    const searchParams = new URLSearchParams({ [QIDO_RS_Response.ModalitiesInStudy]: 'SM' });
    if (parameter.PatientID) searchParams.set(QIDO_RS_Response.PatientID, parameter.PatientID);
    if (parameter.PatientName) searchParams.set(QIDO_RS_Response.PatientName, parameter.PatientName);
    if (parameter.StudyInstanceUID) searchParams.set(QIDO_RS_Response.StudyInstanceUID, parameter.StudyInstanceUID);
    if (parameter.AccessionNumber) searchParams.set(QIDO_RS_Response.AccessionNumber, parameter.AccessionNumber);
    if (parameter.StudyDate) searchParams.set(QIDO_RS_Response.StudyDate, parameter.StudyDate);


    const fetchNext = fetch(`${combineUrl(server)}/studies?limit=${1}&offset=${parameter.offset + parameter.limit}`,{
        mode: 'cors',
        headers: {
            'Access-Control-Allow-Origin':'*'
        }
    })
    return fetchNext
}



export {firstQuery,combineUrl,formatDate,formatSlashDate,formatTime,getQidorsSingleStudyMetadataValue,fetchPatientDetails}