import dicomWebServerConfig from "../../config/DICOMWebServer.config";
import WADO from "csy-dicomweb-wado-rs-uri";

let options = buildServerConfig()

// 初始化 DICOM WADO Protocol 的連線資訊
function buildServerConfig (){
    const server = dicomWebServerConfig
    const options = Object.keys(server).map(getInitWADOService)
}
function getInitWADOService(key) {
    const wadoConfig = dicomWebServerConfig[key].WADO;
    const wado = new WADO();

    wado.name = key
    wado.queryMode = wadoConfig.Mode;
    wado.hostname = wadoConfig.hostname;
    wado.pathname = wadoConfig.Mode === "rs" ? wadoConfig.RS_pathname : wadoConfig.URI_pathname;
    wado.protocol = wadoConfig.enableHTTPS ? "https" : "http";
    wado.port = wadoConfig.port;

    //有 TOKEN 就加入
    if (wadoConfig.Token != null) {
        const tokenValue = wadoConfig.Token;
        const myHeaders = {"Authorization": tokenValue};
        wado.setUseToken(myHeaders);
    }

    wado.init();

    return wado;
}

// 查詢 DICOM File Study Level 的所有 Series
const querySeries = (studyInstanceUID) => {
    const wado = options
    wado.studyInstanceUID = studyInstanceUID;
    wado.querySeries();
    return wado.response;
}


export {querySeries, getInitWADOService}