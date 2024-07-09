import React, {useContext, useEffect, useState} from 'react';
import {Icon} from "@iconify/react";
import {combineUrl, fetchPatientDetails} from "../../lib/search/index.js";
import {ServerContext} from "../../lib/ServerContext.jsx";
import {Link} from "react-router-dom";

const SearchResult = ({qidorsSingleStudy}) => {

    const [previewImage, setPreviewImage] = useState([]);
    const patientDetails = fetchPatientDetails(qidorsSingleStudy);
    const studyInstanceUID = patientDetails.studyInstanceUID;
    const [SM, setSM] = useState('');
    const [ANN, setANN] = useState('');
    const [server, setServer] = useContext(ServerContext)

    function OnClick() {location.href = `../viewer?server=${server}&studyUid=${studyInstanceUID}`;}

    let X = 0, Y = 0
    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`${combineUrl(server)}/studies/${studyInstanceUID}/series`)
                const metadatas = await result.json();
                setPreviewImage(metadatas?.map((metadata) => {
                    const Attribute = metadata?.["00080060"]?.Value;
                    if (Attribute && Attribute.length > 0) {
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
                setSM(X)
                setANN(Y)
            } catch (error) {
                console.error('Error during fetch:', error);
            }
        };
        fetchData();
    }, [studyInstanceUID]);

    const genderData = {
        F: {bgColor: "bg-pink-500", icon: "ph:gender-female-bold", label: "F",},
        M: {bgColor: "bg-blue-600", icon: "tdesign:gender-male", label: "M",},
        default: {bgColor: "bg-green-600/80", icon: "ion:male-female", label: "O"},
    };

    const gender = genderData[patientDetails.patientSex] || genderData.default;

    return (
        <>
            <tr className="m-2 hover:bg-gray-100 cursor-pointer group max-h-2" key={patientDetails.patientID} onClick={OnClick}>
                <td className="border-2 border-l-0 group-first:border-t-0 p-2.5 group-last:border-b-0">
                    {patientDetails.patientID?.length ? patientDetails.patientID : "NotFound"}
                </td>
                <td className="border-2 group-first:border-t-0 p-2.5 group-last:border-b-0">
                    {patientDetails.patientName?.length ? patientDetails.patientName : "NotFound"}
                </td>
                <td className="border-2 w-1/12 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">
                    {patientDetails.patientBirthDate?.length ? patientDetails.patientBirthDate : ""}
                </td>
                <td className="border-2 w-10 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">
                    <div className="flex items-center justify-center">
                        <div className={`rounded-md ${gender.bgColor} w-16 p-1 scale-[0.90] mx-auto flex items-center justify-center`}>
                            <Icon icon={gender.icon} width="24" height="24" className="text-white"/>
                            <span className="mx-2 text-white">{gender.label}</span>
                        </div>
                    </div>
                </td>
                <td className="border-2 p-2.5 group-first:border-t-0 group-last:border-b-0">
                    {patientDetails.accessionNumber?.length ? patientDetails.accessionNumber : "NotFound"}
                </td>
                <td className="border-2 w-1/12 p-2.5 text-center group-first:border-t-0 group-last:border-b-0">
                    {patientDetails.studyDate?.length ? patientDetails.studyDate : ""}
                </td>
                <td className="border-2 w-1/12 p-2.5 text-center border-r-0 group-first:border-t-0 group-last:border-b-0">
                    <div className="flex flex-wrap w-72">
                        {previewImage?.map((seriesUid) => (
                            <Link
                                key={seriesUid}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    location.href = `../viewer?server=${server}&studyUid=${studyInstanceUID}&seriesUid=${seriesUid}`;
                                    console.log(server, studyInstanceUID, seriesUid);
                                }}
                                className="mr-2"
                            >
                                <img
                                    key={seriesUid}
                                    src={`${combineUrl(server)}/studies/${studyInstanceUID}/series/${seriesUid}/thumbnail`}
                                    className="break-all border bg-white text-xs h-[70px] w-[70px] object-cover"
                                    alt={seriesUid}
                                />
                            </Link>
                        ))}
                    </div>
                </td>
            </tr>
        </>
    );
}

export default SearchResult;
