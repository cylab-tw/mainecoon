import {useEffect,useState} from "react";
import {combineUrl} from "../../../lib/search/index.js";
import {getSpecimenList} from "../../../lib/image/index.js";
import LoadingSpin from "./LoadingSpin.jsx";

const SpecimenList = ({urlInfo}) => {
    const {server, studyUid, seriesUID} = urlInfo
    const [specimen, setSpecimen] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (studyUid === null || seriesUID === null || studyUid === "" || seriesUID === "") return;
                setLoading(true)
                const url = `${combineUrl(server)}/studies/${studyUid}/series/${seriesUID}/metadata`
                const response = await fetch(url)
                const data = await response.json();
                const specimenResult = getSpecimenList(data[0])
                setSpecimen(specimenResult)
                setLoading(false)
            } catch (e) {
                console.log('error', e)
            }
        }
        fetchDetails()
    }, [server, studyUid, seriesUID]);

    return (
        <div className="text-xs ">
            <div className="p-1.5">
                {loading ? <LoadingSpin/> :
                Object.entries(specimen).map(([key, value]) => (
                    Array.isArray(value) ? (
                        value.map((item, index) => (
                            <span key={`${key}-${index}`} className="block ml-2 mt-2">
                                <span>{key} : </span>
                                <p className="font-bold">{item}</p>
                            </span>
                        ))
                    ) : (
                        value && (
                            <span key={key} className={`${key === "Title" ? ("border-y border-gray-200 py-1.5 mt-0.5"): "mt-2 ml-2"} block `}>
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