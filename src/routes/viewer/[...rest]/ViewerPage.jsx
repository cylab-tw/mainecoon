import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {combineUrl} from "../../../lib/search/index.js";
import {getDicomwebUrl} from '../../../lib/dicom-webs/server';
import {QIDO_RS_Response} from "../../../lib/search/QIDO_RS.jsx";
import {Icon} from "@iconify/react";
import mainecoon from "../../../assests/mainecoon.png";

const ViewerPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    const [seriesUid, setSeriesUid] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');
    const [data, setData] = useState([]);
    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);
    const [wadoSeries, setWadoSeries] = useState([]);
    const [smAccessionNumber, setSmAccessionNumber] = useState([]);
    const [annAccessionNumber, setAnnAccessionNumber] = useState([]);
    const [drawType, setDrawType] = useState([]);
    const [save, setSave] = useState(false)
    const [test, setTest] = useState({})
    const [layers, setLayers] = useState({})
    const [labelOpen, setLabelOpen] = useState([1, 1, 1, 0, 1, 1])
    const [annCheckboxList, setAnnCheckboxList] = useState([])
    const [specimen, setSpecimen] = useState({
        "Description": "",
        "Anatomical structure": "",
        "Collection method": "",
        "Parent specimen": "",
        "Tissue fixative": "",
        "Tissue embedding medium": ""
    })
    // const everySeries_numberOfFramesList = [];
    const [groupName, setGroupName] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState([]);

    useEffect(() => {
        try {
            // 找出第1個series
            const fetchSeries = async () => {
                const seriesResult = await fetch(`${combineUrl}/studies/${studyUid}/series`)
                const seriesJson = await seriesResult.json()
                setSeriesUid(seriesJson[0]?.["0020000E"]?.Value[0])
            }
            // patient資料
            const fetchDetails = async () => {
                try {
                    const response = await fetch(`${combineUrl}/studies?ModalitiesInStudy=SM&StudyInstanceUID=${studyUid}`);
                    const data = await response.json();
                    setData(data)
                } catch (e) {
                    console.log('error', e)
                }
            }

            const fetchMetadata = async () => {
                try {
                    const result = await fetch(`${combineUrl}/studies/${studyUid}/series`)
                    if (result) {
                        const data = await result.json();
                        setWadoSeries(data);
                    }
                } catch (error) {
                    console.error('Error fetching metadata:', error);
                }
            };

            fetchSeries()
            fetchDetails()
            fetchMetadata()


        } catch (e) {
            console.log(e)
        }
    }, [])

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

                const value = element?.['00280008']?.Value ?? null
                // const numberOfFrames = value != null ? value.toString() : null;
                // everySeries_numberOfFramesList.push(numberOfFrames);
            } else if (modalityAttribute == "ANN") {
                const annAccessionNum = element?.['00080050']?.Value ?? null
                const metadataANN = element?.['0020000E']?.Value ?? null;
                // annAccessionNumber.push([metadataANN[0], annAccessionNum ? annAccessionNum : "unknown"])
                ann.push([metadataANN[0], annAccessionNum ? annAccessionNum : "unknown"])
            }
        })
        setSmAccessionNumber(sm)
        setAnnAccessionNumber(ann)
    }, [wadoSeries]);


    // const sorted_everySeries_numberOfFramesList = everySeries_numberOfFramesList.slice().sort((a, b) => a - b);
    // const maxNumberOfFrames = sorted_everySeries_numberOfFramesList[sorted_everySeries_numberOfFramesList.length - 1];

    useEffect(() => {

        const fetchData = async () => {
            if (studyUid === null || seriesUid === null || studyUid === "" || seriesUid === "") return;

            const baseUrl = getDicomwebUrl(server);
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

                const url = `${combineUrl}/studies/${studyUid}/series/${seriesUid}/metadata`
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
    }, [server, studyUid, seriesUid]);


    useEffect(() => {
        // const length = annAccessionNumber.length
        const length = groupName.length
        const checkboxList = []
        for (let i = 0; i < length; i++) {
            annCheckboxList.push(false)
        }

        setAnnCheckboxList(checkboxList)
        // }, [annAccessionNumber]);
    }, [groupName]);


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
            // setGroupName(instanc)
            setAnnotations(instances);
            let gn = [];
            instances.map((instance) => {
                let groupName1 = []
                if (instance.length > 0) {
                    instance.map((i) => {
                        console.log("i", i)
                        groupName1.push(i?.annGroupName?.Value?.[0])
                    })
                }
                gn.push(groupName1)
            })
            setGroupName(gn)
            console.log("instances", instances)
        }

        processAnnotations();
    }, [annAccessionNumber]);

    console.log("groupName", groupName)


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

    const LeftDrawer = () => {
        setIsLeftOpen(!isLeftOpen);
    };
    const RightDrawer = () => {
        setIsRightOpen(!isRightOpen);
    };

    function formatDate(inputDate) {
        const year = inputDate.substring(0, 4);
        const month = inputDate.substring(4, 6);
        const day = inputDate.substring(6, 8);
        return `${year}-${month}-${day}`;
    }

    function formatTime(inputTime) {
        const hours = inputTime.substring(0, 2);
        const minutes = inputTime.substring(2, 4);
        const seconds = inputTime.substring(4, 6);
        return `${hours}:${minutes}:${seconds}`;
    }

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
        const metadataValue = qidorsSingleStudy[metadataTag]?.Value;
        return metadataValue !== undefined && metadataValue.length > 0 ? metadataValue[0] : defaultValue;
    }

    const patientID = data[0] ? getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientID, "NotFound") : "loading"
    const patientName = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientName, "NotFound")?.Alphabetic) : "loading"
    const patientBirthDate = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientBirthDate, "NotFound")) : "loading"
    const patientSex = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientSex, "NotFound")) : "loading"
    const accessionNumber = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.AccessionNumber, "NotFound")) : "loading"
    const studyDate = data[0] ? (formatDate(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyDate, " NotFound"))) : "loading"
    const StudyTime = data[0] ? (formatTime(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyTime, " NotFound"))) : "loading"


    function navigateTo(e) {
        const value = e.target.value
        setSeriesUid(value)
        setSmSeriesUid(value)
    }

    const updateDrawType = (e, type) => {

        let prevButton = e.target;
        for (let i = 0; !prevButton?.querySelector('svg.animate-bounce') && i < 5; i++) {
            prevButton = prevButton.parentElement;
        }
        prevButton.querySelector('svg.animate-bounce')?.classList.remove('animate-bounce');

        let target = e.target;
        while (!target.querySelector('svg')) target = target.parentElement;
        target.querySelector('svg').classList.add('animate-bounce');
        setDrawType(type);
    };

    const handleViewer = (e) => {
        setDrawType(null)
        let target = e.target;
        while (!target.querySelector('svg.animate-bounce')) target = target.parentElement;
        // console.log(target)
        target.querySelector('svg.animate-bounce').classList.remove('animate-bounce');
    }

    const saveAnnotations = () => {
        setSave(!save);
    }

    // const handleMessageChange0 = (message) => {
    //     const layerArray = message.array_
    //     const annList = [...annCheckboxList]
    //     for (let i = 4; i < layerArray.length; i++) {
    //         annList[i - 4] = true
    //     }
    //     setLayers(message)
    //     setAnnCheckboxList(annList)
    // }

    const handleMessageChange = (message) => {
        const layerArray = message.array_
        const annList = [...groupName]
        for (let i = 4; i < layerArray.length; i++) {
            annList[i - 4] = true
        }
        setLayers(message)
        setAnnCheckboxList(annList)
    }

    console.log("layers", layers)

    const handleChecked = (e, index) => {
        const newIndex = index + 4;
        const layerArray = layers.getArray()
        const length = newIndex
        console.log("layerArray", length, layerArray[length])
        if (layerArray[length])
            layerArray[length].setVisible(!layerArray[length].values_.visible)
    }

    const handleAnnDrawer = (index) => {
        if (expandedGroups.includes(index)) {
            setExpandedGroups(expandedGroups.filter((item) => item !== index));
        } else {
            setExpandedGroups([...expandedGroups, index]);
        }
    }

    return (
        <div className="flex h-full w-full flex-col">
            <header>
                <div className="bg-green-500 text-white p-1 ">
                    <div className="flex flex-row ">
                        <Link to="/" className={"w-20 h-20 flex flex-column justify-center items-center ml-3 mt-2"}>
                            <img src={mainecoon} alt="maincoon"/>
                        </Link>
                        <div className="flex justify-between items-center w-full">
                            <div>
                                <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                            </div>

                            <div className="flex flex-row m-2 gap-2">
                                <div className="m-2 mt-3">

                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={handleViewer}
                                    >
                                        <Icon icon="fa6-regular:hand"
                                              className="animate-bounce text-black h-6 w-6"/>
                                    </button>
                                    {/*bg-yellow-200*/}
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'Point')}
                                    >
                                        <Icon icon="tabler:point-filled" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'LineString')}
                                    >
                                        <Icon icon="material-symbols-light:polyline-outline"
                                              className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'Polygon')}
                                    >
                                        <Icon icon="ph:polygon" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'Rectangle')}
                                    >
                                        <Icon icon="f7:rectangle" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'Ellipse')}
                                    >
                                        <Icon icon="mdi:ellipse-outline" className="text-black h-6 w-6"/>
                                    </button>
                                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                            onClick={(e) => updateDrawType(e, 'ELLIPSE')}
                                    >
                                        <Icon icon="bx:screenshot" className="text-black h-6 w-6"/>
                                    </button>
                                </div>
                                <div className="flex justify-end mt-1 text-black">
                                    {/*bg-[#0073ff]*/}
                                    <button
                                        className="bg-white w-24 h-10 justify-center flex mt-3.5 mx-2 p-2 rounded-lg mb-2"
                                        onClick={saveAnnotations}>
                                        <Icon icon="ant-design:save-outlined" className="w-6 h-6 mr-2"/>儲存
                                    </button>
                                    <button
                                        className="bg-white w-24 h-10 justify-center flex mt-3.5 mx-2 p-2  rounded-lg mb-2"
                                        // onClick={undoFeature}
                                    >
                                        <Icon icon="gg:undo" className="w-6 h-6 mr-2"/>復原
                                    </button>
                                    <select
                                        className="bg-white w-fit h-10 justify-center flex mt-3.5 mx-2 p-2  rounded-lg mb-2">
                                        <option value="NTUNHS">NTUNHS</option>
                                        <option value="GOOGLE">GOOGLE</option>
                                    </select>
                                    <button className="ml-6 mr-2 mb-2"
                                        // onClick={() => openStuModal()}
                                            style={{transform: 'rotate(180deg)'}}>
                                        <Icon icon="fluent:list-28-filled" className="text-black h-7 w-7"/>
                                    </button>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </header>
            <div className={`relative w-full flex grow `}>
                {isLeftOpen ? (
                    <>
                        <div className={`!h-100 w-1/5 overflow-auto `}>
                            <div className="flex flex-col w-full h-full border-end ">
                                {labelOpen[0] === 0 ? (
                                    <>
                                        <div
                                            className="flex flex-row items-center bg-green-300 mt-2 justify-between"
                                            value={0} onClick={handleLabelOpen}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center ">
                                                    Patient
                                                    <Icon icon="bi:people-circle" width="28" height="28"
                                                          className="ml-3 text-white"/>
                                                </label>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                            </div>
                                            <div className="bg-opacity-100 flex z-30">
                                                <button
                                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-l-lg p-3"
                                                    onClick={LeftDrawer}>
                                                    {'<<'}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="flex flex-row items-center bg-green-300 mt-2 justify-between"
                                            value={0} onClick={handleLabelOpen}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center ">
                                                    Patient
                                                    <Icon icon="bi:people-circle" width="28" height="28"
                                                          className="ml-3 text-white"/>
                                                </label>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                            </div>
                                            <div className="bg-opacity-100 flex z-30">
                                                <button
                                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-l-lg p-3"
                                                    onClick={LeftDrawer}>
                                                    {'<<'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="bg-green-50">
                                            <div className="p-1.5">
                                                {/*00100020,LO => 123456*/}
                                                <span className="block ml-2 text-md mt-2 "><span
                                                    className="font-bold">ID : </span>{patientID}</span>
                                                {/*00100010,PN => Philips^Amy*/}
                                                <span className="block ml-2 text-md mt-2"><span
                                                    className="font-bold">Name : </span>{patientName}</span>
                                                {/*00100040,CS => O*/}
                                                <span className="block ml-2 text-md mt-2"><span
                                                    className="font-bold">Gender : </span>{patientSex}</span>
                                                {/*00100030,DA => 20010101*/}
                                                <span className="block ml-2 text-md mt-2 mb-4"><span
                                                    className="font-bold">Birthdate : </span>{patientBirthDate}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {labelOpen[1] === 0 ? (
                                    <div className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                         value={1} onClick={handleLabelOpen}>
                                        <div className="flex items-center">
                                            <label
                                                className="ml-5 text-lg mt-2 font-bold font-sans mb-2 ">Case</label>
                                            <Icon icon="fluent:document-data-16-filled" width="28" height="28"
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
                                            value={1} onClick={handleLabelOpen}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 ">Case</label>
                                                <Icon icon="fluent:document-data-16-filled" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                            </div>
                                        </div>
                                        <div className="bg-green-50">
                                            <div className="p-1.5">
                                                    <span className="block ml-2 text-md mt-2"><span
                                                        className="font-bold">Accession : </span>{accessionNumber}</span>
                                                <span className="block ml-2 text-md mt-2"><span
                                                    className="font-bold">ID : </span>{accessionNumber}</span>
                                                <span className="block ml-2 text-md mt-2"><span
                                                    className="font-bold">Date : </span>{studyDate}</span>
                                                <span className="block ml-2 text-md mt-2 mb-4"><span
                                                    className="font-bold">Time : </span>{StudyTime}</span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                {labelOpen[2] === 0 ? (
                                    <div className="flex flex-row items-center bg-green-300 mt-6 justify-between"
                                         value={2} onClick={handleLabelOpen}>
                                        <div className="flex items-center">
                                            <label
                                                className="ml-5 text-lg mt-2 font-bold font-sans mb-2 ">Series</label>
                                            <Icon icon="fluent:document-data-16-filled" width="28" height="28"
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
                                            value={2} onClick={handleLabelOpen}>
                                            <div className="flex items-center">
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 ">Series</label>
                                                <Icon icon="fluent:document-data-16-filled" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-up" width="24" height="24"/>
                                            </div>
                                        </div>

                                        <div className="bg-green-50">
                                            <div className="p-1.5">
                                                {smAccessionNumber.map((series, index) => (
                                                    <div key={index}>
                                                        <button
                                                            className="text-lg w-full mt-2 p-1.5 hover:bg-green-100"
                                                            key={series[0]}
                                                            onClick={(e) => navigateTo(e, series[0])}
                                                            value={series[0]}
                                                        >{series[1]}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>)
                                }
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-opacity-0 flex justify-start items-center z-30 mt-2">
                        <div className="bg-opacity-0 absolute z-30 mt-2">
                            <button
                                className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg px-2 py-5"
                                onClick={LeftDrawer}>{'>'}</button>
                        </div>
                    </div>)
                }

                <MicroscopyViewer
                    baseUrl={baseUrl}
                    studyUid={studyUid}
                    seriesUid={smSeriesUid}
                    images={images}
                    annotations={annotations}
                    drawType={drawType}
                    save={save}
                    tests={[test, setTest]}
                    annList={annAccessionNumber}
                    onMessageChange={handleMessageChange}
                    className="grow"
                />
                {isRightOpen ? (
                    <>
                        <div className="!h-100 w-1/4 overflow-auto ">
                            <div className="flex flex-col w-full h-full border-end ">
                                {labelOpen[3] === 0 ? (
                                    <>
                                        <div
                                            className="flex flex-row items-center bg-green-300 mt-2 justify-between">
                                            <div className="bg-opacity-100 flex z-30">
                                                <button
                                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                                    onClick={RightDrawer}>
                                                    {'>>'}
                                                </button>
                                            </div>
                                            <div className="flex items-center" value={3} onClick={handleLabelOpen}>
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center ">
                                                    Slide label
                                                    <Icon icon="fluent:slide-text-sparkle-24-filled" width="28"
                                                          height="28" className="ml-3 text-white"/>
                                                </label>
                                            </div>
                                            <div className="mr-1">
                                                <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div
                                            className="flex flex-row items-center bg-green-300 mt-2 justify-between">
                                            <div className="bg-opacity-100 flex z-30">
                                                <button
                                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                                    onClick={RightDrawer}>
                                                    {'>>'}
                                                </button>
                                            </div>
                                            <div className="flex items-center" value={3} onClick={handleLabelOpen}>
                                                <label
                                                    className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center ">
                                                    Slide label
                                                    <Icon icon="fluent:slide-text-sparkle-24-filled" width="28"
                                                          height="28" className="ml-3 text-white"/>
                                                </label>
                                            </div>
                                            <div className="mr-1">
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
                                         value={4} onClick={handleLabelOpen}>
                                        <div className="flex items-center">
                                            <label
                                                className="ml-28 text-lg mt-2 font-bold font-sans mb-2 ">Specimens</label>
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
                                            value={4} onClick={handleLabelOpen}>
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
                                         value={5} onClick={handleLabelOpen}>
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
                                            value={5} onClick={handleLabelOpen}>
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
                                            <div className="p-1.5">
                                                {annAccessionNumber.map((series, index0) => (
                                                    <>
                                                        <div key={index0} className="flex items-center hover:bg-green-100"
                                                             onClick={(e) => handleAnnDrawer(index0)}>
                                                            {
                                                                annCheckboxList[index0] === true ? (
                                                                    <>
                                                                        <input type="checkbox" id={series[0]}
                                                                               name={series[0]}
                                                                               value={series[0]}
                                                                               className="w-6 h-6 flex"
                                                                               onChange={(e) => handleChecked(e, index0)}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <Icon icon="svg-spinners:6-dots-rotate" width="24"
                                                                          height="24" className="text-green-500"/>
                                                                )
                                                            }
                                                            <p className="text-lg w-full mt-2 p-1 ml-2 font-bold">
                                                                {series[1]}
                                                            </p>
                                                            <Icon icon={expandedGroups.includes(index0) ? "line-md:chevron-small-up" : "line-md:chevron-small-down"} className={"w-8 h-8 mr-3"}/>

                                                        </div>
                                                        <div>
                                                            {expandedGroups.includes(index0) && (
                                                                <div>
                                                                    {groupName[index0] ? (
                                                                        <div>
                                                                            {groupName[index0].map((group, index) =>
                                                                                (
                                                                                    <div key={index}
                                                                                         className="flex items-center hover:bg-green-100">
                                                                                        {annCheckboxList[index0] === true ? (
                                                                                            <>
                                                                                                <input type="checkbox"
                                                                                                       id={group}
                                                                                                       name={group}
                                                                                                       value={group}
                                                                                                       className="ml-6 w-6 h-6 flex"
                                                                                                       onChange={(e) => handleChecked(e, index + index0)}
                                                                                                />
                                                                                            </>
                                                                                        ) : (<Icon icon="svg-spinners:6-dots-rotate" width="24" height="24" className="ml-6 text-green-500"/>)
                                                                                        }
                                                                                        <p className="text-lg w-full mt-2 p-1 ml-2 font-bold">
                                                                                            {group}
                                                                                        </p>
                                                                                    </div>)
                                                                            )}
                                                                        </div>
                                                                    ) : (
                                                                        <Icon icon="svg-spinners:6-dots-rotate"
                                                                              width="24" height="24"
                                                                              className="text-green-500"/>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                ))}
                                            </div>
                                        </div>
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
    );
}

const handleLabelOpen = (e) => {
    e.preventDefault();
    const value = parseInt(e.currentTarget.getAttribute('value'));
    const newLabelOpen = [...labelOpen];
    newLabelOpen[value] = newLabelOpen[value] === 0 ? 1 : 0;
    setLabelOpen(newLabelOpen);
}


export default ViewerPage;
