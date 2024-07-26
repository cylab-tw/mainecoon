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
        <div className={`!h-100 overflow-auto `} style={{width: '450px'}}>
            <div className="flex flex-col w-full h-full border-end">
                <div className="border-b border-gray-100/60">
                    <DescriptionPlate
                        label="Patient"
                        icon="bi:people-circle"
                        isOpen={labelOpen[0] !== 0}
                        onClick={(e) => handleLabelOpen(e, 0)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label="Patient" style="Patient"/>
                    </DescriptionPlate>
                </div>
                <div className="border-b border-gray-100/60">
                    <DescriptionPlate
                        label="Study"
                        icon="fluent:document-data-16-filled"
                        isOpen={labelOpen[1] !== 0}
                        onClick={(e) => handleLabelOpen(e, 1)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label="Study" style="Patient"/>
                    </DescriptionPlate>
                </div>
                <div className="border-b border-gray-100/60">
                    <DescriptionPlate
                        label="Slides"
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
                                    <div className="p-2">
                                        <span
                                            className="text-sm font-sans text-left w-full m-0.5">{seriesName}</span>
                                        <img
                                            src={`${combineUrl(server)}/studies/${studyUid}/series/${seriesUID}/thumbnail`}
                                            className="break-all border bg-white  w-full text-xs h-[100px] object-cover"
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