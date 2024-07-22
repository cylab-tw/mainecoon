import React, { useContext, useEffect, useState } from "react";
import LoadingSpin from "./LoadingSpin.jsx";
import { Icon } from "@iconify/react";
import mdiVectorPoint from "@iconify-icons/mdi/vector-point";
import mdiVectorPolyline from "@iconify-icons/mdi/vector-polyline";
import mdiVectorPolygon from "@iconify-icons/mdi/vector-polygon";
import mdiEllipseOutline from "@iconify-icons/mdi/ellipse-outline";
import mdiRectangleOutline from "@iconify-icons/mdi/rectangle-outline";
import mdiAddSeries from "@iconify-icons/mdi/add.js";
import mditrashcan from "@iconify-icons/mdi/trashcan";
import GeometryPicker from "./GeometryPicker.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";

const Annotations = ({ Layers, Loading, onMessageChange,CurrentDraw }) => {
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext);
    const [isLoading, setIsLoading] = useState(false);
    const [openPickers, setOpenPickers] = useState({});
    const [layers, setLayers] = Layers;
    const [currentDraw, setCurrentDraw] = CurrentDraw;

    const drawTypes = {
        POINT: mdiVectorPoint,
        POLYLINE: mdiVectorPolyline,
        POLYGON: mdiVectorPolygon,
        ELLIPSE: mdiEllipseOutline,
        RECTANGLE: mdiRectangleOutline,
    };

    const handleLayerVisibility = (e, seriesUid, groupUid, type) => {
        e.stopPropagation();
        setAnnotationList((prevAnnotationList) => {
            if (type === "series") {
                const allGroupsVisible = Object.keys(prevAnnotationList[seriesUid][0].group).every(
                    (groupUid) => prevAnnotationList[seriesUid][0].group[groupUid].visible
                );
                if (layers[seriesUid]) {
                    Object.values(layers[seriesUid]).forEach((layer) => {
                        layer.setVisible(!allGroupsVisible);
                    });
                }
                return {
                    ...prevAnnotationList,
                    [seriesUid]: [
                        {
                            ...prevAnnotationList[seriesUid][0],
                            group: Object.keys(prevAnnotationList[seriesUid][0].group).reduce((acc, groupUid) => {
                                acc[groupUid] = {
                                    ...prevAnnotationList[seriesUid][0].group[groupUid],
                                    visible: !allGroupsVisible,
                                };
                                return acc;
                            }, {}),
                        },
                    ],
                };
            } else if (type === "group") {
                if (layers[seriesUid]) {
                    layers[seriesUid][groupUid].setVisible(!prevAnnotationList[seriesUid][0].group[groupUid].visible);
                }
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

    const openGroup = (seriesUid) => {
        setAnnotationList((prevAnnotationList) => {
            return {
                ...prevAnnotationList,
                [seriesUid]: [
                    {
                        ...prevAnnotationList[seriesUid][0],
                        status: !prevAnnotationList[seriesUid][0].status,
                    },
                ],
            };
        });
    };

    const openGeometryPicker = (event, seriesUid) => {
        event.stopPropagation();
        setOpenPickers((prev) => ({
            ...prev,
            [seriesUid]: !prev[seriesUid],
        }));
    };

    const AddNewGroup = (seriesUid, value) => {
        const groupLength = Object.keys(annotationList[seriesUid][0].group).length;
        setCurrentDraw({seriesUid:seriesUid,index:groupLength})
        onMessageChange({ name: "addGroup", type: value, seriesUid: seriesUid, groupUid: "" });
    };

    const handleCurrentDraw = (seriesUid, groupUid, value, index) => {
        onMessageChange({ name: "currentDraw", type: value, seriesUid: seriesUid, groupUid: groupUid });
        setCurrentDraw({seriesUid:seriesUid,index:index})
    };

    const deleteAnn = (e,seriesUid, groupUid) => {
        e.stopPropagation()
        if(groupUid){
            onMessageChange({ name: "deleteGroup",seriesUid: seriesUid, groupUid: groupUid  });
        }else if(!groupUid){
            onMessageChange({ name: "deleteSeries",seriesUid: seriesUid });
        }
        setCurrentDraw({seriesUid:"",index:""})
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
                        <div key={seriesUid} className="text-sm">
                            <div className="flex items-center bg-green-100 border-b border-gray-200/50" onClick={() => openGroup(seriesUid)}>
                                {!Loading ? (
                                    <input
                                        type="checkbox"
                                        className="ml-2 h-5 w-5"
                                        onChange={(e) => handleLayerVisibility(e, seriesUid, null, "series")}
                                        checked={Object.keys(group).every((groupUid) => group[groupUid].visible)}
                                    />
                                ) : (
                                    <div className="ml-2 h-full flex items-center justify-center">
                                        <div
                                            className="w-4 h-4 border-b-green-400 rounded-full animate-spin"
                                            style={{ borderWidth: "3px" }}
                                        />
                                    </div>
                                )}
                                <div className="flex items-center w-full justify-between ml-2 p-2">
                                    <div>Accession# : {annotations[0].accessionNumber}</div>
                                    <div className="flex items-center">
                                        <button
                                            className="border-1 hover:bg-blue-500 hover:text-white rounded font-sans font-bold text-sm mr-0.5 p-1"
                                            onClick={(e) => openGeometryPicker(e, seriesUid)}
                                        >
                                            {annotations[0].editable &&
                                                <Icon icon={mdiAddSeries} className="h-5 w-5 "/>}
                                        </button>
                                        <div className="relative">
                                            <div
                                                className={`absolute bg-white right-0 border-2 rounded-xl p-2 mt-3 flex ${
                                                    openPickers[seriesUid] ? "" : "hidden"
                                                }`}
                                            >
                                                <GeometryPicker
                                                    seriesUid={seriesUid}
                                                    onPick={(value) => AddNewGroup(seriesUid, value)}
                                                    onClick={(e) => openGeometryPicker(e, seriesUid)}
                                                />
                                            </div>
                                        </div>
                                        <button
                                            className="border-1 hover:bg-red-400 hover:text-white text-red-500 rounded font-sans font-bold text-sm mr-0.5 p-1"
                                            onClick={(e) => deleteAnn(e,seriesUid)}>
                                            {annotations[0].editable &&
                                                <Icon icon={mditrashcan} className="h-5 w-5"/>}
                                        </button>
                                        <Icon
                                            icon={annotations[0].status ? "line-md:chevron-small-up" : "line-md:chevron-small-down"}
                                            width="20"
                                            height="20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm ${annotations[0].status ? "" : "hidden"}`}>
                                {Object.keys(group).map((key, index) => {
                                    const groupUid = group[key].groupUid;
                                    return (
                                        <div key={groupUid}
                                             className={`py-2 flex ${((currentDraw.index === index) && (currentDraw.seriesUid === seriesUid)) ? "bg-gray-200/70" : ""}`}>
                                            <div className={`flex items-center w-full ml-6 `}>
                                                <input type="checkbox"
                                                    className="mr-3 h-5 w-5 bg-green-300"
                                                    onChange={(e) => handleLayerVisibility(e, seriesUid, groupUid, "group")}
                                                    checked={group[key].visible}
                                                />
                                                <div className="w-full flex justify-between"
                                                     {...(annotations[0].editable && {onClick: () => handleCurrentDraw(seriesUid, groupUid, group[key].graphicType, index)})}
                                                >
                                                    <div className="flex">
                                                        {group[key].groupName}
                                                        <div className="flex items-center ml-2">
                                                            <Icon icon={drawTypes[group[key].graphicType]} className="h-5 w-5 mx-2"/>
                                                            <span className="w-6 h-3 ml-2" style={{backgroundColor: group[key].color}}/>
                                                        </div>
                                                    </div>
                                                    <div className="hidden">Visible : {group[key].visible ? "true" : "false"}</div>
                                                </div>
                                            </div>
                                            <div className="justify-end rounded hover:bg-red-400 p-1 hover:text-red-50 text-red-500 mr-2"
                                                 onClick={(e) => deleteAnn(e,seriesUid, groupUid)}>
                                                {annotations[0].editable &&
                                                    <Icon icon={mditrashcan} className="h-5 w-5"/>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </>
        );
    }

    return null;
};

export default Annotations;
