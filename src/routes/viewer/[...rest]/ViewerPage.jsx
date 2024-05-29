import React, {useEffect, useState} from 'react';
import {Link, useLocation} from 'react-router-dom';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import {getAnnotations, getImagingInfo, getMetadataInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {combineUrl} from "../../../lib/search/index.js";
import {getDicomwebUrl} from '../../../lib/dicom-webs/server';
import {QIDO_RS_Response} from "../../../lib/search/QIDO_RS.jsx";
import {Icon} from "@iconify/react";
// import mainecoon from "../../../assests/mainecoon.png";
import mainecoon from "../../../assests/mainecoon.png";

const ViewerPage = () => {
        const location = useLocation();
        const searchParams = new URLSearchParams(window.location.search);
        // const searchParams = useParams();
        const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
        const studyUid = searchParams.get('studyUid');
        // const seriesUid = searchParams.get('seriesUid');
        const [seriesUid, setSeriesUid] = useState('');
        const [baseUrl, setBaseUrl] = useState('');
        const [images, setImages] = useState([]);
        const [annotations, setAnnotations] = useState([]);
        const [smSeriesUid, setSmSeriesUid] = useState('');
        const [data, setData] = useState([]);
        const [isLeftOpen, setIsLeftOpen] = useState(true);
        const [isRightOpen, setIsRightOpen] = useState(true);
        const [wadoSeries, setWadoSeries] = useState([]);
        const [annSeriesUid, setAnnSeriesUid] = useState('');
        let smAccessionNumber = []
        let annAccessionNumber = []
        const [drawType, setDrawType] = useState([]);
        const [save, setSave] = useState(false)
        const [test, setTest] = useState({})
        const [layers, setLayers] = useState({})
        const [visibleIndex, setVisibleIndex] = useState([])
        const [selectedSeriesUid, setSelectedSeriesUid] = useState([])
        // const [loading, setLoading] = useState(true)

        useEffect(() => {
            try {
                // 找出第1個series
                const fetchSeries = async () => {
                    const seriesResult = await fetch(`${combineUrl}/studies/${studyUid}/series`)
                    const seriesJson = await seriesResult.json()
                    setSeriesUid(seriesJson[0]?.["0020000E"]?.Value[0])
                    // selectedSeriesUid.push(seriesJson[0]?.["0020000E"]?.Value[0])
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

        const everySeries_numberOfFramesList = [];

        useEffect(() => {
            visibleIndex.map((index) => {
                const layerArray = layers.getArray()
                // console.log("layerArray123", layerArray)
                layerArray[index].setVisible(false)
            })
        }, [visibleIndex])

        {
            wadoSeries.map((series) => {
                    const element = series
                    const modalityAttribute = element?.['00080060']?.Value ?? null;
                    if (modalityAttribute == "SM") {
                        const smAccesionNum = element?.['00080050']?.Value ?? null
                        const metadataSM = element?.['0020000E']?.Value ?? null;
                        smAccessionNumber.push([metadataSM[0], smAccesionNum ? smAccesionNum[0] : "unknown"])
                        const value = element?.['00280008']?.Value ?? null
                        const numberOfFrames = value != null ? value.toString() : null;
                        everySeries_numberOfFramesList.push(numberOfFrames);
                    } else if (modalityAttribute == "ANN") {
                        // const fliterMetadata = element?.['0']?.['00081115']?.Value?.['0002000E'].Value[0] != seriesUid;
                        const annAccesionNum = element?.['00080050']?.Value ?? null
                        const metadataANN = element?.['0020000E']?.Value ?? null;
                        annAccessionNumber.push([metadataANN[0], annAccesionNum ? annAccesionNum : "unknown"])
                    }
                }
            )
        }

        const sorted_everySeries_numberOfFramesList = everySeries_numberOfFramesList.slice().sort((a, b) => a - b);
        const maxNumberOfFrames = sorted_everySeries_numberOfFramesList[sorted_everySeries_numberOfFramesList.length - 1];

        // console.log("selectedSeriesUid", selectedSeriesUid)
        useEffect(() => {
            const fetchData = async () => {
                if (studyUid === null || seriesUid === null || studyUid === "" || seriesUid === "") return;

                const baseUrl = getDicomwebUrl(server);
                setBaseUrl(baseUrl);

                const series = await getSeriesInfo(baseUrl, studyUid, seriesUid);
                const smSeriesUidd = series?.modality === 'SM' ? seriesUid : series?.referencedSeriesUid;
                setSmSeriesUid(smSeriesUidd);
                console.log("series",series)

                const imagingInfo = await getImagingInfo(baseUrl, studyUid, smSeriesUidd);
                setImages(imagingInfo);
                // console.log('imagingInfo:', imagingInfo);

                // const metadata = await getMetadataInfo(baseUrl, studyUid, seriesUid);
                // console.log("metadata",metadata)

                if (series?.modality === 'ANN') {
                    if (!Object.hasOwn(test, seriesUid)) {
                        const annotations = await getAnnotations(baseUrl, studyUid, seriesUid);
                        setAnnotations(annotations);
                    }
                }
            };

            const fetchDetails = async () => {
                try {
                    const url = `${combineUrl}/studies/${studyUid}/series/${seriesUid}/metadata`
                    const response = await fetch(url)
                    const data = await response.json();
                    const Description = data[0]?.["00400560"]?.Value[0]?.["00400600"]?.Value[0];
                    const Anatomicalstructure = data[0]?.["00400560"]?.Value[0]?.["00082228"]?.Value[0]?.["00080104"]?.Value[0];
                    const Collectionmethod = data[0]?.["00400560"]?.Value[0]?.["00400610"]?.Value[0]?.["00400612"]?.Value[4]?.["0040A168"]?.Value[0]?.["00080104"]?.Value[0];
                    const Parentspecimen = data[0]?.["00400560"]?.Value[0]?.["00400610"]?.Value[0]?.["00400612"]?.Value[0]?.["0040A160"]?.Value[0]
                    console.log("description",Description)
                    console.log("Anatomicalstructure",Anatomicalstructure)
                    console.log("Collectionmethod",Collectionmethod)
                    console.log("Parentspecimen",Parentspecimen)

                    console.log("url",url)
                    console.log("metadata123",data)
                } catch (e) {
                    console.log('error', e)
                }
            }
            console.log("")
            fetchData();
            fetchDetails()
        }, [server, studyUid, seriesUid]);


        if (images.length === 0 || !smSeriesUid) {
            // setLoading(false)
            return (
                <div className="flex h-full w-full bg-opacity-25 bg-gray-200/10 justify-center items-center">
                    <h1>Loading...</h1>
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
            console.log(target)
            target.querySelector('svg.animate-bounce').classList.remove('animate-bounce');
        }

        const saveAnnotations = () => {
            setSave(!save);
        }

        const handleMessageChange = (message) => {
            // console.log("message", message)
            setLayers(message)
        }


        const handleChecked = (e, index) => {
            // const checked = e.target.checked
            const value = e.target.value
            // console.log("index", index, "checked", checked, "value", value)
            const test123 = selectedSeriesUid.includes(value);
            if (!test123) {
                setSeriesUid(value)
                selectedSeriesUid.push(value)
            }
            if (Object.hasOwn(test, value)) {
                let testJson = Object.entries(test);
                const testid = testJson
                    .map((test, index) => test[0] === value ? index : null)
                    .filter(index => index !== null);
                // console.log("test",test)
                const layerArray = layers.getArray()
                const length = parseInt(testid) + 4;
                layerArray[length].setVisible(!layerArray[length].values_.visible)
                if (layerArray[length].values_.visible === false) {
                    visibleIndex.push(length)
                } else {
                    const fliterIndex = visibleIndex.filter((index) => index !== length)
                    setVisibleIndex(fliterIndex)
                }
                setTest(test)
            }
        }


        return (
            <div className="flex h-full w-full flex-col">
                {/*<Header/>*/}
                <header>
                    <div className="bg-gradient-to-r from-green-400 via-green-200 to-blue-200 text-white p-1 ">
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

                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={handleViewer}
                                        >
                                            <Icon icon="fa6-regular:hand"
                                                  className="animate-bounce text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'Point')}
                                        >
                                            <Icon icon="tabler:point-filled" className="text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'LineString')}
                                        >
                                            <Icon icon="material-symbols-light:polyline-outline"
                                                  className="text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'Polygon')}
                                        >
                                            <Icon icon="ph:polygon" className="text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'Rectangle')}
                                        >
                                            <Icon icon="f7:rectangle" className="text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'Ellipse')}
                                        >
                                            <Icon icon="mdi:ellipse-outline" className="text-black h-6 w-6"/>
                                        </button>
                                        <button className="bg-yellow-200 hover:bg-yellow-500 rounded-lg p-2.5 mr-2 mb-2"
                                                onClick={(e) => updateDrawType(e, 'ELLIPSE')}
                                        >
                                            <Icon icon="bx:screenshot" className="text-black h-6 w-6"/>
                                        </button>
                                    </div>

                                    <div className="flex justify-end mt-1 ">
                                        <button
                                            className="bg-[#0073ff] w-24 h-10 justify-center flex mt-3.5 mx-2 p-2 text-white rounded-3 mb-2"
                                            onClick={saveAnnotations}
                                        >
                                            <Icon icon="ant-design:save-outlined" className="w-6 h-6 mr-2"/>儲存
                                        </button>
                                        <button
                                            className="bg-[#0073ff] w-24 h-10 justify-center flex mt-3.5 mx-2 p-2 text-white rounded-3 mb-2"
                                            // onClick={undoFeature}
                                        >
                                            <Icon icon="gg:undo" className="w-6 h-6 mr-2"/>復原
                                        </button>
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
                            <div className="!h-100 w-96 overflow-auto ">
                                <div className="flex flex-col w-full h-full border-end ">
                                    <div className="flex flex-row items-center bg-green-300 mt-2 justify-between">
                                        <div className="flex items-center">
                                            <label
                                                className="ml-5 text-xl mt-2 font-bold font-sans mb-2 flex items-center">
                                                Patient
                                                <Icon icon="bi:people-circle" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </label>
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
                                            <span className="block ml-2 text-lg mt-2 "><span
                                                className="font-bold">ID : </span>{patientID}</span>
                                            {/*00100010,PN => Philips^Amy*/}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Name : </span>{patientName}</span>
                                            {/*00100040,CS => O*/}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Gender : </span>{patientSex}</span>
                                            {/*00100030,DA => 20010101*/}
                                            <span className="block ml-2 text-lg mt-2 mb-4"><span className="font-bold">Birthdate : </span>{patientBirthDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center bg-green-300 mt-6">
                                        <label className="ml-5 text-xl mt-2 font-bold font-sans mb-2 ">Case</label>
                                        <Icon icon="fluent:document-data-16-filled" width="28" height="28"
                                              className="ml-3 text-white"/>
                                    </div>
                                    <div className="bg-green-50">
                                        <div className="p-1.5">
                                            {/*00080050,SH => D18-1001*/}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Accession : </span>{accessionNumber}</span>
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">ID : </span></span>
                                            {/*00080020,DA => 20181003 */}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Date : </span>{studyDate}</span>
                                            <span className="block ml-2 text-lg mt-2 mb-4"><span
                                                className="font-bold">Time : </span>{StudyTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center bg-green-300 mt-6">
                                        <label className="ml-5 text-xl mt-2 font-bold font-sans mb-2 ">Series</label>
                                    </div>
                                    <div className="bg-green-50">
                                        <div className="p-1.5">
                                            {smAccessionNumber.map((series, index) => (
                                                <div key={index}>
                                                    <button className="text-lg w-full mt-2 p-1.5 hover:bg-green-100"
                                                            key={series[0]}
                                                            onClick={(e) => navigateTo(e, series[0])}
                                                            value={series[0]}
                                                    >
                                                        {series[0]}
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-opacity-0 flex justify-start items-center z-30 mt-2">
                            <div className="bg-opacity-0 absolute z-30 mt-2">
                                <button
                                    className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg px-2 py-5"
                                    onClick={LeftDrawer}>
                                    {'>'}
                                </button>
                            </div>
                        </div>
                    )}
                    <MicroscopyViewer
                        baseUrl={baseUrl}
                        studyUid={studyUid}
                        seriesUid={smSeriesUid}
                        images={images}
                        annotations={annotations}
                        annSeriesUid={seriesUid}
                        drawType={drawType}
                        save={save}
                        tests={[test, setTest]}
                        onMessageChange={handleMessageChange}
                        className="grow"
                    />
                    {/*<AnnotationLoader loading={loading}/>*/}
                    {isRightOpen ? (
                        <>
                            <div className="!h-100 w-96 overflow-auto ">
                                <div className="flex flex-col w-full h-full border-end ">
                                    <div className="flex flex-row items-center bg-green-300 mt-2 justify-start">
                                        <div className="bg-opacity-100 flex z-30">
                                            <button
                                                className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                                onClick={RightDrawer}>
                                                {'>>'}
                                            </button>
                                        </div>
                                        <div className="flex items-center">
                                            <label
                                                className="ml-5 text-xl mt-2 font-bold font-sans mb-2 flex items-center">
                                                Slide label
                                                <Icon icon="fluent:slide-text-sparkle-24-filled" width="28" height="28"
                                                      className="ml-3 text-white"/>
                                            </label>
                                        </div>

                                    </div>
                                    <div className="bg-green-50">
                                        <div className="p-1.5">
                                        <span className="block ml-2 text-lg mt-2 "><span
                                            className="font-bold">ID : </span>{patientID}</span>
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Name : </span>{patientName}</span>
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Gender : </span>{patientSex}</span>
                                            <span className="block ml-2 text-lg mt-2 mb-4"><span className="font-bold">Birthdate : </span>{patientBirthDate}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center bg-green-300 mt-6">
                                        <label className="ml-5 text-xl mt-2 font-bold font-sans mb-2 ">Specimens</label>
                                        <Icon icon="pajamas:details-block" width="28" height="28"
                                              className="ml-3 text-white"/>
                                    </div>
                                    <div className="bg-green-50">
                                        <div className="p-1.5">
                                            {/*00080050,SH => D18-1001*/}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Accession : </span>{accessionNumber}</span>
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">ID : </span></span>
                                            {/*00080020,DA => 20181003 */}
                                            <span className="block ml-2 text-lg mt-2"><span
                                                className="font-bold">Date : </span>{studyDate}</span>
                                            <span className="block ml-2 text-lg mt-2 mb-4"><span
                                                className="font-bold">Time : </span>{StudyTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-row items-center bg-green-300 mt-6">
                                        <label
                                            className="ml-5 text-xl mt-2 font-bold font-sans mb-2 ">Annotations</label>
                                    </div>
                                    <div className="bg-green-50">
                                        <div className="p-1.5">
                                            {annAccessionNumber.map((series, index) => (
                                                <div key={index} className="flex hover:bg-green-100">
                                                    <input type="checkbox" id={series[0]} name={series[0]} value={series[0]}
                                                           onChange={(e) => handleChecked(e, index)}/>
                                                    <p className="text-lg w-full mt-2 p-1 ">
                                                        {series[0]}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
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
                    )}
                </div>
            </div>
        );
    }
;

function AnnotationLoader({loading}) {
    const className = loading ? 'bottom-2' : '-bottom-8';
    return (
        <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${className}`}>
            <div className="flex items-center gap-3 rounded-full border bg-white/75 px-2 py-1 text-xs shadow">
                <span className="loader h-4 w-4 border-2 border-green-500"/>
                <p>Loading Annotations...</p>
            </div>
        </div>
    );
}

export default ViewerPage;
