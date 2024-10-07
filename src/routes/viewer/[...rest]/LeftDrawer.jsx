import React from "react";
import { useEffect, useState } from 'react';
import PatientDetails from "./PatientDetails.jsx";
import DescriptionPlate from "./DescriptionPlate.jsx";
import {combineUrl} from "../../../lib/search/index.js";
import {getAccessToken} from "../../../token.js";

function Thumbnail({ seriesUid, studyUid, server }) {
    const [thumbnailUrl, setThumbnailUrl] = useState('');

    useEffect(() => {
        async function fetchThumbnail() {
            try {
                const oauthToken = await getAccessToken();
                const res = await fetch(
                    `${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}/thumbnail`,
                    {
                        method: 'GET',
                        headers: {
                            Accept: 'image/jpeg',
                            Authorization: 'Bearer ' + oauthToken,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch thumbnail');
                }

                const data = window.URL.createObjectURL(await res.blob());
                setThumbnailUrl(data);
            } catch (error) {
                console.error('Error fetching thumbnail:', error);
            }
        }

        if (seriesUid && studyUid && server) {
            fetchThumbnail();
        }
    }, [seriesUid, studyUid, server]);

    return (
        <img
            src={thumbnailUrl}
            alt="Thumbnail"
            className="break-all border bg-white w-full text-xs h-[100px] object-cover"
        />
    );
}

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
                                            className="text-sm font-medium text-left w-full m-0.5">{seriesName}</span>
                                        <Thumbnail seriesUid={seriesUId} studyUid={studyUid} server={server}/>
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