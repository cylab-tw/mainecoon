import React, {useState,useEffect} from "react";
import {combineUrl} from "../../../lib/search/index.js";
import {QIDO_RS_Response} from "../../../lib/search/QIDO_RS.jsx";

const PatientDetails = ({label,detail}) => {

    const DetailLine = ({ label, value }) => (
        <span className="block ml-2 text-md mt-2 mb-2">
        <span className="font-bold">{label} : </span>{value}</span>
    );

    return (
        <div className="bg-white text-start text-black rounded-lg p-2 pr-2 pl-2">
            {label === 'Patient' && (
                <>
                    <DetailLine label="ID" value={detail.patientID}/>
                    <DetailLine label="Name" value={detail.patientName}/>
                    <DetailLine label="Gender" value={detail.patientSex}/>
                    <DetailLine label="Birthdate" value={detail.patientBirthDate}/>
                </>
            )}
            {label === 'Case' && (
                <>
                    <DetailLine label="Accession" value={detail.accessionNumber}/>
                    <DetailLine label="ID" value={detail.accessionNumber}/>
                    <DetailLine label="Date" value={detail.studyDate}/>
                    <DetailLine label="Time" value={detail.studyTime}/>
                </>
            )}
        </div>
    );
}

export default PatientDetails;