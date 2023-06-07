// react
import React, { useState, useEffect, useRef } from 'react';

import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";




type RightAside = {
    seriesInstanceUID: string
}


const RightAside: React.FunctionComponent<RightAside> = ({
    seriesInstanceUID
}) => {

    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const reportResult = imageWithReportSlice.reportResult;
    const specificReportResult = reportResult[_.findIndex(reportResult, { seriesInstanceUID: seriesInstanceUID })];
    const diagnosticReportConclusion = specificReportResult.diagnosticReportConclusion;

    const testingDiagnosticReportConclusionArray = diagnosticReportConclusion.split("$");


    let testingDiagnosticReportConclusion = "";
    for (let i = 0; i < testingDiagnosticReportConclusionArray.length; i++) {
        testingDiagnosticReportConclusion += testingDiagnosticReportConclusionArray[i] + "\n";
    }


    return <>
        <div className='w-600px h-100 bg-white overflow-scroll' style={{ whiteSpace: 'pre-line'}}>
            {testingDiagnosticReportConclusion}
        </div>
    </>
}


export default RightAside;