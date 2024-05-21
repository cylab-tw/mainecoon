import React, {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import {getAnnotations, getImagingInfo, getSeriesInfo} from '../../../lib/dicom-webs/series';
import {DICOMWEB_URLS} from '../../../lib/dicom-webs';
import {combineUrl} from "../../../lib/search/index.js";
import {getDicomwebUrl} from '../../../lib/dicom-webs/server';
import Header from '../../../lib/Header';
import {QIDO_RS_Response} from "../../../lib/search/QIDO_RS.jsx";
import {Icon} from "@iconify/react";
import {querySeries} from "../../../lib/image/index.js";

const ViewerPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const searchParams = useParams();
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    // const seriesUid = searchParams.get('seriesUid');
    const [seriesUid, setSeriesUid] = useState([]);

    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');
    const [data, setData] = useState([]);
    const [isLeftOpen, setIsLeftOpen] = useState(true);
    const [isRightOpen, setIsRightOpen] = useState(true);
    const [wadoSingleSeries, setWadoSingleSeries] = useState([]);
    const [annSeriesUid,setAnnSeriesUid] = useState([]);
    // const [metadata, setMetadata] = useState([]);

    useEffect(() => {
        try {
            const fetchSeries = async () => {
                const seriesResult = await fetch(`${combineUrl}/studies/${studyUid}/series`)
                const seriesJson = await seriesResult.json()
                console.log("seriesResult", seriesJson)
                seriesUid.push(seriesJson[0]?.["0020000E"]?.Value[0])
            }

            const fetchDetails = async () => {
                try {
                    const response = await fetch(`${combineUrl}/studies?ModalitiesInStudy=SM&StudyInstanceUID=${studyUid}`);
                    const data = await response.json();
                    setData(data)
                    console.log('data0521', data);
                } catch (e) {
                    console.log('error', e)
                }
            }

            const fetchMetadata = async () => {
                try {
                    const result = await querySeries(studyUid);
                    if (result) {
                        console.log('result123:', result.Series);
                        setWadoSingleSeries(result.Series);
                        // setSeriesUid(result.Series.map((series) => series.SeriesInstanceUID));
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
    // console.log("seriesUid", seriesUid)
    const everySeries_numberOfFramesList = [];

    {wadoSingleSeries.map((series) => {
            const metadata = series.metadata
            console.log("metadata", metadata)
            {metadata.map((element) => {
                const modalityAttribute = element?.['00080060']?.Value ?? null;
                if (modalityAttribute == "SM") {
                    // const metadataSM = element?.['0020000E']?.Value ?? null
                    const value = element?.['00280008']?.Value ?? null
                    const numberOfFrames = value != null ? value.toString() : null;
                    everySeries_numberOfFramesList.push(numberOfFrames);
                } else if (modalityAttribute == "ANN") {
                    const metadataANN = element?.['0020000E']?.Value ?? null
                    annSeriesUid.push(metadataANN)
                }
            })}
            console.log("annSeriesUid",annSeriesUid)

            console.log("everySeries_numberOfFramesList", everySeries_numberOfFramesList)
        })
    }

    const sorted_everySeries_numberOfFramesList = everySeries_numberOfFramesList.slice().sort((a, b) => a - b);
    const maxNumberOfFrames = sorted_everySeries_numberOfFramesList[sorted_everySeries_numberOfFramesList.length - 1];

    useEffect(() => {
        const fetchData = async () => {
            console.log('ViewerPage test')
            if (!studyUid || !seriesUid) {
                return;
            }

            const baseUrl = getDicomwebUrl(server);
            setBaseUrl(baseUrl);

            const series = await getSeriesInfo(baseUrl, studyUid, seriesUid[0]);
            const smSeriesUid = series?.modality === 'SM' ? seriesUid[0] : series?.referencedSeriesUid;
            setSmSeriesUid(smSeriesUid);
            console.log('smSeriesUid', smSeriesUid)
            const imagingInfo = await getImagingInfo(baseUrl, studyUid, smSeriesUid);
            setImages(imagingInfo);
            console.log('imagingInfo:', imagingInfo);


            if (series?.modality === 'ANN') {
                const annotations = await getAnnotations(baseUrl, studyUid, seriesUid[0]);
                setAnnotations(annotations);
            }
        };

        fetchData();
    }, [server, studyUid, seriesUid]);

    if (images.length === 0 || !smSeriesUid) {
        return (
            <div className="flex h-full w-full justify-center items-center">
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

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
        const metadataValue = qidorsSingleStudy[metadataTag]?.Value;
        return metadataValue !== undefined && metadataValue.length > 0 ? metadataValue[0] : defaultValue;
    }

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

    const patientID = getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientID, "NotFound");
    const patientName = getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientName, "NotFound")?.Alphabetic;
    const patientBirthDate = getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientBirthDate, "NotFound");
    const patientSex = getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.PatientSex, "NotFound");
    const accessionNumber = getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.AccessionNumber, "NotFound");
    const studyDate = formatDate(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyDate, " NotFound"));
    const StudyTime = formatTime(getQidorsSingleStudyMetadataValue(data[0], QIDO_RS_Response.StudyTime, " NotFound"));


    function navigateTo(e) {
        const value = e.target.value
        console.log("value",value)
        setSmSeriesUid(value)
        console.log("切換")
    }
    console.log("seriesUid",seriesUid)

    return (
        <div className="flex h-full w-full flex-col">
            <Header/>
            <div className={`relative w-full flex grow `}>
                {isLeftOpen ? (
                    <>
                        <div className="!h-100 w-96 overflow-auto ">
                            <div className="flex flex-col w-full h-full border-end ">
                                <div className="flex flex-row items-center bg-green-300 mt-2 justify-between">
                                    <div className="flex items-center">
                                        <label className="ml-5 text-xl mt-2 font-bold font-sans mb-2 flex items-center">
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
                                        <span className="block ml-2 text-lg mt-2 mb-4"><span className="font-bold">Birthday : </span>{patientBirthDate}</span>
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
                                    <div className="p-1.5 hover:bg-green-100" >
                                        {seriesUid.map((series) => (
                                            <button className="text-lg mt-2" key={series} onClick={(e)=>navigateTo(e)} value={series}>{series}</button>
                                            // <span className="block ml-2 text-lg mt-2" key={series} onClick={(e)=>navigateTo(e)}>{series}</span>
                                        ))}
                                        {/*<span className="block ml-2 text-lg mt-2">{patientID}</span>*/}
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
                    SeriesUid={{seriesUid, setSeriesUid}}
                    className="grow"

                />
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
                                        <span className="block ml-2 text-lg mt-2 mb-4"><span className="font-bold">Birthday : </span>{patientBirthDate}</span>
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
                                    <label className="ml-5 text-xl mt-2 font-bold font-sans mb-2 ">Optical Paths</label>
                                </div>
                                <div className="bg-green-50">
                                    <div className="p-1.5 hover:bg-green-100">
                                        {annSeriesUid.map((series) => (
                                            <button className="text-lg mt-2" key={series} onClick={(e) => navigateTo(e)}
                                                    value={series}>{series}</button>
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
};


export default ViewerPage;
