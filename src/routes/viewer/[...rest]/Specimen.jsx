const SpecimenList = ({Specimen}) => {
    return (
        <div className="">
            <div className="p-1.5">
                {Object.entries(Specimen).map(([key, value]) => (
                    Array.isArray(value) ? (
                        value.map((item, index) => (
                            <span key={`${key}-${index}`} className="block ml-2 text-sm mt-2">
                                <span>{key} : </span>
                                <p className="font-bold">{item}</p>
                            </span>
                        ))
                    ) : (
                        value && (
                            <span key={key} className={`${key === "Title" ? ("border-y border-gray-200 py-1.5 mt-0.5"): "mt-2 ml-2"} block  text-sm`}>
                                {key !== "Title" && (<span>{key} : </span>)}
                                <p className="font-bold">{value}</p>
                            </span>
                        )
                    )
                    ))}
            </div>
        </div>
    );
}


export default SpecimenList;