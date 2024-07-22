import React from "react";
import PatientDetails from "./PatientDetails.jsx";
import DescriptionPlate from "./DescriptionPlate.jsx";
import {combineUrl} from "../../../lib/search/index.js";

const LeftDrawer = ({detail, labelOpen, smSeries, seriesUid, studyUid, server, handleLabelOpen}) => {
    const [seriesUId, setSeriesUId] = seriesUid;

    function navigateTo(seriesUID) {
        setSeriesUId(seriesUID)
    }

    return (
        <div className={`!h-100 verflow-auto `} style={{width: '450px'}}>
            <div className="flex flex-col w-full h-full border-end">
                <div>
                    <DescriptionPlate
                        label="Patient"
                        icon="bi:people-circle"
                        isOpen={labelOpen[0] !== 0}
                        onClick={(e) => handleLabelOpen(e, 0)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label="Patient" style="Patient"/>
                    </DescriptionPlate>
                </div>
                <div>
                    <DescriptionPlate
                        label="Study"
                        icon="fluent:document-data-16-filled"
                        isOpen={labelOpen[1] !== 0}
                        onClick={(e) => handleLabelOpen(e, 1)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label="Study" style="Patient"/>
                    </DescriptionPlate>
                </div>
                <div>
                    <DescriptionPlate
                        label="Series"
                        icon="fluent:document-data-16-filled"
                        isOpen={labelOpen[2] !== 0}
                        onClick={(e) => handleLabelOpen(e, 2)}
                    >
                        {smSeries.map((series, index) => {
                            const [seriesUID, seriesName] = series;
                            return (
                                <div
                                    key={seriesUID}
                                    className={`${seriesUID === seriesUid[0] ? "bg-gray-200" : ""} hover:bg-green-100 w-full`}
                                    onClick={() => navigateTo(seriesUID)}
                                >
                                    <span className="text-sm font-bold font-sans text-left w-full ml-2 mt-4">{seriesName}</span>
                                    <div className="p-2">
                                        <img
                                            src={`${combineUrl(server)}/studies/${studyUid}/series/${seriesUID}/thumbnail`}
                                            className="break-all border bg-white mr-10 w-full text-xs h-[100px] object-cover"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </DescriptionPlate>
                </div>
            </div>
        </div>
    )
}
export default LeftDrawer;