import React from "react"
import { useAppSelector, useAppDispatch } from "Hook";
import { useNavigate } from 'react-router-dom';

import _ from "lodash";




type ReportProps = {
    title: string,
    seriesInstanceUID: string,
    diagnosticReportUrl: string
}


const Report: React.FC<ReportProps> = ({
    title,
    seriesInstanceUID,
    diagnosticReportUrl
}) => {

    const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportSlice.imageResult?.Series;
    const seriesResult = seriesResults[_.findIndex(seriesResults, { uid: seriesInstanceUID })];
    const metadata: object = _.first(seriesResult?.metadata);
    const modalityAttribute: string = _.get(_.get(metadata, "00080060"), "Value");
    const studyInstanceUID: string = _.get(_.get(metadata, "0020000D"), "Value");
    
    const navigate = useNavigate();

    function OnClick() {
        if (_.isEmpty(studyInstanceUID) && _.isEmpty(seriesInstanceUID)) {
            console.log("UID Empty Error");
            console.log("studyInstanceUID", studyInstanceUID);
            console.log("seriesInstanceUID", seriesInstanceUID);
            return;
        }
        navigate(`../WSIViewerWithReport/${studyInstanceUID}/${seriesInstanceUID}/${modalityAttribute}`);
    }





    return <>
        <div className="col w-200px" onClick={OnClick}>
            <div className="card border-success me-4 h-100" style={{ maxWidth: "18rem" }}>
                <div className="card-header bg-transparent border-success">{title}</div>
                <div className="card-body text-success">
                    <h5 className="card-title">{modalityAttribute}</h5>
                    <p className="card-text text-truncate">{diagnosticReportUrl}</p>
                </div>
            </div>
        </div>
    </>
}

export { Report };