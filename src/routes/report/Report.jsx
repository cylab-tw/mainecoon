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
        <div className={`h-full w-6/12 border-4 border-black rounded-2xl m-3`}>
            <div className="flex flex-col w-full h-full">
                <div className="p-5 m-2 overflow-y-auto scrollbar-thin scrollbar-webkit">
                    <p className="font-bold text-xl bg-green-300 mt-1 mb-1 p-2">Diagnosis</p>
                    <ol className="list-decimal list-inside pl-4">
                        <li>Squamous cell carcinoma, left floor of mouth</li>
                        <li>Squamous cell carcinoma, in extranodal connective tissue of neck at
                            level III
                        </li>
                        <li>Nineteen cervical lymph nodes, no pathologic diagnosis.</li>
                    </ol>
                </div>
            </div>
        </div>
    </>
}

export {Report};