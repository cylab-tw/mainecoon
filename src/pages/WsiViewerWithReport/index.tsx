// react
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';


import { useAppSelector, useAppDispatch } from "Hook";
import { renderSpecificSeries, renderAllSeries, querySeries } from "Slices/imageWithReportSlice/imageWithReportSlice";
import { sortSpecificPyramid, convertAnnotation } from "Slices/pyramidSlice";
import { Study, Series, Instance, Frame } from "csy-dicomweb-wado-rs-uri";
import _, { StringIterator } from "lodash";

import Header from "Components/Header";
import MicroscopyViewer from "./components/microscopyViewer";
import RightAside from "./components/rightAside";


const WSIViewer: React.FunctionComponent = () => {

    const parameters = useParams();
    const parameter1Name: string = "studyInstanceUID";
    const studyInstanceUID: string = _.has(parameters, parameter1Name) ? _.get(parameters, parameter1Name) : null;
    const parameter2Name: string = "seriesInstanceUID";
    const seriesInstanceUID: string = _.has(parameters, parameter2Name) ? _.get(parameters, parameter2Name) : null;
    const parameter3Name: string = "modalityAttribute";
    const modalityAttribute: string = _.has(parameters, parameter3Name) ? _.get(parameters, parameter3Name) : null;

    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportReducer.imageResult?.Series;
    const isLoadingWado = _.isEqual(imageWithReportReducer.imageResultStatus, "Loading");
    const [isSuccessWado, setIsSuccessWado] = useState(false);
    const smSeriesResult = _.first(_.filter(seriesResults, (seriesResult) => {
        const metadata: object = _.first(seriesResult.metadata);
        const modalityAttribute: string = _.first(_.get(_.get(metadata, "00080060"), "Value")); //00080060
        return _.isEqual(modalityAttribute, "SM");
    }));

    const pyramidSliceReducer = useAppSelector((state) => state.pyramidSliceReducer);
    const Instances = pyramidSliceReducer.smResult?.Instances;
    const isSuccessPyramid = _.isEqual(pyramidSliceReducer.smStatus, "Success");

    // 取得純 Annotation 的 Series
    const annotationsSeriesResults = _.filter(seriesResults, (seriesResult) => {
        const annotationSOPClassUID = "1.2.840.10008.5.1.4.1.1.91.1";
        const numberOfSOPClassUIDMetadata = "00080016";
        const metadatas = seriesResult.metadata;
        let isANN = false;

        for (let i = 0; i < metadatas.length; i++) {
            const metadata = metadatas[i];
            isANN = _.isEqual(_.first(_.get(_.get(metadata, numberOfSOPClassUIDMetadata), "Value")), annotationSOPClassUID);

            //如果此 Series 之中有一個 Instance 不是 ANN 則跳開
            if (!isANN) break;
        }

        return isANN;
    });

    // 取得指定的 Annotation 的 Series
    const specificAnnotaionSeries = _.filter(annotationsSeriesResults, (annotationsSeriesResult) => {
        return _.isEqual(annotationsSeriesResult.uid, seriesInstanceUID);
    })

    const isSuccessAnnotaionStatus = _.isEqual(pyramidSliceReducer.annotaionStatus, "Success");


    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(renderAllSeries(studyInstanceUID));
    }, [])

    // renderAllSeries結束再觸發排序
    useEffect(() => {
        if (_.isEqual(imageWithReportReducer.imageResultStatus, "Success")) {
            dispatch(sortSpecificPyramid(smSeriesResult));
        }
    }, [imageWithReportReducer.imageResultStatus])

    // sortSpecificPyramid 結束再觸發
    useEffect(() => {
        if (_.isEqual(pyramidSliceReducer.smStatus, "Success")) {
            dispatch(convertAnnotation(specificAnnotaionSeries));
        }
    }, [pyramidSliceReducer.smStatus])





    return <>
        <Header />
        <div className="m-0 p-0 flex-fill">
            <div className="d-flex h-100">
                {
                    !(isSuccessAnnotaionStatus) && (
                        <>
                            <span className='w-100'>
                                Loading
                            </span>
                        </>
                    )
                }
                {
                    (isSuccessAnnotaionStatus) && <MicroscopyViewer studyInstanceUID={studyInstanceUID} seriesInstanceUID={seriesInstanceUID} />
                }
                <RightAside seriesInstanceUID={seriesInstanceUID} />
            </div>
        </div>



    </>
}


export default WSIViewer;