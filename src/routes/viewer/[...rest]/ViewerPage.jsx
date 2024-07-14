import React, {useContext, useEffect, useState} from 'react';
import MicroscopyViewer from './MicroscopyViewer';
import {combineUrl, fetchPatientDetails} from "../../../lib/search/index.js";
import {Icon} from "@iconify/react";
import ViewerPageHeader from "./ViewerHeader.jsx";
import LeftDrawer from "./LeftDrawer.jsx"
import {ServerContext} from "../../../lib/ServerContext.jsx";
import {Report} from "../../report/Report.jsx";
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {getSlideLabel, getSpecimenList} from "../../../lib/image/index.js";
import RightDrawer from "./RightDrawer.jsx";

const ViewerPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const baseUrl = combineUrl(server)
    const studyUid = searchParams.get('studyUid');
    const seriesUidFromPreviewImage = searchParams.get('seriesUid');
    const [seriesUID, setSeriesUID] = useState('');
    const [AllSeriesID, setAllSeriesID] = useState([])

    const [smSeries, setSmSeries] = useState([]);
    const [annSeries, setAnnSeries] = useState([]);

    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);

    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isReportOpen, setIsReportOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);
    const [labelOpen, setLabelOpen] = useState([1, 1, 1, 0, 1, 1])

    const [drawType, setDrawType] = useState(null);
    const [save, setSave] = useState(false)
    const [layers, setLayers] = useState({})
    const [undo, setUndo] = useState([]);

    const [annCheckboxList, setAnnCheckboxList] = useState([])
    const [annColor, setAnnColor] = useState("#FF0000");
    const [specimen, setSpecimen] = useState({
        "Description": "",
        "Anatomicalstructure": "",
        "Collectionmethod": "",
        "Parentspecimen": "",
        "Tissuefixative": "",
        "Tissueembeddingmedium": ""
    })
    const [groupName, setGroupName] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState([]);
    const [color, setColor] = useState([])
    const [data, setData] = useState([]);
    const patientDetails = fetchPatientDetails(data[0])



    const RightDrawerOpen = () => { setIsRightOpen(!isRightOpen) };

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
                    for (const series of seriesJson) {
                        const attribute = series["00080060"]?.Value[0];
                        const seriesId = series["0020000E"]?.Value[0];
                        AllSeriesID.push(seriesId);
                        if (attribute === "SM") {
                            const slideTitle = await getSlideLabel(baseUrl, studyUid, seriesId);
                            sm.push([seriesId, slideTitle]);
                        } else if (attribute === "ANN") {
                            const accessionNumber = series["00080050"]?.Value[0] ?? "unknown";
                            ann.push([seriesId, accessionNumber]);
                        }
                    }
                    setSmSeries(sm);
                    setAnnSeries(ann);
                    if (!seriesUidFromPreviewImage) {
                        setSeriesUID(seriesJson[0]?.["0020000E"]?.Value[0]);
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
            const imagingInfo = await getImagingInfo(baseUrl, studyUid, SeriesUID);
            setImages(imagingInfo);
        };
        const fetchDetails = async () => {
            try {
                if (studyUid === null || seriesUID === null || studyUid === "" || seriesUID === "") return;
                const url = `${combineUrl(server)}/studies/${studyUid}/series/${seriesUID}/metadata`
                const response = await fetch(url)
                const data = await response.json();
                const specimenResult = getSpecimenList(data[0])
                setSpecimen(specimenResult)
            } catch (e) {
                console.log('error', e)
            }
        }
        fetchData();
        fetchDetails()
    }, [server, studyUid, seriesUID]);

    // 依據annAccessionNumber抓出對應的annotations
    useEffect(() => {
        async function processAnnotations() {
            const promises = annSeries.map(async (ann) => {
                const key = ann[0];
                const instances = await getAnnotations(baseUrl, studyUid, key);
                return instances;
            });
            const instances = await Promise.all(promises);
            console.log("instances", instances)
            setAnnotations(instances);
        }

        processAnnotations();
    }, [annSeries]);

    // 依據groupName長度，設定checkboxList佔位(全設為false)
    useEffect(() => {
        const length = groupName.length
        const checkboxList = []
        for (let i = 0; i < length; i++) {
            annCheckboxList.push(false)
        }
        setAnnCheckboxList(checkboxList)
    }, [groupName]);

    // 抓回MicroscopyViewer的layers轉為陣列存入 && 確認annotation已加到layer裡面(進到layers裡面就設為true)
    // 4 => 原先layers裡有保底4個layers
    const handleMessageChange = (message) => {
        const layerArray = message.array_
        const annList = [...groupName]
        let color = []
        for (let i = 4; i < layerArray.length; i++) {
            annList[i - 4] = true
            color.push(layerArray[i].style_.stroke_.color_)
        }
        setColor(color)
        setLayers(message)
        setAnnCheckboxList(annList)
    }

    // 處理內層checkbox打勾時，外層checkbox也要打勾
    // num = 0 代表 內層全部打勾，外層打勾
    // num = 1 代表 外層打勾，內層全部打勾
    const handleChecked = (_, index, seriesUID, num) => {
        const newIndex = index + 4;
        const layerArray = layers.getArray()
        const length = newIndex
        if (layerArray[length]) layerArray[length].setVisible(!layerArray[length].values_.visible)
        if (num == 0) {
            let checked = false
            document.querySelectorAll(`[data-index='${seriesUID}']`).forEach(
                (item) => {
                    if (item.checked === true)
                        checked = true
                })
            document.getElementById(seriesUID).checked = checked
        }
    }

    const handleColorChange = (index, newcolor) => {
        const newIndex = index + 4;
        const layerArray = layers.getArray()
        const length = newIndex
        if (layerArray[length]) layerArray[length].style_.stroke_.color_ = newcolor
        const newColorArray = [...color];
        newColorArray[index] = String(newcolor);
        setColor(newColorArray);
    }

    // 處理外層checkbox打勾時，內層checkbox全部打勾
    const handleInnerChecked = (e, index, index0) => {
        if (!expandedGroups.includes(index)) {
            setExpandedGroups([...expandedGroups, index0]);
        }
        // 利用dataset用法，取得data-index的值
        document.querySelectorAll(`[data-index='${index}']`).forEach(
            (item) => {
                item.checked = e.target.checked
                const groupIndex = Number(item.dataset.groupindex)
                handleChecked(null, groupIndex, seriesUID, 1)
            })
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

    console.log("layers", layers)
    return (
        <>
            <div className="flex custom-height w-auto flex-col">
                <ViewerPageHeader annColor={[annColor, setAnnColor]}
                                  drawType={[drawType, setDrawType]}
                                  undo={[undo, setUndo]}
                                  save={[save, setSave]}
                                  isLeftOpen={[isLeftOpen, setIsLeftOpen]}
                                  isReportOpen={[isReportOpen, setIsReportOpen]}
                                  labelOpen={labelOpen}
                                  detail={patientDetails}
                />
                <div className={`h-full w-full flex grow`}>
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
                    {/*{isReportOpen && (<Report/>)}*/}

                    <MicroscopyViewer
                        baseUrl={baseUrl}
                        studyUid={studyUid}
                        seriesUid={seriesUID}
                        images={images}
                        annotations={annotations}
                        group={[groupName, setGroupName]}
                        drawType={drawType}
                        drawColor={annColor}
                        save={save}
                        undoState={[undo, setUndo]}
                        onMessageChange={handleMessageChange}
                        layers={[layers, setLayers]}
                    />
                    {isRightOpen ? (
                            <RightDrawer labelOpen={labelOpen}
                                         handleLabelOpen={handleLabelOpen}
                                         Specimen={specimen}
                                         annSeries={annSeries}
                                         annCheckboxList={annCheckboxList}
                                         groupName={groupName}
                                         expandedGroups={expandedGroups}
                                         handleChecked={handleChecked}
                                         handleInnerChecked={handleInnerChecked}
                                         handleColorChange={handleColorChange}
                                         color={color}
                                         handleDeleteAnn={handleDeleteAnn}
                                         RightDrawerOpen={RightDrawerOpen}
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
                    )
                    }
                </div>
            </div>

        </>
    );
}


export default ViewerPage;
