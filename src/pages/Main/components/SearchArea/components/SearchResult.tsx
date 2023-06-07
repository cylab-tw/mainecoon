import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";

import { updateQueryParameter, firstQuery, getNextTenResult } from "Slices/searchAreaSlice/searchAreaSlice";
import { QIDO_RS_Response, qidorsState, result as qidorsSingleStudyType } from "Slices/searchAreaSlice/searchAreaSlice";
import { queryParameter } from "Slices/searchAreaSlice/searchAreaSlice";
import { renderSpecificSeries, renderAllSeries, querySeries, queryReports } from "Slices/imageWithReportSlice/imageWithReportSlice"

type SearchResultProps = {
    qidorsSingleStudy?: qidorsSingleStudyType
}

const SearchResult: React.FC<SearchResultProps> = ({
    qidorsSingleStudy
}) => {
    const dispatch = useAppDispatch();

    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const imageResult = imageWithReportReducer.imageResult;
    const seriesList = imageResult?.Series;
    const [seriesInstanceUIDList, setSeriesInstanceUIDList] = useState([] as string[]);

    // 整理 SeriesInstanceUIDList
    useEffect(() => {
        if (_.isEqual(imageWithReportReducer.imageResultStatus, "Success")) {
            const tempSeriesInstanceUIDList: string[] = [];

            _.forEach(seriesList, (series) => {
                tempSeriesInstanceUIDList.push(series.uid);
            })

            setSeriesInstanceUIDList(tempSeriesInstanceUIDList);
        }
    }, [imageResult])

    // (imageWithReportReducer的狀態是完成 && SeriesInstanceUIDList不為空) 就去 FHIR Server 查詢 Reports
    useEffect(() => {
        if (_.isEqual(imageWithReportReducer.imageResultStatus, "Success") && !(_.isEmpty(seriesInstanceUIDList))) {
            dispatch(queryReports(seriesInstanceUIDList));
        }
    }, [seriesInstanceUIDList])


    function OnClick() {
        const studyInstanceUID: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyInstanceUID, "StudyInstanceUID, NotFound");
        dispatch(querySeries(studyInstanceUID));
    }

    function getQidorsSingleStudyMetadataValue(qidorsSingleStudy: qidorsSingleStudyType, metadataTag: string, defaultValue: string): string {
        return _.isUndefined(_.first(_.get(qidorsSingleStudy, metadataTag).Value)) ? defaultValue : _.first(_.get(qidorsSingleStudy, metadataTag).Value);
    }

    const patientID: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientID, "PatientID NotFound");
    const patientName: string = _.get(getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientName, "PatientName NotFound"), "Alphabetic");
    const patientBirthDate: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientBirthDate, "PatientBirthDate NotFound");
    const patientSex: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.PatientSex, "PatientSex NotFound");
    const accessionNumber: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.AccessionNumber, "AccessionNumber NotFound");
    const studyDate: string = getQidorsSingleStudyMetadataValue(qidorsSingleStudy, QIDO_RS_Response.StudyDate, "StudyDate NotFound");



    return <>
        <div className="border" key={patientID}>
            <div className="d-flex flex-column px-3" onClick={OnClick}>
                <div className="d-flex justify-content-between fs-1">
                    <span>{patientID}</span>
                    <span>{patientName}</span>
                </div>

                <div className="d-flex justify-content-between fs-2">
                    <span>{patientBirthDate}</span>
                    <span>{patientSex}</span>
                </div>

                <div className="d-flex justify-content-between fs-6">
                    <span>{accessionNumber}</span>
                    <span>{studyDate}</span>
                </div>
            </div>
        </div>
    </>
}

export { SearchResult };