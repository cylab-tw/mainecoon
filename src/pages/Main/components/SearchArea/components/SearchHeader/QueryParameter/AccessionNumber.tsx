import React from "react";
import { useAppDispatch, useAppSelector } from "Hook";
import _ from "lodash";

import { queryParameter, updateQueryParameter } from "Slices/searchAreaSlice/searchAreaSlice";
import { loadFeaturesXhr } from "ol/featureloader";

const QueryParameter_AccessionNumber: React.FC = () => {
    const qidorsReducer = useAppSelector((state) => state.searchAreaSlice);
    const qidorsParameter = qidorsReducer.parameter;

    const dispatch = useAppDispatch();
    function queryParameterHandler(qidorsParameter: queryParameter) {
        dispatch(updateQueryParameter(qidorsParameter));
    }

    return <>
        <div className="d-flex flex-fill mt-2">
            <div className="d-flex text-nowrap align-items-center me-2">Accession Number:</div>
            <input
                className="form-control me-2"
                value={qidorsParameter.AccessionNumber}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    let tempQidorsParameter = _.cloneDeep(qidorsParameter);
                    tempQidorsParameter.AccessionNumber = _.isEmpty(e.target.value) ? undefined : e.target.value;
                    queryParameterHandler(tempQidorsParameter);
                }} />
        </div>
    </>
}

export { QueryParameter_AccessionNumber };