import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import dicomWebServerConfig from "Configs/DICOMWebServer.config";
import QIDO from "csy-dicomweb-qido-rs";
import _ from "lodash";

import { QIDO_RS_Response } from "./components/enums/QIDO_RS_Response";
import { queryParameter } from "./components/types/queryParameter";


const firstQuery = createAsyncThunk(
    "firstQuery",
    async (queryParameter: queryParameter, thunkAPI) => {
        const result = await getQidorsResponse(queryParameter);

        return result;
    }
)


const getNextTenResult = createAsyncThunk(
    "getNextTenResult",
    async (queryParameter: queryParameter, thunkAPI) => {

        //暫時將查詢參數 +10
        const tempQueryParameter = _.cloneDeep(queryParameter);
        tempQueryParameter.limit = _.toString(_.toNumber(queryParameter.limit) + 10);
        tempQueryParameter.offset = _.toString(_.toNumber(queryParameter.offset) + 10);

        const result = await getQidorsResponse(tempQueryParameter);

        return result;
    }
)


async function getQidorsResponse(queryParameter: queryParameter): Promise<result[]> {
    const qido = new QIDO();

    await qido.init();

    const qidoConfig: queryConfig = getQidorsConfig();
    qido.hostname = qidoConfig.hostname;
    qido.pathname = qidoConfig.pathname;
    qido.protocol = qidoConfig.protocol;
    qido.port = qidoConfig.port;
    qido.queryLevel = qidoConfig.queryLevel;

    // 查詢參數用物件套入
    const Parameters = _.pickBy(queryParameter, _.isString);
    qido.queryParameter = Parameters;

    //有 TOKEN 就加入
    if (!(_.isEmpty(qidoConfig.token))) {
        const tokenValue = qidoConfig.token;
        const myHeaders = { "Authorization": tokenValue };
        await qido.setUseToken(myHeaders);
    }

    // 查詢 同步模式
    await qido.query();

    return qido.response as result[];
}


function getQidorsConfig(): queryConfig {

    const qidorsConfig = dicomWebServerConfig.QIDO;

    let result: queryConfig = {
        queryLevel: "studies",
        hostname: qidorsConfig.hostname,
        pathname: qidorsConfig.pathname,
        protocol: qidorsConfig.enableHTTPS ? "https" : "http",
        port: qidorsConfig.port,
        token: qidorsConfig.Token
    }

    return result;
}


type queryConfig = {
    queryLevel: string,
    hostname: string,
    pathname: string,
    protocol: string,
    port: string,
    token: string
}


type metadataStructure = {
    "vr": string,
    "Value"?: Array<string>
}

type metadataPatientNameValueStructure = {
    "vr": string,
    "Value"?: Array<{ "Alphabetic": string }>
}


type result = {
    "00080020": metadataStructure,
    "00080030": metadataStructure,
    "00080050": metadataStructure,
    "00080061": metadataStructure,
    "00080090": metadataStructure,
    "00100010": metadataStructure,
    "00100020": metadataStructure,
    "00100030": metadataStructure,
    "00100040": metadataStructure,
    "0020000D": metadataStructure,
    "00200010": metadataStructure,
    "00201206": metadataStructure,
    "00201208": metadataStructure
}

type qidorsState = {
    config: queryConfig,
    parameter: queryParameter,
    results: result[],
    isNextQueryEmpty: Boolean,
    status: string
}


const initialState: qidorsState = {
    config: getQidorsConfig(),
    parameter: {
        StudyDate: undefined,
        StudyTime: undefined,
        AccessionNumber: undefined,
        ModalitiesInStudy: "SM",
        ReferringPhysicianName: undefined,
        PatientName: undefined,
        PatientID: "*",
        StudyInstanceUID: undefined,
        StudyID: undefined,
        limit: "10",
        offset: "0"
    },
    results: [],
    isNextQueryEmpty: false,
    status: null
};





export const searchAreaSlice = createSlice({
    name: "searchArea",
    initialState,
    reducers: {
        updateQueryParameter: (state, actions) => {
            state.parameter = actions.payload as queryParameter;
        },
        initialLimitAndOffset: (state) => {
            state.parameter.limit = "10";
            state.parameter.offset = "0"
            state.isNextQueryEmpty = false;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(firstQuery.pending, (state, action) => {
            state.status = "Loading";
        })
        builder.addCase(firstQuery.fulfilled, (state, action) => {
            state.status = "Success";
            state.results = action.payload as result[];
        })
        builder.addCase(firstQuery.rejected, (state, action) => {
            state.status = "Error";
        })

        builder.addCase(getNextTenResult.pending, (state, action) => {
            state.status = "Loading";
        })
        builder.addCase(getNextTenResult.fulfilled, (state, action) => {
            state.status = "Success";

            // 搜尋時有預先增加，執行成功後再更新 State。
            state.parameter.limit = _.toString(_.toNumber(state.parameter.limit) + 10);
            state.parameter.offset = _.toString(_.toNumber(state.parameter.offset) + 10);

            // 有新查詢結果就加進去原本的查詢結果
            if (_.isEmpty(action.payload) == false) {
                state.results = state.results.concat(action.payload as result[]);
            } else {
                state.isNextQueryEmpty = true;
            }
        })
        builder.addCase(getNextTenResult.rejected, (state, action) => {
            state.status = "Error";
        })
    }
});

export type { queryParameter, qidorsState, result };

export const { updateQueryParameter, initialLimitAndOffset } = searchAreaSlice.actions;

export { firstQuery, getNextTenResult };

export { QIDO_RS_Response };

export default searchAreaSlice.reducer;