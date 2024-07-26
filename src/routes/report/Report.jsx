import React from "react"


const Report = ({title, seriesInstanceUID, diagnosticReportUrl}) => {
    // const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
    // const seriesResults = imageWithReportSlice.imageResult?.Series;
    // const seriesResult = seriesResults[_.findIndex(seriesResults, {uid: seriesInstanceUID})];
    // const metadata = _.first(seriesResult?.metadata);
    // const modalityAttribute: string = _.get(_.get(metadata, "00080060"), "Value");
    // const studyInstanceUID: string = _.get(_.get(metadata, "0020000D"), "Value");
    // const navigate = useNavigate();
    //
    // function OnClick() {
    //     if (_.isEmpty(studyInstanceUID) && _.isEmpty(seriesInstanceUID)) {
    //         console.log("UID Empty Error");
    //         console.log("studyInstanceUID", studyInstanceUID);
    //         console.log("seriesInstanceUID", seriesInstanceUID);
    //         return;
    //     }
    //     navigate(`../WSIViewerWithReport/${studyInstanceUID}/${seriesInstanceUID}/${modalityAttribute}`);
    // }


    return <>
        <div className="w-1/2 mx-3 mb-3 mt-2">
            <div className="h-full w-full border-2 border-black rounded-2xl">
                <div className="flex flex-col w-full h-full">
                    <div className="p-2 m-2 overflow-y-auto scrollbar-thin-report">
                        <p className="font-bold text-md bg-green-300 mt-1 mb-1 p-2">Diagnosis</p>
                        <ol className="text-sm list-decimal list-inside pl-4">
                            <li>Squamous cell carcinoma, left floor of mouth</li>
                            <li>Squamous cell carcinoma, in extranodal connective tissue of neck at level III</li>
                            <li>Nineteen cervical lymph nodes, no pathologic diagnosis.</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    </>
}

export {Report};