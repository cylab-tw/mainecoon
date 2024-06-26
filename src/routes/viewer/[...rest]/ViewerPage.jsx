import React, {useEffect, useState} from 'react';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {combineUrl} from "../../../lib/search/index.js";
import {getDicomwebUrl} from '../../../lib/dicom-webs/server';
import {QIDO_RS_Response} from "../../../lib/search/QIDO_RS.jsx";
import {Icon} from "@iconify/react";
import ViewerPageHeader from "./ViewerHeader.jsx";
import LeftDrawer from "./LeftDrawer.jsx"

const ViewerPage = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    const [seriesUid, setSeriesUid] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');
    // const [data, setData] = useState([]);
    const [isLeftOpen, setIsLeftOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);
    const [wadoSeries, setWadoSeries] = useState([]);
    const [smAccessionNumber, setSmAccessionNumber] = useState([]);
    const [annAccessionNumber, setAnnAccessionNumber] = useState([]);
    const [drawType, setDrawType] = useState([]);
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

    let detail = {
        patientID: "loading",
        patientName: "loading",
        patientBirthDate: "loading",
        patientSex: "loading",
        accessionNumber: "loading",
        studyDate: "loading",
        studyTime: "loading"
    };

    const patientID = data[0] ? getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientID, "NotFound") : "loading"
    const patientName = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientName, "NotFound")?.Alphabetic) : "loading"
    const patientBirthDate = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientBirthDate, "NotFound")) : "loading"
    const patientSex = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientSex, "NotFound")) : "loading"
    const accessionNumber = data[0] ? (getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.AccessionNumber, "NotFound")) : "loading"
    const studyDate = data[0] ? (formatDate(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyDate, " NotFound"))) : "loading"
    const studyTime = data[0] ? (formatTime(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyTime, " NotFound"))) : "loading"

    detail = {
        patientID: patientID,
        patientName: patientName,
        patientBirthDate: patientBirthDate,
        patientSex: patientSex,
        accessionNumber: accessionNumber,
        studyDate: studyDate,
        studyTime: studyTime,
    }

    useEffect(() => {
        try {
            // 找出第1個series
            const fetchSeries = async () => {
                const seriesResult = await fetch(`${combineUrl}/studies/${studyUid}/series`)
                const seriesJson = await seriesResult.json()
                seriesJson.map((series) => {
                    seriesId.push(series["0020000E"]?.Value[0])
                })
                setSeriesUid(seriesJson[0]?.["0020000E"]?.Value[0])
            }

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
            fetchMetadata()
            fetchDetails();
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

    console.log("layers", layers)
    console.log("color", color)
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
        fetch(`${combineUrl}/studies/${studyUid}/series/${seriesId[newIndex]}`, {
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
            <div className="flex h-full w-auto flex-col">
                <ViewerPageHeader annColor={[annColor, setAnnColor]}
                                  drawType={[drawType, setDrawType]}
                                  undo={[undo, setUndo]}
                                  save={[save, setSave]}
                                  isLeftOpen={[isLeftOpen, setIsLeftOpen]}
                                  isReportOpen={[isReportOpen, setIsReportOpen]}
                                  labelOpen={labelOpen}
                                  detail={detail}
                />
                <div className={`h-full w-full flex grow `}>
                    {isLeftOpen &&
                        <LeftDrawer labelOpen={labelOpen}
                                    isLabelOpen={[labelOpen, setLabelOpen]}
                                    smAccessionNumber={smAccessionNumber}
                                    seriesUid={[seriesUid, setSeriesUid]}
                                    smSeriesUid={[smSeriesUid, setSmSeriesUid]}
                                    detail={detail}
                        />
                    }
                    {isReportOpen && (
                        <>
                            <div className={`!h-100 w-6/12 border-4 border-black rounded-2xl m-3`}>
                                <div className="flex flex-col w-full h-full">
                                    <div className="p-5 m-2 overflow-y-scroll scrollbar-thin scrollbar-webkit">
                                        <p className="font-bold text-xl bg-green-300 mt-1 mb-1">Gross Description:</p>
                                        <p>The specimen is received in three parts, all fresh.</p>
                                        <p className="font-bold text-lg">Part #1 </p>
                                        <p>which is labeled &quot;?metastatic tumor in jugular vein lymph
                                            node&quot; consists of an elliptical
                                            fragment of light whitish-tan tissue which measures approximately 0.3 x 0.2
                                            x 0.2 cm. The
                                            specimen is examined by the frozen section technique, and the diagnosis
                                            is &quot;ganglion&quot;. The remainder of part #1 of the specimen is
                                            submitted
                                            as frozen section control #1.</p>
                                        <p className="font-bold text-lg">Part #2 </p>
                                        <p className="whitespace-pre-line">is labeled &quot;resection of floor of mouth continuous with tongue and
                                            mandible
                                            plus left radical neck dissection&quot;. As received in the frozen section
                                            room,
                                            the specimen consists of a grossly identifiable left radical neck dissection
                                            and also the entire left ascending ramus of the mandible, the posterior
                                            three-fourths of the left mandible proper, the left lateral portion of the
                                            tongue,
                                            and the submental and submaxillary salivary glands. The main lesion is
                                            identified
                                            on the left side of the floor by the mouth. There is a craterform lesion
                                            which
                                            measures approximately 1.2 x 0.5 cm in greatest dimensions. With the
                                            assistance
                                            of Dr. U. No Whoo, the specimen is properly oriented. Two areas of interest
                                            are
                                            defined. The first of these is the anterior tongue margin. The second of
                                            these is
                                            the medial tongue margin. Fragments from each of these areas are
                                            examined by the frozen section technique. The diagnosis on frozen section #2
                                            (anterior tongue margin) is &quot;no tumor seen&quot; and on frozen section
                                            #3
                                            (medial tongue margin) is &quot;no tumor seen&quot;. Two additional areas of
                                            special interest are identified. The first of these is that portion of the
                                            left radical neck
                                            dissection which was nearest to the carotoid artery. A fragment of tissue
                                            from this
                                            area is excised and submitted for sectioning labeled &quot;CM&quot;. The
                                            second area
                                            of interest is that portion of the left radical neck dissection which
                                            bordered
                                            upon the anterior aspect of the vertebral column. A fragment of tissue is
                                            excised from
                                            this area and submitted for sectioning labeled &quot;VM&quot;. After having
                                            been
                                            photographed in several positions, the specimen is blocked further. A
                                            section is
                                            taken through the main tumor mass and submitted for sectioning
                                            labeled &quot;T
                                            POST&quot;. Attention is directed to the left radical neck dissection
                                            proper.
                                            This part of the specimen is divided into the appropriate five levels. Each
                                            level is
                                            examined for lymph nodes which are dissected free and submitted in their
                                            entirety for sectioning. The remainder of the specimen is saved.</p>
                                        <p className="font-bold text-lg">Part #3 </p>
                                        <p>of the specimen, labeled &quot;anterior margin of inferior
                                            mandible&quot; consists of
                                            an irregular fragment of fibrous connective and skeletal muscular tissues
                                            and
                                            measures approximately 1.0 x 0.5 x 0.2 cm. The specimen is submitted in its
                                            entirety for
                                            sectioning on three levels.</p>
                                        <p className="font-bold text-xl bg-green-300 mt-1 mb-1">Microscopic Description:</p>
                                        <p>Microscopic examination of frozen section control #1 confirms the original
                                            frozen section
                                            diagnosis of &quot;ganglion&quot;.</p>
                                        <p>Microscopic examination of frozen section
                                            control #2 confirms the original frozen section diagnosis of &quot;no tumor
                                            seen&quot;.</p>
                                        <p>Microscopic examination of frozen section control #3 confirms
                                            the original frozen section diagnosis of &quot;no tumor seen&quot;.</p>
                                        <p>Microscopic examination of part #2 of the specimen reveals foci of moderately
                                            well
                                            differentiated squamous cell carcinoma in the floor of the left side of the
                                            mouth.
                                            The residual tumor is surrounded by large amounts of dense fibrous
                                            connective
                                            tissue. Microscopic examination of the section labeled CM which represents
                                            the
                                            carotoid margin reveals squamous cell carcinoma extending to within 0.1 cm
                                            of the
                                            surgical margin.</p>
                                        <p>Microscopic examination of section labeled VM representing the vertebral
                                            margin fails to reveal evidence of tumor in this location. Microscopic
                                            examination of the tissue in level I reveals section of fibrotic and
                                            atrophic
                                            submaxillary salivary gland. There is also one lymph node in level I which
                                            is
                                            negative for metastatic tumor. Microscopic examination of the tissue in
                                            level II
                                            reveals sections of 11 lymph nodes none of which contains numerous foci of
                                            squamous
                                            cell carcinoma. Microscopic examination of the tissue in level IV reveals
                                            sections
                                            of 6 lymph nodes, none of which contains metastatic tumor. Microscopic
                                            examination
                                            of the tissue in level V reveals 1 lymph node which is negative for
                                            metastatic
                                            tumor.</p>
                                        <p className="font-bold text-xl bg-green-300 mt-1 mb-1">Diagnosis:</p>
                                        <ol className="list-decimal list-inside pl-4">
                                            <li>Squamous cell carcinoma, left floor of mouth</li>
                                            <li>Squamous cell carcinoma, in extranodal connective tissue of neck at
                                                level III
                                            </li>
                                            <li>Nineteen cervical lymph nodes, no pathologic diagnosis.</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

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
                                                <div className="mr-1">
                                                    <Icon icon="line-md:chevron-small-down" width="24" height="24"/>
                                                </div>
                                            </div>
                                            <div>
                                                <img
                                                    src={`${combineUrl}/studies/${studyUid}/series/${seriesUid}/label`}
                                                    className="h-32 w-full border object-cover"
                                                    alt=""
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                className="flex flex-row items-center bg-green-300  justify-between">
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
                                             value={4} onClick={(e) => handleLabelOpen(e, 4)}>
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
                                                                <div key={index0} className="mt-2.5 ml-2.5 mr-2.5 flex items-center hover:bg-green-100">
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
                                                                    <div style={{display: expandedGroups.includes(index0) ? "block" : "none"}}>
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
