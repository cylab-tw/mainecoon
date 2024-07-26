import LoadingSpin from "./LoadingSpin.jsx";

const PatientDetails = ({label, detail, style}) => {
    const patient = {
        ID: detail.patientID,
        Name: detail.patientName,
        Gender: detail.patientSex,
        Birthdate: detail.patientBirthDate
    }

    const study = {
        AccessionNum: detail.accessionNumber,
        ID: detail.accessionNumber,
        Date: detail.studyDate,
        Time: detail.studyTime
    }

    const DetailLine = ({label, value}) => (
        <span className="block ml-2 text-sm mb-0.5">
        <span>{label} : </span>
            <span className="font-bold">{value}</span>
        </span>
    );

    const isObjectComplete = (obj) => {
        return Object.values(obj).every(value => value !== undefined && value !== null && value !== '' && value !== 'loading');
    };

    return (
        <div
            className={`${style === "ViewerHeader" ? 'absolute w-64 border-2 text-start bg-white p-4 border-gray-600 shadow-md rounded-lg top-4 left-0 '
                : 'bg-white text-start text-black rounded-lg py-2 ml-1'}`}>
            {label === 'Patient' && (
                !isObjectComplete(patient) ? <LoadingSpin/> :
                    <div className="m-1">
                        {Object.entries(patient).map(([key, value]) => (
                        <DetailLine key={key} label={key} value={value}/>
                    ))}
                    </div>
            )}
            {label === 'Study' && (
                !isObjectComplete(study) ? <LoadingSpin/> :
                    <div className="m-1">
                        {Object.entries(study).map(([key, value]) => (
                            <DetailLine key={key} label={key} value={value}/>
                        ))}
                    </div>
            )}
        </div>
    );
}

export default PatientDetails;