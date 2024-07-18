import React, { useContext, useEffect, useState } from "react";
import LoadingSpin from "./LoadingSpin.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";

const Annotations = ({ Layers }) => {
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext);
    const [isLoading, setIsLoading] = useState(false);

    const [layers, setLayers] = Layers;

    useEffect(() => {
        setIsLoading(Object.keys(layers).length === 0 || Object.keys(annotationList).length === 0);
    }, [layers, annotationList]);

    const handleLayerVisibility = (seriesUid, groupUid, type) => {
        setAnnotationList((prevAnnotationList) => {
            if (type === 'series') {
                const allGroupsVisible = Object.keys(prevAnnotationList[seriesUid][0].group).every(
                    (groupUid) => prevAnnotationList[seriesUid][0].group[groupUid].visible
                );
                Object.values(layers[seriesUid]).forEach((layer) => {
                    layer.setVisible(!allGroupsVisible);
                });

                return {
                    ...prevAnnotationList,
                    [seriesUid]: [{
                        ...prevAnnotationList[seriesUid][0],
                        group: Object.keys(prevAnnotationList[seriesUid][0].group).reduce((acc, groupUid) => {
                            acc[groupUid] = {
                                ...prevAnnotationList[seriesUid][0].group[groupUid],
                                visible: !allGroupsVisible,
                            };
                            return acc;
                        }, {}),
                    }],
                };
            } else if (type === 'group') {
                layers[seriesUid][groupUid].setVisible(!prevAnnotationList[seriesUid][0].group[groupUid].visible);
                return {
                    ...prevAnnotationList,
                    [seriesUid]: [
                        {
                            ...prevAnnotationList[seriesUid][0],
                            group: {
                                ...prevAnnotationList[seriesUid][0].group,
                                [groupUid]: {
                                    ...prevAnnotationList[seriesUid][0].group[groupUid],
                                    visible: !prevAnnotationList[seriesUid][0].group[groupUid].visible,
                                },
                            },
                        },
                    ],
                };
            }
            return prevAnnotationList;
        });
    };

    if (isLoading) {
        return (
            <div className="flex justify-center">
                <LoadingSpin className="w-8 h-8 mt-5" />
            </div>
        );
    }

    if (Object.keys(annotationList).length !== 0 && annotationList !== undefined) {
        return (
            <>
                {Object.entries(annotationList).map(([seriesUid, annotations]) => {
                    if (!annotations[0] || !annotations[0].seriesUid || !annotations[0].group) {
                        console.error("Invalid annotation structure", annotations);
                        return null;
                    }
                    const group = annotations[0].group;
                    return (
                        <div key={seriesUid} className="m-2 text-sm">
                            <div className="flex">
                                <input
                                    type="checkbox"
                                    className="mr-3"
                                    onChange={() => handleLayerVisibility(seriesUid, null, 'series')}
                                    checked={Object.keys(group).every(
                                        (groupUid) => group[groupUid].visible
                                    )}
                                />
                                <div>
                                    <div>Accession# : {annotations[0].accessionNumber}</div>
                                </div>
                            </div>
                            {Object.keys(group).map((key) => {
                                const groupUid = group[key].groupUid;
                                return (
                                    <div key={groupUid} className="m-2 text-sm">
                                        <div className="flex">
                                            <input
                                                type="checkbox"
                                                className="mr-3"
                                                onChange={() => handleLayerVisibility(seriesUid, groupUid, 'group')}
                                                checked={group[key].visible}
                                            />
                                            <div>
                                                <div>GroupName : {group[key].groupName}</div>
                                                <div className="flex items-center">
                                                    Color :
                                                    <span
                                                        className="w-6 h-3 ml-2"
                                                        style={{ backgroundColor: group[key].color }}
                                                    ></span>
                                                </div>
                                                <div className="hidden">Visible : {group[key].visible ? "true" : "false"}</div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </>
        );
    } else {
        return (
            <div>
                <LoadingSpin className="w-10 h-10 border-4 mt-2 mr-2" />
            </div>
        );
    }
};

export default Annotations;
