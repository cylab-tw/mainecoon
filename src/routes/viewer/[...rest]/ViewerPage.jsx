import React, {useContext, useEffect, useState} from 'react';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {combineUrl, fetchPatientDetails} from "../../../lib/search/index.js";
import {getDicomwebUrl} from '../../../lib/dicom-webs/server';
import {Icon} from "@iconify/react";
import ViewerPageHeader from "./ViewerHeader.jsx";
import LeftDrawer from "./LeftDrawer.jsx"
import {ServerContext} from "../../../lib/ServerContext.jsx";
import {Report} from "../../report/Report.jsx";

const ViewerPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    const seriesUidUrl = searchParams.get('seriesUid');
    const [seriesUid, setSeriesUid] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');
    const [isLeftOpen, setIsLeftOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);
    const [wadoSeries, setWadoSeries] = useState([]);
    const [smAccessionNumber, setSmAccessionNumber] = useState([]);
    const [annAccessionNumber, setAnnAccessionNumber] = useState([]);
    const [drawType, setDrawType] = useState(null);
    const [save, setSave] = useState(false)
    const [layers, setLayers] = useState({})
    const [labelOpen, setLabelOpen] = useState([1, 1, 1, 0, 1, 1])
    const [annCheckboxList, setAnnCheckboxList] = useState([])
    const [annColor, setAnnColor] = useState("#FF0000");
    const [undo, setUndo] = useState([]);
    const [specimen, setSpecimen] = useState({
        "Description": "",
        "Anatomical structure": "",
        "Collection method": "",
        "Parent specimen": "",
        "Tissue fixative": "",
        "Tissue embedding medium": ""
    })
    const [groupName, setGroupName] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState([]);
    const [color, setColor] = useState([])
    const [seriesId, setSeriesId] = useState([])
    const [data, setData] = useState([]);
    const [dicomWebServer,setDicomWebServer] = useContext(ServerContext)
    const patientDetails = fetchPatientDetails(data[0])

    useEffect(() => {
        console.log("dicomWebServer",dicomWebServer)
        console.log("seriesUidUrl",seriesUidUrl)
        try {
            // 找出第1個series
            const fetchSeries = async () => {
                const seriesResult = await fetch(`${combineUrl(server)}/studies/${studyUid}/series`)
                const seriesJson = await seriesResult.json()
                seriesJson.map((series) => {
                    seriesId.push(series["0020000E"]?.Value[0])
                })
                setSeriesUid(seriesJson[0]?.["0020000E"]?.Value[0])
            }

            const fetchDetails = async () => {
                try {
                    const response = await fetch(`${combineUrl(server)}/studies?ModalitiesInStudy=SM&StudyInstanceUID=${studyUid}`);
                    const data = await response.json();
                    setData(data)
                } catch (e) {
                    console.log('error', e)
                }
            }

            const fetchMetadata = async () => {
                try {
                    console.log("combineUrl",combineUrl(server))
                    const result = await fetch(`${combineUrl(server)}/studies/${studyUid}/series`)
                    if (result) {
                        const data = await result.json();
                        setWadoSeries(data);
                    }
                } catch (error) {
                    console.error('Error fetching metadata:', error);
                }
            };
            if(seriesUidUrl === null || seriesUidUrl === ""){
                fetchSeries()
            }else{
                setSeriesUid(seriesUidUrl)
            }
            fetchMetadata()
            fetchDetails();
        } catch (e) {
            console.log(e)
        }
    }, [dicomWebServer])


    useEffect(() => {
        let ann = []
        let sm = []
        wadoSeries.map((series) => {
            const element = series
            const modalityAttribute = element?.['00080060']?.Value ?? null;
            if (modalityAttribute == "SM") {
                const smAccesionNum = element?.['00080050']?.Value ?? null
                const metadataSM = element?.['0020000E']?.Value ?? null;
                sm.push([metadataSM[0], smAccesionNum ? smAccesionNum[0] : "unknown"])
            } else if (modalityAttribute == "ANN") {
                const annAccessionNum = element?.['00080050']?.Value ?? null
                const metadataANN = element?.['0020000E']?.Value ?? null;
                ann.push([metadataANN[0], annAccessionNum ? annAccessionNum : "unknown"])
            }
        })
        setSmAccessionNumber(sm)
        setAnnAccessionNumber(ann)
    }, [wadoSeries]);

    // 依據annAccessionNumber抓出對應的annotations
    useEffect(() => {
        async function processAnnotations() {
            let annList = annCheckboxList
            const promises = annAccessionNumber.map(async (ann) => {
                const key = ann[0];
                const instances = await getAnnotations(baseUrl, studyUid, key);
                return instances;
            });
            setAnnCheckboxList(annList)
            const instances = await Promise.all(promises);
            setAnnotations(instances);
        }

        processAnnotations();
    }, [annAccessionNumber]);


    useEffect(() => {
        const fetchData = async () => {
            if (studyUid === null || seriesUid === null || studyUid === "" || seriesUid === "") return;

            const baseUrl = getDicomwebUrl(server);
            console.log("baseUrl", baseUrl)
            setBaseUrl(baseUrl);

            const series = await getSeriesInfo(baseUrl, studyUid, seriesUid);
            const smSeriesUidd = series?.modality === 'SM' ? seriesUid : series?.referencedSeriesUid;
            setSmSeriesUid(smSeriesUidd);

            const imagingInfo = await getImagingInfo(baseUrl, studyUid, smSeriesUidd);
            setImages(imagingInfo);
            console.log("imagingInfo", imagingInfo)
        };

        const fetchDetails = async () => {
            try {
                console.log("studyUid", studyUid)
                console.log("seriesUid", seriesUid)
                if (studyUid === null || seriesUid === null || studyUid === "" || seriesUid === "") return;

                const url = `${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}/metadata`
                const response = await fetch(url)
                const data = await response.json();
                const SpecimenDescriptionSequence = data[0]?.["00400560"]?.Value[0]
                const Description = SpecimenDescriptionSequence?.["00400600"]?.Value[0] ?? "";
                const Anatomicalstructure = SpecimenDescriptionSequence?.["00082228"]?.Value?.[0]?.["00080104"]?.Value?.[0] ?? "";
                let Collectionmethod = ""
                let parentspecimen = []
                let Tissuefixative = ""
                let Tissueembeddingmedium = ""
                SpecimenDescriptionSequence?.["00400610"]?.Value?.map((s) => {
                    const s0 = s?.["00400612"]?.Value
                    s0.map((s1) => {
                        if (s1?.["0040A160"]) {
                            const ConceptNameCodeSequence = s1?.["0040A043"]?.Value?.[0]
                            const codeValue = ConceptNameCodeSequence?.["00080100"].Value?.[0]
                            if (codeValue === "111705") {
                                const codeMeaning = ConceptNameCodeSequence?.["00080104"]?.Value?.[0]
                                if (codeMeaning === "Parent Specimen Identifier") {
                                    const parentSpecimen = s1?.["0040A160"]?.Value?.[0]
                                    parentspecimen.push(parentSpecimen)
                                }
                            }
                        } else if (s1?.["0040A168"]) {
                            const ConceptCodeSequenceCodeValue = s1?.["0040A168"]?.Value?.[0]?.["00080100"]?.Value?.[0]
                            const ConceptNameCodeSequenceCodeValue = s1?.["0040A043"]?.Value?.[0]?.["00080100"]?.Value?.[0]
                            if (ConceptCodeSequenceCodeValue === "118292001") {
                                const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                                Collectionmethod = codeMeaning
                            }
                            if (ConceptCodeSequenceCodeValue === "311731000") {
                                const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                                Tissueembeddingmedium = codeMeaning
                            }
                            if (ConceptNameCodeSequenceCodeValue === "430864009") {
                                const codeMeaning = s1?.["0040A168"]?.Value?.[0]?.["00080104"]?.Value?.[0]
                                Tissuefixative = codeMeaning
                            }
                        }
                    })
                })
                setSpecimen(prevState => ({
                    ...prevState,
                    "Description": Description,
                    "Anatomical structure": Anatomicalstructure,
                    "Collection method": Collectionmethod,
                    "Parent specimen": parentspecimen,
                    "Tissue fixative": Tissuefixative,
                    "Tissue embedding medium": Tissueembeddingmedium
                }));
            } catch (e) {
                console.log('error', e)
            }
        }

        fetchData();
        fetchDetails()
    }, [server, studyUid, seriesUid,dicomWebServer]);


    // 依據groupName長度，設定checkboxList佔位(全設為false)
    useEffect(() => {
        const length = groupName.length
        const checkboxList = []
        for (let i = 0; i < length; i++) {
            annCheckboxList.push(false)
        }
        setAnnCheckboxList(checkboxList)
    }, [groupName]);


    if (images.length === 0 || !smSeriesUid) {
        return (
            <div className="flex h-full w-full bg-opacity-25 bg-gray-200/10 justify-center items-center">
                {/*<h1>Loading...</h1>*/}
                <div className="flex items-center gap-3 bg-white/75 px-2 py-3">
                    {/*<span className="h-4 w-4 border-2 border-green-500"/>*/}
                    <Icon icon="svg-spinners:6-dots-rotate" width="28" height="28" className="text-green-500"/>
                    <p className="text-xl">Loading</p>
                </div>
            </div>
        );
    }


    const RightDrawer = () => {
        setIsRightOpen(!isRightOpen);
    };


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
    const handleChecked = (_, index, seriesUid, num) => {
        const newIndex = index + 4;
        const layerArray = layers.getArray()
        const length = newIndex
        if (layerArray[length]) layerArray[length].setVisible(!layerArray[length].values_.visible)
        if (num == 0) {
            let checked = false
            document.querySelectorAll(`[data-index='${seriesUid}']`).forEach(
                (item) => {
                    if (item.checked === true)
                        checked = true
                })
            document.getElementById(seriesUid).checked = checked
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

    // 處理annGroup選單
    const handleAnnDrawer = (index) => {
        if (expandedGroups.includes(index)) {
            setExpandedGroups(expandedGroups.filter((item) => item !== index));
        } else {
            setExpandedGroups([...expandedGroups, index]);
        }
    }

    const handleLabelOpen = (e, value) => {
        e.preventDefault();
        const newLabelOpen = [...labelOpen];
        newLabelOpen[value] = newLabelOpen[value] === 0 ? 1 : 0;
        setLabelOpen(newLabelOpen);
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
                handleChecked(null, groupIndex, seriesUid, 1)
            })
    }

    const handleDeleteAnn = (index) => {
        const newIndex = index + 1
        fetch(`${combineUrl(server)}/studies/${studyUid}/series/${seriesId[newIndex]}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        const newAnnAccessionNumber = annAccessionNumber.filter((item) => item[0] !== seriesId[newIndex])
        setAnnAccessionNumber(newAnnAccessionNumber)
    }


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
                                    isLabelOpen={[labelOpen, setLabelOpen]}
                                    smAccessionNumber={smAccessionNumber}
                                    seriesUid={[seriesUid, setSeriesUid]}
                                    smSeriesUid={[smSeriesUid, setSmSeriesUid]}
                                    detail={patientDetails}
                        />
                    }
                    {isReportOpen && (<Report/>)}

                    <MicroscopyViewer
                        baseUrl={baseUrl}
                        studyUid={studyUid}
                        seriesUid={smSeriesUid}
                        images={images}
                        annotations={annotations}
                        group={[groupName, setGroupName]}
                        drawType={drawType}
                        drawColor={annColor}
                        save={save}
                        undoState={[undo, setUndo]}
                        onMessageChange={handleMessageChange}
                        className="grow"
                        layers={[layers, setLayers]}
                    />
                    {isRightOpen ? (
                        <>
                            <div className="!h-100 w-3/12 overflow-auto ">
                                <div className="flex flex-col w-full h-full border-end ">
                                    {labelOpen[3] === 0 ? (
                                        <>
                                            <div className="flex flex-row items-center bg-green-300  justify-between">
                                                <div className="flex text-left">
                                                    <div className="bg-opacity-100 flex z-30">
                                                        <button
                                                            className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                                            onClick={RightDrawer}>
                                                            {'>>'}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center" value={3}
                                                         onClick={(e) => handleLabelOpen(e, 3)}>
                                                        <label
                                                            className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex ">
                                                            Slide label
                                                            <Icon icon="fluent:slide-text-sparkle-24-filled" width="28"
                                                                  height="28" className="ml-3 text-white"/>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="mr-5">
                                                    <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                                </div>
                                            </div>
                                            <div>
                                                {/*<img*/}
                                                {/*    src={`${combineUrl(server)}/studies/${studyUid}/series/${seriesUid}/label`}*/}
                                                {/*    className="h-32 w-full border object-cover"*/}
                                                {/*    alt=""*/}
                                                {/*/>*/}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex flex-row items-center bg-green-300 justify-between">
                                                <div className="flex text-left">
                                                    <div className="bg-opacity-100 flex z-30">
                                                        <button
                                                            className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                                            onClick={RightDrawer}>
                                                            {'>>'}
                                                        </button>
                                                    </div>
                                                    <div className="flex items-center" value={3}
                                                         onClick={(e) => handleLabelOpen(e, 3)}>
                                                        <label
                                                            className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center ">
                                                            Slide label
                                                            <Icon icon="fluent:slide-text-sparkle-24-filled" width="28"
                                                                  height="28" className="ml-3 text-white"/>
                                                        </label>
                                                    </div>
                                                </div>
                                                <div className="mr-5">
                                                    <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                                </div>
                                            </div>
                                            <div className="bg-green-50">
                                                <div className="p-1.5"/>
                                            </div>
                                        </>
                                    )}
                                    {labelOpen[4] === 0 ? (
                                        <div className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                             value={4} onClick={(e) => handleLabelOpen(e, 4)}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 ">Specimens</label>
                                                <Icon icon="pajamas:details-block" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </div>
                                            <div className="mr-5">
                                                <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                                value={4} onClick={(e) => handleLabelOpen(e, 4)}>
                                                <div className="flex items-center">
                                                    <label
                                                        className="ml-28 text-lg mt-2 font-bold font-sans mb-2 ">Specimens</label>
                                                    <Icon icon="pajamas:details-block" width="28" height="28"
                                                          className="ml-3 text-white"/>
                                                </div>
                                                <div className="mr-1">
                                                    <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                                </div>
                                            </div>
                                            <div className="bg-green-50">
                                                <div className="p-1.5">
                                                    {specimen.Description && (
                                                        <span className="block ml-2 text-md mt-2 ">
                                                            <span
                                                                className="font-bold">Description : </span>{specimen.Description}
                                                        </span>
                                                    )}
                                                    {specimen["Anatomical structure"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Anatomical structure : </span>{specimen["Anatomical structure"]}</span>
                                                    )}
                                                    {specimen["Collection method"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Collection method : </span>{specimen["Collection method"]}</span>
                                                    )}
                                                    {specimen["Parent specimen"] && (
                                                        specimen["Parent specimen"].map((parent, index) => (
                                                            <span key={index} className="block ml-2 text-md mt-2"><span
                                                                className="font-bold">Parent specimen : </span>{parent}</span>
                                                        ))
                                                    )}
                                                    {specimen["Parent specimen1"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Parent specimen 1 : </span>{specimen["Parent specimen1"]}</span>
                                                    )}
                                                    {specimen["Parent specimen2"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Parent specimen 2 : </span>{specimen["Parent specimen2"]}</span>
                                                    )}
                                                    {specimen["Tissue fixative"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Tissue fixative : </span>{specimen["Tissue fixative"]}</span>
                                                    )}
                                                    {specimen["Tissue embedding medium"] && (
                                                        <span className="block ml-2 text-md mt-2"><span
                                                            className="font-bold">Tissue embedding medium : </span>{specimen["Tissue embedding medium"]}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {labelOpen[5] === 0 ? (
                                        <div className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                             value={5} onClick={(e) => handleLabelOpen(e, 5)}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-28 text-lg mt-2 font-bold font-sans mb-2 ">Annotations</label>
                                                <Icon icon="pajamas:details-block" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div
                                                className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                                value={5} onClick={(e) => handleLabelOpen(e, 5)}>
                                                <div className="flex items-center">
                                                    <label
                                                        className="ml-28 text-lg mt-2 font-bold font-sans mb-2 ">Annotations</label>
                                                    <Icon icon="pajamas:details-block" width="28" height="28"
                                                          className="ml-3 text-white"/>
                                                </div>
                                                <div className="mr-1">
                                                    <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                                </div>
                                            </div>
                                            <div className="bg-green-50">
                                                <div>
                                                    {annAccessionNumber.map((series, index0) => {
                                                        return (
                                                            <>
                                                                <div key={index0}
                                                                     className="mt-2.5 ml-2.5 mr-2.5 flex items-center hover:bg-green-100">
                                                                    {
                                                                        annCheckboxList[index0] === true ? (
                                                                            <>
                                                                                <input type="checkbox" id={series[0]}
                                                                                       name={series[0]}
                                                                                       value={series[0]}
                                                                                       className="w-6 h-6 flex"
                                                                                       onChange={(e) => handleInnerChecked(e, series[0], index0)}
                                                                                />
                                                                            </>
                                                                        ) : (
                                                                            <Icon icon="svg-spinners:6-dots-rotate"
                                                                                  width="24"
                                                                                  height="24"
                                                                                  className="text-green-500"/>
                                                                        )
                                                                    }
                                                                    <p className="text-lg w-full mt-2 p-1 ml-2 font-bold"
                                                                       onClick={(e) => handleAnnDrawer(index0)}>
                                                                        {series[1]}
                                                                    </p>
                                                                    <Icon
                                                                        icon={expandedGroups.includes(index0) ? "line-md:chevron-small-up" : "line-md:chevron-small-down"}
                                                                        className={"w-8 h-8 mr-3"}/>
                                                                    <button onClick={() => handleDeleteAnn(index0)}>
                                                                        <Icon
                                                                            icon="tabler:trash" width="24" height="24"
                                                                            className="text-red-500"/></button>
                                                                </div>
                                                                <div>
                                                                    <div
                                                                        style={{display: expandedGroups.includes(index0) ? "block" : "none"}}>
                                                                        {groupName[index0] ? (
                                                                            <div className="bg-white">
                                                                                {groupName[index0].map((group, index) =>
                                                                                    (
                                                                                        <div key={index}
                                                                                             className="ml-2.5 mr-2.5 flex items-center hover:bg-green-100">
                                                                                            {annCheckboxList[index0] === true ? (
                                                                                                <>
                                                                                                    <input
                                                                                                        type="checkbox"
                                                                                                        id={group}
                                                                                                        name={group}
                                                                                                        value={group}
                                                                                                        className="ml-6 w-6 h-6 flex"
                                                                                                        data-index={series[0]}
                                                                                                        data-groupindex={index + index0}
                                                                                                        onChange={(e) => handleChecked(e, index + index0, series[0], 0)}
                                                                                                    />
                                                                                                </>
                                                                                            ) : (
                                                                                                <Icon
                                                                                                    icon="svg-spinners:6-dots-rotate"
                                                                                                    width="24"
                                                                                                    height="24"
                                                                                                    className="ml-6 text-green-500"/>)
                                                                                            }
                                                                                            <p className="text-lg w-full mt-2 p-1 ml-2 font-bold">
                                                                                                {group}
                                                                                            </p>
                                                                                            <label
                                                                                                className="contents ">
                                                                                            <span
                                                                                                className="h-5 w-10 block"
                                                                                                style={{backgroundColor: color[index + index0]}}></span>
                                                                                                <input
                                                                                                    type="color"
                                                                                                    className="h-[0.01rem] w-[0.01rem] absolute tops left-1/2 invisible"
                                                                                                    onChange={(e) => handleColorChange(index + index0, e.target.value)}
                                                                                                    // value={drawColor}
                                                                                                />
                                                                                            </label>

                                                                                        </div>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        ) : (
                                                                            <Icon icon="svg-spinners:6-dots-rotate"
                                                                                  width="24" height="24"
                                                                                  className="text-green-500"/>
                                                                        )
                                                                        }
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                            {/*<div className="flex justify-center">*/}
                                            {/*    <button className="border-1 bg-green-300 rounded-lg m-2 p-2.5 font-sans font-bold">Add Series</button>*/}
                                            {/*</div>*/}
                                        </>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-opacity-0 flex justify-end items-center z-30 mt-2">
                            <div className="bg-opacity-0 absolute z-30 mt-2">
                                <button
                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-l-lg px-2 py-5"
                                    onClick={RightDrawer}>
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
