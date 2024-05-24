import React, {useEffect, useState} from 'react';
import {Icon} from "@iconify/react";
import {QIDO_RS_Response} from "../../lib/search/QIDO_RS.jsx"
import {useNavigate} from "react-router-dom";
import {combineUrl} from "../../lib/search/index.js";
import {toDicomWebUrl} from "../../lib/dicom-webs";
import {set} from "lodash";

const SearchResult = ({qidorsSingleStudy, onMessageChange}) => {

    const [SM, setSM] = useState([]);
    const patientID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientID, "NotFound");
    const patientName = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientName, "")?.Alphabetic;
    const patientBirthDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientBirthDate, "");
    const patientSex = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientSex, "NotFound");
    const accessionNumber = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.AccessionNumber, "NotFound");
    const studyDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyDate, "");
    const StudyInstanceUID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID, "NotFound");
    const [SMt,setSMt] = useState('');
    const [ANN,setANN] = useState('');
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

    const navigate = useNavigate();

    function OnClick() {
        const studyInstanceUID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID, "StudyInstanceUID, NotFound");
        console.log("onClick");
        // navigate(`../image/${studyInstanceUID}`);
        navigate(`../viewer/NTUNHS?studyUid=${studyInstanceUID}`);
    }

    let X = 0
    let Y = 0
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`${combineUrl}/studies/${StudyInstanceUID}/series`)
                const metadatas = await result.json();
                setSM(metadatas?.map((metadata) => {
                    const Attribute = metadata?.["00080060"]?.Value;
                    if (Attribute && Attribute.length > 0) {
                        console.log("Attribute", Attribute[0])
                        if (Attribute[0] === "SM") {
                            X += 1
                            return metadata['0020000E'].Value?.[0]
                        }
                        if (Attribute[0] === "ANN") {
                            Y += 1
                        }
                        return false
                    }
                }).filter(Boolean))
                setSMt(X)
                setANN(Y)
            } catch (error) {
                console.error('Error during fetch:', error);
            }
        };
        fetchData();

    }, [StudyInstanceUID]);


    function changeDateFormat(date) {
        const year = date.slice(0, 4);
        const month = date.slice(4, 6);
        const day = date.slice(6, 8);
        return `${year}/${month}/${day}`;
    }

    return (
        <>
            <tr className=" m-2 hover:bg-gray-100 cursor-pointer group" key={patientID} onClick={OnClick}>
                <td className="border-2 border-l-0 group-first:border-t-0 p-2.5 group-last:border-b-0">{patientID?.length ? patientID : "NotFound"}</td>
                <td className="border-2 group-first:border-t-0 p-2.5 group-last:border-b-0">{patientName?.length ? patientName : "NotFound"}</td>
                <td className="border-2 w-1/12 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">{patientBirthDate?.length ? changeDateFormat(patientBirthDate) : ""}</td>
                {patientSex === 'F' ?
                    <td className="border-2 w-10 p-2.5  text-center group-first:border-t-0 group-last:border-b-0">
                        <div className="flex items-center justify-center">
                            <div
                                className="rounded-md bg-pink-500 w-16 p-1 scale-[0.91] mx-auto flex items-center justify-center">
                                <Icon icon="ph:gender-female-bold" width="24" height="24" className="text-white"/>
                                <span className="mx-2 text-white">F</span>
                            </div>
                        </div>
                    </td> :
                    patientSex === 'M' ?
                        <td className="border-2 w-10 p-2.5  group-first:border-t-0 group-last:border-b-0">
                            <div className="flex items-center justify-center">
                                <div
                                    className="rounded-md bg-blue-600 w-16 p-1 scale-[0.90] mx-auto flex items-center justify-center">
                                    <Icon icon="tdesign:gender-male" width="24" height="24" className="text-white"/>
                                    <span className="mx-2 text-white">M</span>
                                </div>
                            </div>
                        </td> :
                        <td className="border-2 w-10 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">
                            <div className="flex items-center  justify-center">
                                <div
                                    className="rounded-md bg-green-600/80 p-1 scale-[0.90] mx-auto flex items-center justify-center ">
                                    <Icon icon="ion:male-female" width="24" height="24" className="text-white"/>
                                    <span className="mx-2 text-white">O</span>
                                </div>
                            </div>
                        </td>
                }
                <td className="border-2  p-2.5 group-first:border-t-0 group-last:border-b-0">{accessionNumber?.length ? accessionNumber : "NotFound"}</td>
                <td className="border-2 w-1/12 p-2.5 text-center  group-first:border-t-0 group-last:border-b-0">{studyDate?.length ? changeDateFormat(studyDate) : ""}</td>
                <td className="border-2 w-1/12 p-2.5 text-center border-r-0 group-first:border-t-0 group-last:border-b-0 space-y-3">
                    {SM?.map((seriesUid) => <img key={seriesUid} src={toDicomWebUrl({
                        baseUrl: combineUrl,
                        studyUid: StudyInstanceUID,
                        seriesUid,
                        pathname: "/thumbnail"
                    })}/>)}
                </td>
                <td className="border-2 w-1/12 p-2.5 text-center  group-first:border-t-0 group-last:border-b-0">{SMt}</td>
                <td className="border-2 w-1/12 p-2.5 text-center  group-first:border-t-0 group-last:border-b-0">{ANN}</td>
            </tr>
        </>
    );
}

export default SearchResult;
