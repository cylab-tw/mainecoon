import _ from "lodash";
import { report } from "./types/report";
import axios, { AxiosRequestHeaders } from "axios";

async function getDiagnosticReportConclusion(diagnosticReportList: report[], isUseToken: boolean, tokenObject: object) {
    const tempDiagnosticReportList = diagnosticReportList;

    await Promise.all(tempDiagnosticReportList.map(async (tempDiagnosticReport) => {
        const queryFhirServerURL = tempDiagnosticReport.diagnosticReportUrl;
        if (isUseToken) {
            await axios({
                method: "get",
                url: queryFhirServerURL,
                headers: tokenObject as AxiosRequestHeaders
            }).then(
                async (res) => {
                    const response = _.cloneDeep(res.data);
                    tempDiagnosticReport.diagnosticReportConclusion = await getConclusion(response);
                })
                .catch((error) => console.log(error)
                )
        } else {
            await axios({
                method: "get",
                url: queryFhirServerURL
            }).then(
                async (res) => {
                    const response = _.cloneDeep(res.data);
                    tempDiagnosticReport.diagnosticReportConclusion = await getConclusion(response);
                })
                .catch((error) => console.log(error)
                )
        }


    }))

    return tempDiagnosticReportList;
}

async function getConclusion(response: any): Promise<string> {
    return _.has(response, "conclusion") ? _.get(response, "conclusion") : "notFound";
}

export { getDiagnosticReportConclusion };