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
    const [isReportOpen, setIsReportOpen] = useState(true)
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

    const RightDrawerOpen = () => {
        setIsRightOpen(!isRightOpen)
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
                    console.log('seriesJson', seriesJson)
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
                            const accessionNumber = series["00080050"]?.Value[0] ?? "unknown";
                            ann.push([seriesId, accessionNumber]);
                        }
                    }
                    setSmSeries(sm);
                    setAnnSeries(ann);
                    if (!seriesUidFromPreviewImage) {
                        setSeriesUID(SeriesUID);
                        // setSeriesUID(seriesJson[0]?.["0020000E"]?.Value[0]);
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
            setAnnotationList(annotations);
        }

        processAnnotations();
    }, [annSeries])

    const handleMessageChange = (message) => {
        const {name, type, seriesUid, groupUid, smSeriesUid} = message
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
            cancel: 'cancel'
        }

        if (actionMap[name]) {
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
    };

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

    const handleDeleteAnn = (index) => {
        const newIndex = index + 1
        fetch(`${combineUrl(server)}/studies/${studyUid}/series/${AllSeriesID[newIndex]}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const newAnnAccessionNumber = annSeries.filter((item) => item[0] !== AllSeriesID[newIndex])
        setAnnSeries(newAnnAccessionNumber)
    }

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
                />
                <div className={`custom-height w-full flex grow`}>
                    {isLeftOpen &&
                        <LeftDrawer labelOpen={labelOpen}
                                    handleLabelOpen={handleLabelOpen}
                                    smSeries={smSeries}
                                    seriesUid={[seriesUID, setSeriesUID]}
                                    detail={patientDetails}
                                    studyUid={studyUid}
                                    server={server}
                        />
                    }
                    {isReportOpen && (<Report/>)}
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
