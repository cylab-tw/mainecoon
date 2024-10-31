import React, {useContext, useEffect, useRef, useState} from 'react';
import MicroscopyViewer from './MicroscopyViewer';
import {combineUrl, fetchPatientDetails, generateSeriesUID} from "../../../lib/search/index.js";
import {Icon} from "@iconify/react";
import ViewerPageHeader from "./ViewerHeader.jsx";
import LeftDrawer from "./LeftDrawer.jsx"
import {Report} from "../../report/Report.jsx";
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {getSlideLabel, getSpecimenList} from "../../../lib/image/index.js";
import RightDrawer from "./RightDrawer.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import {easeOut} from "ol/easing.js";
import {Circle, Fill, Stroke, Style} from "ol/style";
import {Feature, Overlay} from "ol";
import {Point} from "ol/geom.js";
import {Vector} from "ol/layer.js";
import VectorSource from "ol/source/Vector";
import {toast} from "react-toastify";

const ViewerPage = () => {
    const searchParams = new URLSearchParams(window.location.search)
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const baseUrl = combineUrl(server)
    const studyUid = searchParams.get('studyUid')
    const seriesUidFromPreviewImage = searchParams.get('seriesUid')
    const [seriesUID, setSeriesUID] = useState('')
    const [AllSeriesID, setAllSeriesID] = useState([])
    const urlInfo = {server, studyUid, seriesUID}
    const [smSeries, setSmSeries] = useState([])
    const [annSeries, setAnnSeries] = useState([])
    const [images, setImages] = useState([])
    const [annotations, setAnnotations] = useState({})
    const [isLeftOpen, setIsLeftOpen] = useState(true)
    const [isReportOpen, setIsReportOpen] = useState(false)
    const [isRightOpen, setIsRightOpen] = useState(true)
    const [labelOpen, setLabelOpen] = useState([1, 1, 1, 0, 1, 1])
    const [drawType, setDrawType] = useState(null)
    const [save, setSave] = useState(false)
    const [layers, setLayers] = useState({})
    const [data, setData] = useState([])
    const patientDetails = fetchPatientDetails(data[0])
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext)
    const [drawColor, setDrawColor] = useState('rgba(255, 0, 0, 1)')
    const [loading, setLoading] = useState(true);
    const [currentDraw, setCurrentDraw] = useState({seriesUid: "", index: ""})
    const [newSeriesInfo, setNewSeriesInfo] = useState({
        action: '',
        name: '',
        status: false,
        type: '',
        annSeriesUid: '',
        annGroupUid: '',
        smSeriesUid: ''
    })
    const [annotationSeriesUid, setAnnotationSeriesUid] = useState('')
    const [isAllDrawerOpen, setIsAllDrawerOpen] = useState(true)

    const RightDrawerOpen = () => {
        setIsRightOpen(!isRightOpen)
    }

    const LeftDrawerOpen = () => {
        setIsLeftOpen(!isLeftOpen)
    }

    const ReportOpen = () => {
        setIsReportOpen(!isReportOpen)
    }

    const handleLabelOpen = (e, value) => {
        e.preventDefault();
        const newLabelOpen = [...labelOpen];
        newLabelOpen[value] = newLabelOpen[value] === 0 ? 1 : 0;
        setLabelOpen(newLabelOpen);
    }


    useEffect(() => {
        try {
            const fetchSeries = async () => {
                try {
                    const seriesResult = await fetch(`${combineUrl(server)}/studies/${studyUid}/series`);
                    const seriesJson = await seriesResult.json();
                    let sm = [], ann = [];
                    let SeriesUID = ''
                    for (const series of seriesJson) {
                        const attribute = series["00080060"]?.Value[0];
                        const seriesId = series["0020000E"]?.Value[0];
                        AllSeriesID.push(seriesId);
                        if (attribute === "SM") {
                            const slideTitle = await getSlideLabel(baseUrl, studyUid, seriesId);
                            sm.push([seriesId, slideTitle]);
                            SeriesUID = seriesId
                        } else if (attribute === "ANN") {
                            const accessionNumber = series["00080050"]?.Value?.[0] ?? "unknown";
                            ann.push([seriesId, accessionNumber]);
                        }
                    }
                    setSmSeries(sm);
                    setAnnSeries(ann);
                    if (!seriesUidFromPreviewImage) {
                        setSeriesUID(SeriesUID);
                    } else {
                        setSeriesUID(seriesUidFromPreviewImage);
                    }

                } catch (error) {
                    console.error("Error fetching series:", error);
                }
            };

            const fetchDetails = async () => {
                try {
                    const response = await fetch(`${combineUrl(server)}/studies?ModalitiesInStudy=SM&StudyInstanceUID=${studyUid}`);
                    const data = await response.json();
                    setData(data)
                } catch (e) {
                    console.log('error', e)
                }
            }
            fetchSeries()
            fetchDetails();
        } catch (e) {
            console.log(e)
        }
    }, [server])


    useEffect(() => {
        const fetchData = async () => {
            if (studyUid === null || seriesUID === null || studyUid === "" || seriesUID === "") return;
            const series = await getSeriesInfo(baseUrl, studyUid, seriesUID);
            const SeriesUID = series?.modality === 'SM' ? seriesUID : series?.referencedSeriesUid;
            setSeriesUID(SeriesUID);
            const imagingInfo = await getImagingInfo(baseUrl, studyUid, seriesUID);
            setImages(imagingInfo);
        };
        fetchData();
    }, [seriesUID])

    // 依據annSeries抓出對應的annotations
    useEffect(() => {
        async function processAnnotations() {
            const promises = annSeries.map(async (ann) => {
                const seriesUid = ann[0];
                const instances = await getAnnotations(baseUrl, studyUid, seriesUid);
                return {seriesUid, instances};
            });
            const results = await Promise.all(promises);
            const annotations = {};
            results.forEach(({seriesUid, instances}) => {
                annotations[seriesUid] = instances;
            });
            setAnnotations(annotations)
            setAnnotationList(annotations)
        }

        processAnnotations()
    }, [annSeries])

    const [centerCoordinatesData, setCenterCoordinatesData] = useState({})

    const handleMessageChange = (message) => {
        const {
            action,
            name,
            type,
            seriesUid,
            groupUid,
            smSeriesUid,
            centerCoordinates,
            currentCenterCoordinatesIndex
        } = message
        if (name === 'deleteGroup' || name === 'deleteSeries') {
            setAnnotationSeriesUid('')
        } else {
            setAnnotationSeriesUid(seriesUid)
        }

        const actionMap = {
            addSeries: 'add',
            addGroup: 'add',
            currentDraw: 'update',
            deleteGroup: 'delete',
            deleteSeries: 'delete',
            cancel: 'cancel',
            panTo: 'panTo'
        }

        if (actionMap[name]) {
            if (name === 'panTo') {
                setCenterCoordinatesData({
                    action: action,
                    centerCoordinates: centerCoordinates,
                    currentCenterCoordinatesIndex: currentCenterCoordinatesIndex,
                    seriesUid: seriesUid,
                    groupUid: groupUid,
                })
            } else {
                setNewSeriesInfo({
                    action: actionMap[name],
                    name: name,
                    status: true,
                    type: type,
                    annSeriesUid: seriesUid,
                    annGroupUid: groupUid,
                    smSeriesUid: smSeriesUid
                })
            }
        }
    };
    const map = useRef(null);

    function panTo(action, index, centerCoordinates, seriesUid, groupUid) {
        if (centerCoordinates[index][0] !== 0 && centerCoordinates[index][1] !== 0) {
            if (map.current) {
                const view = map.current.getView();
                view.animate({
                    center: centerCoordinates[index],
                    zoom: view.getZoom() + 5, // 或者設定一個特定的縮放級別
                    duration: 1000,
                    easing: easeOut,
                });

                let markerOverlay = map.current.getOverlayById('markerOverlay');
                if (!markerOverlay) {
                    const markerElement = document.createElement('div');
                    markerElement.style.width = '3px';
                    markerElement.style.height = '3px';
                    markerElement.style.backgroundColor = 'red';
                    markerElement.style.borderRadius = '50%';

                    markerOverlay = new Overlay({
                        element: markerElement,
                        positioning: 'center-center',
                        id: 'markerOverlay'
                    });
                    map.current.addOverlay(markerOverlay);
                }

                // 設置Overlay的位置
                markerOverlay.setPosition(centerCoordinates[index]);
            }
        }
        setAnnotationList(prevAnnotations => ({
            ...prevAnnotations,
            [seriesUid]: prevAnnotations[seriesUid].map(annotation => ({
                ...annotation,
                group: {
                    ...annotation.group,
                    [groupUid]: {
                        ...annotation.group[groupUid],
                        currentCenterCoordinatesIndex:
                            action === 'next'
                                ? (index + 1) % annotation.group[groupUid].centerCoordinates.length
                                : (index - 1 + annotation.group[groupUid].centerCoordinates.length) %
                                annotation.group[groupUid].centerCoordinates.length,
                    }
                }
            }))
        }));


    }

    useEffect(() => {
        if (centerCoordinatesData.centerCoordinates) {
            panTo(
                centerCoordinatesData.action,
                centerCoordinatesData.currentCenterCoordinatesIndex,
                centerCoordinatesData.centerCoordinates,
                centerCoordinatesData.seriesUid,
                centerCoordinatesData.groupUid
            )
        }
    }, [centerCoordinatesData]);

    const handlePanToMessage = (message) => {
        const {mapRef} = message
        map.current = mapRef.current
    }

    const getDrawType = (value) => {
        const {name, type} = value;
        setDrawType(type);
        if (name === 'cancel') {
            setAnnotationSeriesUid('')
            setCurrentDraw({seriesUid: "", index: ""});
            handleMessageChange({name: 'cancel', type: '', seriesUid: '', groupUid: '', smSeriesUid: ''});
        } else if (name === 'drawtype') {
            if (annotationSeriesUid === "") {
                const seriesUid = generateSeriesUID();
                handleMessageChange({
                    name: 'addSeries',
                    type: type,
                    seriesUid: seriesUid,
                    groupUid: '',
                    smSeriesUid: seriesUID
                });
                setCurrentDraw({seriesUid: seriesUid, index: 0});
            } else {
                const groupEntries = Object.entries(annotationList[annotationSeriesUid][0].group);
                const matchingGroups = groupEntries.filter(([key, item]) => item.graphicType === type);
                if (matchingGroups.length > 0) {
                    const latestGroupEntry = matchingGroups[matchingGroups.length - 1];
                    const groupUid = latestGroupEntry[0];

                    handleMessageChange({
                        name: "currentDraw",
                        type: type,
                        seriesUid: annotationSeriesUid,
                        groupUid: groupUid
                    });
                    setCurrentDraw({seriesUid: annotationSeriesUid, index: groupEntries.indexOf(latestGroupEntry)});
                } else {
                    handleMessageChange({name: "addGroup", type: type, seriesUid: annotationSeriesUid, groupUid: ""});
                    const groupLength = Object.keys(annotationList[annotationSeriesUid][0].group).length;
                    setCurrentDraw({seriesUid: annotationSeriesUid, index: groupLength});
                }
            }
        }
    }

    // const handleDeleteAnn = (e, seriesUid) => {
    //     e.preventDefault();
    //     fetch(`${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}/delete-with-reason`, {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({
    //             reason: 'Delete annotation series',
    //         }),
    //     })
    //         .then((response) => {
    //             if (response.ok) {
    //                 // Post成功，执行delete请求
    //                 fetch(`${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}`, {
    //                     method: 'DELETE',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                 })
    //                     .then((deleteResponse) => {
    //                         if (deleteResponse.ok) {
    //                             // 删除成功，更新状态
    //                             const newAnnAccessionNumber = annSeries.filter((item) => item[0] !== seriesUid);
    //                             setAnnSeries(newAnnAccessionNumber);
    //                             // 刷新页面
    //                             window.location.reload(); // 刷新整个页面
    //
    //                         }
    //                     })
    //                     .catch((error) => {
    //                         console.error('Error deleting series:', error);
    //                     });
    //             }
    //         })
    //         .catch((error) => {
    //             console.error('Error posting delete reason:', error);
    //         });
    // };
    const handleDeleteAnn = (e, seriesUid) => {
        toast.error('刪除功能目前遇到伺服器錯誤，目前維修中')
    };


    return (
        <>
            <div className="flex h-full w-auto flex-col">
                <ViewerPageHeader drawType={[drawType, setDrawType]}
                                  save={[save, setSave]}
                                  isLeftOpen={[isLeftOpen, setIsLeftOpen]}
                                  isReportOpen={[isReportOpen, setIsReportOpen]}
                                  detail={patientDetails}
                                  onMessageChange={getDrawType}
                                  DrawColor={[drawColor, setDrawColor]}
                                  studyUid={studyUid}
                                  seriesUid={seriesUID}
                                  imageLoading={loading}
                />
                <div className={`custom-height w-full flex grow`}>
                    {isLeftOpen ? (
                        <LeftDrawer labelOpen={labelOpen}
                                    handleLabelOpen={handleLabelOpen}
                                    smSeries={smSeries}
                                    seriesUid={[seriesUID, setSeriesUID]}
                                    detail={patientDetails}
                                    studyUid={studyUid}
                                    server={server}
                                    LeftDrawerOpen={LeftDrawerOpen}
                                    isLeftOpen={[isLeftOpen, setIsLeftOpen]}
                        />) : (
                        !isReportOpen && (
                            <div className="bg-opacity-0 flex items-center z-30">
                                <div className="bg-opacity-0 absolute z-30">
                                    <button
                                        className="flex items-center bg-gray-400 align-bottom hover:bg-gray-600 text-white font-bold rounded-r-lg py-8 w-8 mb-2"
                                        onClick={LeftDrawerOpen}>
                                        <span className="rotate-90 tracking-wider">Info</span>
                                    </button>
                                    {studyUid === '1.2.826.0.1.3680043.8.498.10440910359896722642033112720879029428' && (
                                        <button
                                            className="flex items-center bg-gray-400 align-bottom m-0 hover:bg-gray-600 text-white font-bold rounded-r-lg py-8 w-8"
                                            onClick={ReportOpen}>
                                            <span className="rotate-90 tracking-wider -ml-2.5">report</span>
                                        </button>
                                    )}
                                </div>
                            </div>)
                    )}
                    {isReportOpen ? (
                        <>
                            <Report ReportOpen={ReportOpen}/>
                            {!isLeftOpen && (
                                <div className="bg-opacity-0 flex justify-start items-center z-30 mt-2 ">
                                    <div className="bg-opacity-0 absolute z-30">
                                        <button
                                            className="flex items-center bg-gray-400 align-bottom m-0 hover:bg-gray-600 text-white font-bold rounded-r-lg py-8 w-8"
                                            onClick={LeftDrawerOpen}>
                                            <span className="rotate-90 tracking-wider -ml-2.5">Info</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        isLeftOpen ? (
                            <div className="bg-opacity-0 flex justify-start items-center z-30 mt-2 ">
                                <div className="bg-opacity-0 absolute z-30">
                                    {studyUid === '1.2.826.0.1.3680043.8.498.10440910359896722642033112720879029428' && (
                                    <button
                                        className="flex items-center bg-gray-400 align-bottom m-0 hover:bg-gray-600 text-white font-bold rounded-r-lg py-8 w-8"
                                        onClick={ReportOpen}>
                                        <span className="rotate-90 tracking-wider -ml-2.5">report</span>
                                    </button>
                                        )}
                                </div>
                            </div>) : (<></>)
                    )}
                    <MicroscopyViewer
                        baseUrl={baseUrl}
                        studyUid={studyUid}
                        seriesUid={seriesUID}
                        images={images}
                        layers={[layers, setLayers]}
                        Loading={[loading, setLoading]}
                        className="grow"
                        NewSeriesInfo={[newSeriesInfo, setNewSeriesInfo]}
                        DrawColor={drawColor}
                        annotations={annotations}
                        onMessageChange={handlePanToMessage}
                    />
                    {isRightOpen ? (
                        <RightDrawer labelOpen={labelOpen}
                                     handleLabelOpen={handleLabelOpen}
                                     handleDeleteAnn={handleDeleteAnn}
                                     RightDrawerOpen={RightDrawerOpen}
                                     onMessageChange={handleMessageChange}
                                     Layers={[layers, setLayers]}
                                     Loading={loading}
                                     SMseriesUid={seriesUID}
                                     urlInfo={urlInfo}
                                     drawType={drawType}
                                     CurrentDraw={[currentDraw, setCurrentDraw]}
                        />
                    ) : (
                        <div className="bg-opacity-0 flex justify-end items-center z-30 mt-2">
                            <div className="bg-opacity-0 absolute z-30 mt-2">
                                <button
                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-l-lg px-2 py-5"
                                    onClick={RightDrawerOpen}>
                                    {'<'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </>
    );
}


export default ViewerPage;
