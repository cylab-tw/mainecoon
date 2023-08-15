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

    // 取得URL傳入的數值
    const parameters = useParams();
    const parameter1Name: string = "studyInstanceUID";
    const studyInstanceUID: string = _.has(parameters, parameter1Name) ? _.get(parameters, parameter1Name) : null;


    // 監聽 wadoSlice & 過濾出 SM 的 Series
    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportReducer.imageResult?.Series;
    const isLoadingWado = _.isEqual(imageWithReportReducer.imageResultStatus, "Loading");
    const [isSuccessWado, setIsSuccessWado] = useState(false);
    const smSeriesResult = _.first(_.filter(seriesResults, (seriesResult) => { 
        const metadata: object = _.first(seriesResult.metadata);
        const modalityAttribute: string = _.first(_.get(_.get(metadata, "00080060"), "Value")); //00080060
        return _.isEqual(modalityAttribute, "SM");
    }));
    const smSeriesInstanceUID: string = smSeriesResult?.uid;

    // 取得 ANN 的 Series Instance UID
    const annSeriesResult = _.first(_.filter(seriesResults, (seriesResult) => { 
        const metadata: object = _.first(seriesResult.metadata);
        const modalityAttribute: string = _.first(_.get(_.get(metadata, "00080060"), "Value")); //00080060
        return _.isEqual(modalityAttribute, "ANN");
    }));
    const annSeriesInstanceUID: string = annSeriesResult?.uid;


    // 監聽 pyramidSlice 
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
        return _.isEqual(annotationsSeriesResult.uid, annSeriesInstanceUID);
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
                    (isSuccessAnnotaionStatus) && <MicroscopyViewer />
                }
                {
                    (isSuccessAnnotaionStatus) && <RightAside seriesInstanceUID={smSeriesInstanceUID} />
                }
            </div>
        </div>



    </>
}


export default WSIViewer;