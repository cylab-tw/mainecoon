import React from "react";
import PatientDetails from "./PatientDetails.jsx";
import DescriptionPlate from "./DescriptionPlate.jsx";
import {combineUrl} from "../../../lib/search/index.js";

const LeftDrawer = ({detail, labelOpen, smSeries, seriesUid, studyUid, server,handleLabelOpen}) => {
    const [seriesUId, setSeriesUId] = seriesUid;

    function navigateTo(e) {
        setSeriesUId(e.target.value)
    }

    return (
        <div className={`!h-100 w-3/12 overflow-auto `}>
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
                                <div key={index}
                                     className={`${seriesUID === seriesUid[0] ? "bg-gray-200" : ""} hover:bg-green-100 pb-2`}>
                                    <button
                                        className="text-sm font-bold font-sans w-full p-2 text-left"
                                        onClick={(e) => navigateTo(e, seriesUID)}
                                        value={seriesUID}>{seriesName}</button>
                                    <img
                                        key={seriesUid}
                                        src={`${combineUrl(server)}/studies/${studyUid}/series/${seriesUID}/thumbnail`}
                                        className="break-all border bg-white text-xs mx-4 w-11/12 h-[100px] object-cover"
                                    />
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