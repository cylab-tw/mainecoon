import fs from "node:fs"
// 配置DICOMweb伺服器資訊
const dicomWebServerUrl = 'https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs';

async function fetchDicom(...args) {
    try {
        const response = await fetch(...args);
        return response.json();
    } catch (e) {
        console.log(e)
    }
    return []
}


// process.exit (0)

async function checkSpecimenInSeries(studyInstanceUID) {
    try {
        // 構建請求URL
        const seriesUrl = `${dicomWebServerUrl}/studies/${studyInstanceUID}/series`;
        fs.mkdirSync(`out/${studyInstanceUID}`,{
            recursive : true
        })
        // 取得系列元數據
        const seriesMetadata = await fetchDicom(seriesUrl);

        for (const seriesData of seriesMetadata) {
            const seriesInstanceUID = seriesData['0020000E'].Value[0];

            // 構建實例請求URL
            const instancesUrl = `${dicomWebServerUrl}/studies/${studyInstanceUID}/series/${seriesInstanceUID}/metadata`;

            // 取得實例元數據
            const seriesMetadata = await fetchDicom(instancesUrl);
            const series = seriesMetadata[0]
            fs.writeFileSync(`./out/${studyInstanceUID}/${seriesInstanceUID}.json`,JSON.stringify(series,null,4))
            console.log("series",series)
            const specimenSeq = series['00400560']?.Value?.["00400610"]; // Specimen Preparation Sequence Tag

            if (specimenSeq && specimenSeq.Value && specimenSeq.Value.length > 0) {
                console.log(`Study UID: ${studyInstanceUID} Series UID: ${seriesInstanceUID} has Specimen.`);
            } else {
                console.log(`Study UID: ${studyInstanceUID} Series UID: ${seriesInstanceUID} it is empty.`);
            }

        }
    } catch (error) {
        console.error('Error fetching series metadata:', error);
    }
}

const response = await fetchDicom(`${dicomWebServerUrl}/studies`);

for (const study of response) {
    const studyUid = study?.["0020000D"]?.Value[0]
    await checkSpecimenInSeries(studyUid)
    await new Promise((resolve) => {
        setTimeout(resolve, 2000)
    })
}



