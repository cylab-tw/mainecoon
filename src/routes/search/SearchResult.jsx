import React, {useEffect, useState} from 'react';
import {Icon} from "@iconify/react";
import {querySeries} from "../../lib/image/index.js"
import {QIDO_RS_Response} from "../../lib/search/QIDO_RS.jsx"
import {useNavigate} from "react-router-dom";
import {combineUrl} from "../../lib/search/index.js";

const SearchResult = ({qidorsSingleStudy, onMessageChange}) => {

    const [SM, setSM] = useState(0);
    const [ANN, setANN] = useState(0);
    const patientID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientID, "NotFound");
    const patientName = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientName, "NotFound")?.Alphabetic;
    const patientBirthDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientBirthDate, "NotFound");
    const patientSex = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientSex, "NotFound");
    const accessionNumber = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.AccessionNumber, "NotFound");
    const studyDate = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyDate, "NotFound");
    const StudyInstanceUID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID, "NotFound");

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy, metadataTag, defaultValue) {
        const metadataValue = qidorsSingleStudy[metadataTag]?.Value;
        return metadataValue !== undefined && metadataValue.length > 0 ? metadataValue[0] : defaultValue;
    }

    const navigate = useNavigate();
    function OnClick() {
        const studyInstanceUID = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID, "StudyInstanceUID, NotFound");
        console.log("onClick");
        // window.location.href = `/image/${studyInstanceUID}`;
        navigate(`../image/${studyInstanceUID}`);
    }

    let X = 0
    let Y = 0

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`${combineUrl}/studies/${StudyInstanceUID}/series`)
                const metadatas =await result.json();
                {
                    metadatas?.map((metadata) => {
                        const Attribute = metadata?.["00080060"]?.Value;
                        if (Attribute && Attribute.length > 0) {
                            if (Attribute[0] === "SM") X += 1;
                            else if (Attribute[0] === "ANN") Y += 1;
                        }
                    });
                }
                setSM(X);
                setANN(Y);
            } catch (error) {
                console.error('Error during fetch:', error);
            }
        };
        fetchData();
    }, [StudyInstanceUID]);




    return (
        <>
            <tr className="border-b-4 m-2 hover:bg-gray-100 cursor-pointer" key={patientID} onClick={OnClick}>
                {/*<div className="contents flex-column px-3 h-28 align-middle" onClick={OnClick}>*/}
                    <td className="border-2 w-3/12  p-2.5">{patientID?.length ? patientID : "NotFound"}</td>
                    <td className="border-2 w-3/12 p-2.5">{patientName?.length ? patientName : "NotFound"}</td>
                    <td className="border-2 w-1/12 p-2.5">{patientBirthDate?.length ? patientBirthDate : "NotFound"}</td>
                    {patientSex === 'F' ?
                        <td className="border-2 w-10 p-2.5  text-center">
                            <div className="flex items-center justify-center">
                                <div
                                    className="rounded-md bg-pink-500 w-16 p-1 scale-[0.91] mx-auto flex items-center justify-center">
                                    <Icon icon="ph:gender-female-bold" width="24" height="24" className="text-white"/>
                                    <span className="mx-2 text-white">F</span>
                                </div>
                            </div>
                        </td> :
                        patientSex === 'M' ?
                            <td className="border-2 w-10 p-2.5  ">
                                <div className="flex items-center justify-center">
                                    <div
                                        className="rounded-md bg-blue-600 w-16 p-1 scale-[0.90] mx-auto flex items-center justify-center">
                                        <Icon icon="tdesign:gender-male" width="24" height="24" className="text-white"/>
                                        <span className="mx-2 text-white">M</span>
                                    </div>
                                </div>
                            </td> :
                            <td className="border-2 w-10 p-2.5 text-center">
                                <div className="flex items-center  justify-center">
                                    <div
                                        className="rounded-md bg-green-400 p-1 scale-[0.90] mx-auto flex items-center justify-center ">
                                        <Icon icon="ion:male-female" width="24" height="24" className="text-white"/>
                                        <span className="mx-2 text-white">O</span>
                                    </div>
                                </div>
                            </td>
                    }
                    <td className="border-2 w-2/12 p-2.5">{accessionNumber?.length ? accessionNumber : "NotFound"}</td>
                    <td className="border-2 w-1/12 p-2.5">{studyDate?.length ? studyDate : "NotFound"}</td>
                    <td className="border-2 text-center w-10 p-2.5 ">{SM ? SM : "NotFound"}</td>
                    <td className="border-2 text-center w-10 p-2.5">{ANN ? ANN : "NotFound"}</td>
                {/*</div>*/}
            </tr>
        </>
    );
}

export default SearchResult;
