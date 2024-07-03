import dicomWebServerConfig from "../../config/DICOMWebServer.config.js";
import QIDO from "csy-dicomweb-qido-rs";
import {QIDO_RS_Response} from "./QIDO_RS.jsx";
import {useContext} from "react";
import {ServerContext} from "../ServerContext.jsx";

function getQidorsConfig(server) {
    // const [server,setServer] = useContext(ServerContext)\
    if(server === undefined){
        return [];
    }
    const qidorsConfig = dicomWebServerConfig[server].QIDO;
    // const qidorsConfig = dicomWebServerConfig.GOOGLE.QIDO;
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

    console.log("url",`${protocol}${hostname}${port}${pathname}`)
    return `${protocol}${hostname}${port}${pathname}`;
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
export {firstQuery,combineUrl,hasNext}