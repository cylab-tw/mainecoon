import React from "react";

const PatientDetails = ({label, detail, style}) => {

    const DetailLine = ({label, value}) => (
        <span className="block ml-2 text-sm mt-1 mb-1">
        <span>{label} : </span>
            <span className="font-bold">{value}</span>
        </span>
    );

    return (
        <div className={`${style === "ViewerHeader" ? 'absolute w-64 border-2 text-start bg-white p-4 border-gray-600 shadow-md rounded-lg top-4 '
            : 'bg-white text-start text-black rounded-lg py-2 ml-1'}`}>
            {label === 'Patient' && (
                <>
                    <DetailLine label="ID" value={detail.patientID}/>
                    <DetailLine label="Name" value={detail.patientName}/>
                    <DetailLine label="Gender" value={detail.patientSex}/>
                    <DetailLine label="Birthdate" value={detail.patientBirthDate}/>
                </>
            )}
            {label === 'Study' && (
                <>
                    <DetailLine label="Accession Num" value={detail.accessionNumber}/>
                    <DetailLine label="ID" value={detail.accessionNumber}/>
                    <DetailLine label="Date" value={detail.studyDate}/>
                    <DetailLine label="Time" value={detail.studyTime}/>
                </>
            )}
        </div>
    );
}

export default PatientDetails;