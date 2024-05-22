import dicomWebServerConfig from "../../config/DICOMWebServer.config";
import WADO from "csy-dicomweb-wado-rs-uri";

// 初始化 DICOM WADO Protocol 的連線資訊
async function getInitWADOService() {
    const wadoConfig = dicomWebServerConfig.WADO;
    const wado = new WADO();

    wado.queryMode = wadoConfig.Mode;
    wado.hostname = wadoConfig.hostname;
    wado.pathname = wadoConfig.Mode === "rs" ? wadoConfig.RS_pathname : wadoConfig.URI_pathname;
    wado.protocol = wadoConfig.enableHTTPS ? "https" : "http";
    wado.port = wadoConfig.port;

    //有 TOKEN 就加入
    if (wadoConfig.Token != null) {
        const tokenValue = wadoConfig.Token;
        const myHeaders = {"Authorization": tokenValue};
        await wado.setUseToken(myHeaders);
    }

    await wado.init();

    return wado;
}



// 查詢 DICOM File Study Level 的所有 Series
const querySeries = async (studyInstanceUID) => {
    const wado = await getInitWADOService();
    wado.studyInstanceUID = studyInstanceUID;
    await wado.querySeries();
    console.log("wado.response", wado.response)
    return wado.response;
}


export {querySeries, getInitWADOService}