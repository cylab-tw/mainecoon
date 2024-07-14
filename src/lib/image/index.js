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

function getSpecimenList(data){
    // 00400512
    // Value[0]: "TCGA-AF-2689-01Z-00-DX1"
    const Title = data?.["00400512"]?.Value[0] ?? "";
    const SpecimenDescriptionSequence = data?.["00400560"]?.Value[0]
    const Description = SpecimenDescriptionSequence?.["00400600"]?.Value[0] ?? "";
    const Anatomicalstructure = SpecimenDescriptionSequence?.["00082228"]?.Value?.[0]?.["00080104"]?.Value?.[0] ?? "";
    let Collectionmethod = ""
    let Parentspecimen = []
    let Tissuefixative = ""
    let Tissueembeddingmedium = ""
    SpecimenDescriptionSequence?.["00400610"]?.Value?.map((s) => {
        const s0 = s?.["00400612"]?.Value
        s0.map((s1) => {
            if (s1?.["0040A160"]) {
                const ConceptNameCodeSequence = s1?.["0040A043"]?.Value?.[0]
                const codeValue = ConceptNameCodeSequence?.["00080100"].Value?.[0]
                if (codeValue === "111705") {
                    const codeMeaning = ConceptNameCodeSequence?.["00080104"]?.Value?.[0]
                    if (codeMeaning === "Parent Specimen Identifier") {
                        const parentSpecimen = s1?.["0040A160"]?.Value?.[0]
                        Parentspecimen.push(parentSpecimen)
                    }
                }
            } else if (s1?.["0040A168"]) {
                const ConceptCodeSequenceCodeValue = s1?.["0040A168"]?.Value?.[0]?.["00080100"]?.Value?.[0]
                const ConceptNameCodeSequenceCodeValue = s1?.["0040A043"]?.Value?.[0]?.["00080100"]?.Value?.[0]
                if (ConceptCodeSequenceCodeValue === "118292001") {
                    const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                    Collectionmethod = codeMeaning
                }
                if (ConceptCodeSequenceCodeValue === "311731000") {
                    const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                    Tissueembeddingmedium = codeMeaning
                }
                if (ConceptNameCodeSequenceCodeValue === "430864009") {
                    const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                    Tissuefixative = codeMeaning
                }
            }
        })
    })
    return {Title,Description, Anatomicalstructure, Collectionmethod, Parentspecimen, Tissuefixative, Tissueembeddingmedium}
}

async function getSlideLabel(baseUrl, studyUid, seriesUid) {
    const url = `${baseUrl}/studies/${studyUid}/series/${seriesUid}/metadata`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const metadata = data[0];
        const SlideLabel = metadata?.["00400512"]?.Value[0];
        return SlideLabel;
    } catch (error) {
        console.error("Error fetching slide label:", error);
        return null;
    }
}


export {querySeries,getSlideLabel,getSpecimenList, getInitWADOService}