import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";

import { firstQuery, queryParameter, updateQueryParameter, initialLimitAndOffset } from "Slices/searchAreaSlice/searchAreaSlice";


const QueryParameter_PatientID: React.FC = () => {
    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;

    const dispatch = useAppDispatch();
    function queryParameterHandler(qidorsParameter: queryParameter) {
        dispatch(updateQueryParameter(qidorsParameter));
    }
    function searchBtnOnClick() {
        dispatch(initialLimitAndOffset());
        dispatch(firstQuery(queryParameter));
    }

    return <>
        <div className="d-flex flex-fill">
            <div className="d-flex text-nowrap align-items-center me-2">Patient ID:</div>
            <input
                className="form-control me-2"
                value={queryParameter.PatientID}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let tempQidorsParameter = _.cloneDeep(queryParameter);
                    tempQidorsParameter.PatientID = _.isEmpty(e.target.value) ? undefined : e.target.value;
                    queryParameterHandler(tempQidorsParameter);
                }} />
            <button className="btn btn-outline-success" onClick={searchBtnOnClick}>Search</button>
        </div>
    </>
}

export { QueryParameter_PatientID };