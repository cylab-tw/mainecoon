import React from "react"
import {useState, useEffect} from "react";
import {Icon} from "@iconify/react";

const Report = ({ReportOpen, title, seriesInstanceUID, diagnosticReportUrl}) => {

    const [changeToJson, setChangeToJson] = useState(false);
    const [jsonContent, setJsonContent] = useState(null);

    const handleReportChangeToJson = () => {
        setChangeToJson(!changeToJson)
    }

    useEffect(() => {
        const fetchJsonData = async () => {
            try {
                const response = await fetch("ImagingStudy.json");
                const data = await response.json();
                setJsonContent(data);
            } catch (error) {
                console.error("Error fetching JSON data:", error);
            }
        };

        fetchJsonData();
    }, []);

    const handleDownloadJson = (data) => {
        const jsonBlob = new Blob([JSON.stringify(data, null, 2)], {type: "application/json"});

        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(jsonBlob);
        downloadLink.download = "reportData.json";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };


    return <>
        <div className="w-1/2 mx-3 mb-3 mt-2">
            <div className="flex justify-between mb-3">
                <div className="flex h-10">
                    {changeToJson ? (
                        <>
                            <button
                                className="ml-auto mr-3 flex items-center justify-end bg-blue-400 hover:bg-gray-600 text-white font-bold rounded-lg px-2 py-2"
                                onClick={handleReportChangeToJson}
                            >Report
                            </button>
                            <button
                                className="ml-auto flex items-center justify-end bg-blue-400 hover:bg-gray-600 text-white font-bold rounded-lg px-2.5 py-2"
                                onClick={() => handleDownloadJson(jsonContent)}
                            >
                                <Icon icon="material-symbols:download-sharp"/>Download JSON
                            </button>
                        </>
                    ) : (
                        <button
                            className="ml-auto mr-3 flex items-center justify-end bg-blue-400 hover:bg-gray-600 text-white font-bold rounded-lg px-2 py-2"
                            onClick={handleReportChangeToJson}
                        >Raw Data
                        </button>
                    )}
                </div>
                <div className="flex h-10">
                    <button
                        className="ml-auto flex items-center justify-end bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-l-lg px-2 py-2"
                        onClick={ReportOpen}
                    >{'<<'}
                    </button>
                </div>
            </div>
            <div className="h-full w-full border-2 border-black rounded-2xl flex flex-row">
                {!changeToJson ? (
                    <div className="flex flex-col w-full h-full">
                        <div className="p-2 m-2 overflow-y-auto scrollbar-thin-report">
                            <p className="font-bold text-md bg-green-300 mt-1 mb-1 p-2">Gross Finding</p>
                            <p className="mx-3 text-sm mt-2">The specimen received consists of two parts.
                                Part (A) is a wedge - shaped lung tissue labeled "LUL wedge"measuring 8.2 x 3.5 x 3.0
                                cm. A
                                gray
                                white tumor,1.4 x 1.1 x 1.1 cm, is noted 1.5 cm
                                from the stapled margin,0.9 cm from the visceral pleura.
                                The non - tumorous parenchyma is congested and hemorrhagic.

                                Part (B)
                                consists of lymph nodes labeled as above.Representative parts are
                                taken for sections in 7 blocks.
                                (A:stapled margin,R-C : tumor ,
                                D:non-tumorous parenchyma,
                                E:para-aortic LNs, F:subaortic,
                                G:inferior pulmonary ligament LNs) (CYC)</p>

                            <p className="font-bold text-md bg-green-300 mt-1 mb-1 p-2">Microscopic Finding</p>
                            <ol className="text-sm mt-3 list-decimal list-inside pl-4">
                                <li>Histologic type : Minimally invasive adenocarcinoma</li>
                                <li>Histologic pattern : lepidic (70%), acinar (30%)</li>
                                <li>Cell type: non-mucinous tumor cells</li>
                                <li>Total tumor size: 1.4 x 1.1 x 1.1 cn</li>
                                <li>Size of invasive focus: O.4 cm</li>
                                <li>Tumor differentiation: well differentiated (G1)</li>
                                <li>Angiolymphatic invasion: absent</li>
                                <li>Perineural invasion: absent</li>
                                <li>Spread Through Air Spaces (STAS): absent.</li>
                                <li>Tumor necrosis: absent</li>
                                <li>Pleural invasion:: absent (PLO)</li>
                                <li>Resection margin: free of tumor involvement.</li>
                                <li>Lymph nodes: all without metastatic tumor</li>
                                <li>Non-tumorous parenchyma: congestion</li>
                                <li>Pathological staging: pT1miNO (AJCC 8th edition).</li>
                            </ol>

                            <p className="font-bold text-md bg-green-300 mt-1 mb-1 p-2">Diagnosis</p>
                            <ol className="text-sm list-decimal list-inside pl-4 mt-3">
                                <li>Squamous cell carcinoma, left floor of mouth</li>
                                <li>Squamous cell carcinoma, in extranodal connective tissue of neck at level III</li>
                                <li>Nineteen cervical lymph nodes, no pathologic diagnosis.</li>
                            </ol>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col w-full h-full">
                        <div className="p-2 m-2 overflow-y-auto scrollbar-thin-report">
                        <pre className="text-sm mt-2">
                            {jsonContent ? JSON.stringify(jsonContent, null, 2) : "Loading..."}
                        </pre>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </>
}

export {Report};