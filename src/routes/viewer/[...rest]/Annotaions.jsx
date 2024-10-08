import React, {useContext, useEffect, useRef, useState} from "react";
import {Icon} from "@iconify/react";
import mdiVectorPoint from "@iconify-icons/mdi/vector-point";
import mdiVectorPolyline from "@iconify-icons/mdi/vector-polyline";
import mdiVectorPolygon from "@iconify-icons/mdi/vector-polygon";
import mdiEllipseOutline from "@iconify-icons/mdi/ellipse-outline";
import mdiRectangleOutline from "@iconify-icons/mdi/rectangle-outline";
import mdiAddSeries from "@iconify-icons/mdi/add.js";
import mdiTrashCan from "@iconify-icons/mdi/trashcan";
import GeometryPicker from "./GeometryPicker.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";

const Annotations = ({Layers, Loading, onMessageChange, CurrentDraw,handleDeleteAnn}) => {
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext);
    const [openPickers, setOpenPickers] = useState({});
    const [layers, setLayers] = Layers;
    const [currentDraw, setCurrentDraw] = CurrentDraw;
    const annotationsRef = useRef({});
    annotationsRef.current = annotationList;

    useEffect(() => {
        console.log("annotationList", annotationList);
    }, [annotationList]);

    const drawTypes = {
        POINT: 'tabler:point-filled',
        POLYLINE: 'material-symbols:line-curve',
        POLYGON: mdiVectorPolygon,
        ELLIPSE: mdiEllipseOutline,
        RECTANGLE: mdiRectangleOutline,
    };

    const handleLayerVisibility = (e, seriesUid, groupUid, type) => {
        e.stopPropagation();
        setAnnotationList((prevAnnotationList) => {
            const updatedAnnotationList = {...prevAnnotationList};
            const seriesAnnotations = updatedAnnotationList[seriesUid][0];
            if (type === "series") {
                const allGroupsVisible = Object.keys(seriesAnnotations.group).every(
                    (groupUid) => seriesAnnotations.group[groupUid].visible
                );
                if (layers[seriesUid]) {
                    Object.values(layers[seriesUid]).forEach((layer) =>
                        layer.setVisible(!allGroupsVisible)
                    );
                }
                Object.keys(seriesAnnotations.group).forEach((groupUid) => {
                    seriesAnnotations.group[groupUid].visible = !allGroupsVisible;
                });
            } else if (type === "group") {
                seriesAnnotations.group[groupUid].visible =
                    !seriesAnnotations.group[groupUid].visible;
                if (layers[seriesUid]) {
                    layers[seriesUid][groupUid].setVisible(
                        seriesAnnotations.group[groupUid].visible
                    );
                }
            }
            return updatedAnnotationList;
        });
    };

    // 控制Group的顯示
    const handleGroupStatus = (seriesUid) => {
        setAnnotationList((prevAnnotationList) => {
            const updatedAnnotationList = {...prevAnnotationList};
            updatedAnnotationList[seriesUid][0].status = !updatedAnnotationList[seriesUid][0].status;
            return updatedAnnotationList;
        });
    };

    const handleGeometryPicker = (event, seriesUid) => {
        event.stopPropagation();
        setOpenPickers((prev) => ({
            ...prev,
            [seriesUid]: !prev[seriesUid],
        }));
    };

    const AddNewGroup = (seriesUid, value) => {
        const groupLength = Object.keys(annotationList[seriesUid][0].group).length;
        setCurrentDraw({seriesUid: seriesUid, index: groupLength})
        onMessageChange({name: "addGroup", type: value, seriesUid: seriesUid, groupUid: ""});
    };

    const updateCurrentDraw = (seriesUid, groupUid, value, index) => {
        onMessageChange({name: "currentDraw", type: value, seriesUid: seriesUid, groupUid: groupUid});
        setCurrentDraw({seriesUid: seriesUid, index: index})
    };

    const deleteAnnotation = (e, seriesUid, groupUid) => {
        e.stopPropagation()
        if (groupUid) {
            onMessageChange({name: "deleteGroup", seriesUid: seriesUid, groupUid: groupUid});
        } else if (!groupUid) {
            onMessageChange({name: "deleteSeries", seriesUid: seriesUid});
        }
        setCurrentDraw({seriesUid: "", index: ""})
    }

    const handlePanTo = (action,seriesUid,groupUid,centerCoordinates,currentCenterCoordinatesIndex) => {
        onMessageChange({name: "panTo",action:action,seriesUid:seriesUid,groupUid:groupUid,currentCenterCoordinatesIndex:currentCenterCoordinatesIndex,centerCoordinates: centerCoordinates});
    }

    const [openPanTools, setOpenPanTools] = useState({});

    const togglePanTools = (event, groupUid) => {
        event.stopPropagation();
        setOpenPanTools(prevState => ({
            ...prevState,
            [groupUid]: !prevState[groupUid]
        }));
    };

    if (Object.keys(annotationsRef.current).length !== 0 && annotationsRef.current !== undefined) {
        return (
            <>
                {Object.entries(annotationsRef.current).map(([seriesUid, annotations]) => {
                    if (!annotations[0] || !annotations[0].seriesUid || !annotations[0].group) {
                        console.error("Invalid annotation structure", annotations);
                        return null;
                    }
                    const {group, editable, accessionNumber, status} = annotations[0];
                    return (
                        <div key={seriesUid} className="text-sm font-medium">
                            <div className="flex items-center bg-green-100 border-b border-gray-200/50"
                                 onClick={() => handleGroupStatus(seriesUid)}>
                                {!Loading ? (
                                    <input
                                        type="checkbox"
                                        className="ml-2 h-5 w-5"
                                        onChange={(e) =>
                                            handleLayerVisibility(e, seriesUid, null, "series")
                                        }
                                        checked={Object.keys(group).every((groupUid) => group[groupUid].visible)}
                                    />
                                ) : (
                                    <div className="ml-2 h-full flex items-center justify-center">
                                        <div
                                            className="w-4 h-4 border-b-green-400 rounded-full animate-spin"
                                            style={{borderWidth: "3px"}}
                                        />
                                    </div>
                                )}
                                <div className="flex items-center w-full justify-between ml-2 p-2 ">
                                    <div className="p-1.5">Accession # : {accessionNumber}</div>
                                    <div className="flex items-center">
                                        {editable && (
                                            <button
                                                className="border-1 hover:bg-blue-500 hover:text-white rounded font-sans font-bold text-sm mr-0.5 p-1"
                                                onClick={(e) => handleGeometryPicker(e, seriesUid)}
                                            >
                                                <Icon icon={mdiAddSeries} className="h-5 w-5"/>
                                            </button>
                                        )}
                                        <div className="relative">
                                            <div
                                                className={`absolute bg-white right-0 border-2 rounded-xl p-2 mt-3 flex z-50 ${
                                                    openPickers[seriesUid] ? "" : "hidden"
                                                }`}
                                            >
                                                <GeometryPicker
                                                    seriesUid={seriesUid}
                                                    onPick={(value) => AddNewGroup(seriesUid, value)}
                                                    onClick={(e) => handleGeometryPicker(e, seriesUid)}
                                                />
                                            </div>
                                        </div>
                                        {editable ? (
                                            <button
                                                className="border-1 hover:bg-red-400 hover:text-white text-red-500 rounded font-sans font-bold text-sm mr-0.5 p-1"
                                                onClick={(e) => deleteAnnotation(e, seriesUid)}
                                            >
                                                <Icon icon={mdiTrashCan} className="h-5 w-5"/>
                                            </button>
                                        ): (
                                            <button
                                                className="border-1 hover:bg-blue-400 hover:text-white text-blue-500 rounded font-sans font-bold text-sm mr-0.5 p-1"
                                                onClick={(e) => handleDeleteAnn(e, seriesUid)}
                                            >
                                                <Icon icon={mdiTrashCan} className="h-5 w-5"/>
                                            </button>
                                        )}
                                        <Icon
                                            icon={status ? "line-md:chevron-small-up" : "line-md:chevron-small-down"}
                                            width="20" height="20"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className={`text-sm ${status ? "" : "hidden"}`}>
                                {Object.keys(group).map((key, index) => {
                                    const {groupUid, groupName, graphicType, color, visible,centerCoordinates,currentCenterCoordinatesIndex} = group[key];
                                    const isOpen = openPanTools[groupUid] || false;
                                    return (
                                        <div
                                            key={groupUid}
                                            className={`flex 
                                            ${currentDraw.index === index && currentDraw.seriesUid === seriesUid ? "bg-gray-200/70" : ""}`}
                                        >
                                            <div className="flex items-center w-full h-full">
                                                {!Loading ? (
                                                    <input
                                                        type="checkbox"
                                                        className="mr-3 h-5 w-5 ml-8 my-3"
                                                        onChange={(e) =>
                                                            handleLayerVisibility(e, seriesUid, groupUid, "group")
                                                    }
                                                        checked={visible}
                                                    />
                                                    ): (
                                                    <div className="ml-8 my-3 mr-3 h-full flex items-center justify-center">
                                                        <div
                                                            className="w-5 h-5 border-b-green-400 rounded-full animate-spin"
                                                            style={{borderWidth: "3px"}}
                                                        />
                                                    </div>
                                                )}
                                                <div
                                                    className="w-full flex justify-between"
                                                    {...(editable && {
                                                        onClick: () =>
                                                            updateCurrentDraw(
                                                                seriesUid,
                                                                groupUid,
                                                                graphicType,
                                                                index
                                                            ),
                                                    })}
                                                >
                                                    <div className="flex">{groupName}
                                                        <div className="flex items-center ml-2 ">
                                                            <abbr title={graphicType}>
                                                            <Icon icon={drawTypes[graphicType]} className="h-5 w-5 mx-2 rotate-[20deg]"/>
                                                            </abbr>
                                                            <span
                                                                className="w-6 h-3 ml-2"
                                                                style={{backgroundColor: color}}
                                                            />

                                                        </div>
                                                    </div>
                                                    {editable === false && (
                                                    <div className="flex items-center">
                                                        <span className="mr-3">{currentCenterCoordinatesIndex}/{centerCoordinates?.length}</span>
                                                        <button className="mr-3"
                                                                onClick={(e) => togglePanTools(e, groupUid)}>
                                                            <Icon icon="carbon:map" className="h-6 w-6 text-red-500"/>
                                                        </button>
                                                        <div className="relative">
                                                            <div
                                                                className={`absolute bg-white p-1.5 border border-red-100 right-2 mt-4 flex ${isOpen ? '' : 'hidden'}`}>
                                                                <button className="hover:bg-red-400 bg-white hover:text-white text-red-400 rounded-l font-sans font-bold text-sm p-0.5 border border-red-400 "
                                                                        onClick={() => handlePanTo('pre', seriesUid, groupUid, centerCoordinates, currentCenterCoordinatesIndex)}>
                                                                    <p className="h-6 w-6 ">&lt;</p>
                                                                </button>
                                                                <button className="hover:bg-red-400 bg-white hover:text-white text-red-400 rounded-r font-sans font-bold text-sm p-0.5 border border-red-400 "
                                                                    onClick={() => handlePanTo('next', seriesUid, groupUid, centerCoordinates, currentCenterCoordinatesIndex)}>
                                                                    <p className="h-6 w-6">&gt;</p>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>)}
                                                </div>
                                            </div>
                                            {editable && (
                                                <div className="flex items-center">
                                                    <div
                                                        className="justify-end rounded hover:bg-red-400 p-1 hover:text-red-50 text-red-500 mr-2"
                                                        onClick={(e) => deleteAnnotation(e, seriesUid, groupUid)}
                                                    >
                                                        <Icon icon={mdiTrashCan} className="h-5 w-5"/>
                                                    </div>
                                                </div>
                                            )}
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
