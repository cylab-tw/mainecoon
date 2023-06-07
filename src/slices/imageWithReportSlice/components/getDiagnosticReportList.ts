import _ from "lodash";

import { report } from "./types/report";

async function getDiagnosticReportList(imagingStudyResourceList: object[], fhirServerBaseURL: string): Promise<report[]> {
    const result: report[] = [];

    _.forEach(imagingStudyResourceList, (imagingStudyResource) => {
        if (_.has(imagingStudyResource, "reasonReference")) {
            const tempDiagnosticReportReference = _.get(_.first(_.get(imagingStudyResource, "reasonReference")), "reference") as string;
            const tempDiagnosticReportUrl = `${fhirServerBaseURL}/${tempDiagnosticReportReference}`;

            const seriesInstanceUID = _.has(imagingStudyResource, "series") ? _.get(_.first(_.get(imagingStudyResource, "series")), "uid") : "notFound";
            const tempDiagnosticReport: report = {
                seriesInstanceUID: seriesInstanceUID,
                diagnosticReportUrl: tempDiagnosticReportUrl,
                diagnosticReportConclusion: undefined
            };

            result.push(tempDiagnosticReport);
        }
    })

    return result;
}

export { getDiagnosticReportList };