import dicomWebServerConfig from "Configs/DICOMWebServer.config";
import WADO from "csy-dicomweb-wado-rs-uri";
import _ from "lodash";

// 初始化 DICOM WADO Protocol 的連線資訊
async function getInitWADOService(): Promise<WADO> {
    const wadoConfig = dicomWebServerConfig.WADO;
    const wado = new WADO();

    wado.queryMode = wadoConfig.Mode;
    wado.hostname = wadoConfig.hostname;
    wado.pathname = _.isEqual(wadoConfig.Mode, "rs") ? wadoConfig.RS_pathname : wadoConfig.RUI_pathname;
    wado.protocol = wadoConfig.enableHTTPS ? "https" : "http";
    wado.port = wadoConfig.port;

    //有 TOKEN 就加入
    if (!(_.isEmpty(wadoConfig.Token))) {
        const tokenValue = wadoConfig.Token;
        const myHeaders = { "Authorization": tokenValue };
        await wado.setUseToken(myHeaders);
    }

    await wado.init();

    return wado;
}

export { getInitWADOService };