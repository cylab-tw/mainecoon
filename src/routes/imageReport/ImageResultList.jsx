import React, {useEffect, useState} from "react";
import L_Modal from "./LoadingModal.jsx";
import {querySeries} from "../../lib/image/index.js";
import {ImageResult} from "./ImageResult.jsx";

const ImageResultList = ({studyInstanceUID}) => {

    const [result0, setResult] = useState({})
    const [seriesResults, setSeriesResults] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const result = await querySeries(studyInstanceUID);
                if (result) {
                    setIsLoading(false)
                    setResult(result);
                }
            } catch (error) {
                console.error('Error fetching metadata:', error);
            }
        };
        fetchMetadata();
    }, [studyInstanceUID]);


    useEffect(() => {
        if (result0.Series) setSeriesResults(result0.Series)
    }, [result0]);


    return (
        <div className="" style={{scrollbarWidth: 'none', 'msOverflowStyle': 'none'}}>
            {!isLoading && (
                <div className={`grid 2xl:grid-cols-7 xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-3 gap-3 p-3`}>
                    {seriesResults?.map((seriesResult, index) => (
                        <ImageResult key={index} wadoSingleSeries={seriesResult}/>
                    ))}
                </div>
            )}
            <L_Modal isOpen={isLoading}>Loading...</L_Modal>
        </div>
    );
};

export {ImageResultList};
