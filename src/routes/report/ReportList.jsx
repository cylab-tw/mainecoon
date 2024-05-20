import React, {useEffect, useState} from "react";
import {Icon} from "@iconify/react";
import Modal from "../imageReport/Modal.jsx";
import {querySeries} from "../../lib/image/index.js";
import {queryReports} from "../../lib/report/index.js";

const ReportList = ({studyInstanceUID}) => {

    const [reportResults,setReportResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClick, setIsClick] = useState(false);
    const [reportContent, setReportContent] = useState([]);
    const [seriesResults, setSeriesResults] = useState([])
    const [seriesInstanceUIDList, setSeriesInstanceUIDList] = useState([]);

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const result = await querySeries(studyInstanceUID);
                if (result) {
                    setSeriesResults(result.Series)
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };
        fetchMetadata()
    }, [studyInstanceUID]);

    useEffect(() => {
        const tempSeriesInstanceUIDList = [];
        seriesResults.forEach(series => {
            tempSeriesInstanceUIDList.push(series.uid);
        });
        setSeriesInstanceUIDList(tempSeriesInstanceUIDList);
    }, [seriesResults])

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const result = await queryReports(seriesInstanceUIDList);
                if (result) {
                    console.log("resulttt", result)
                    setIsLoading(false)
                    setReportResults(result)
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };
        fetchMetadata()
    }, [seriesInstanceUIDList]);

    const handleCloseReport = () => {
        setIsClick(false);
    };

    const handleOpenReport = () => {
        setIsClick(true);
        fetch('report.txt')
            .then(response => response.text())
            .then(data => {
                const lines = data.split('\n'); // 將內容分割成每行
                setReportContent(lines);
            })
            .catch(error => console.error('Error fetching report:', error));
    };

    return (
        <>
            {reportResults && (
                <>
                    <div className="text-green-500 flex flex-row mt-5 mb-2">
                        <Icon icon="tabler:report-medical" width="32" height="32" className="ml-2 mr-2 "/>
                        <span id="report" className="ml-2 text-green-500 text-2xl font-bold ">Reports</span>
                    </div>
                    <button
                        onClick={handleOpenReport}
                    >
                        <div className="ml-10 mt-3 w-52 border-4 rounded-lg border-green-500">
                            <div className=" border-b-2 border-green-500 ">
                                <p className="m-2.5 font-mono text-xl">Report_001</p>
                            </div>
                            <div className="text-green-500 p-3">
                                <h5 className="">Lung Positive</h5>
                                <p className="">content content</p>
                                <p className="">content content</p>
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={handleOpenReport}
                    >
                        <div className="ml-10 mt-3 w-52 border-4 rounded-lg border-green-500">
                            <div className=" border-b-2 border-green-500 ">
                                <p className="m-2.5 font-mono text-xl">Report_002</p>
                            </div>
                            <div className="text-green-500 p-3">
                                <h5 className="">Ear Negative</h5>
                                <p className="">content content</p>
                                <p className="">content content</p>
                            </div>
                        </div>
                    </button>
                </>
            )}

            <Modal isOpen={isClick} onClose={handleCloseReport}>
                {reportContent.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </Modal>

            {isLoading && (
                <>
                    <span>
                        Loading
                    </span>
                </>
            )}
        </>
    );
}


export {ReportList};
