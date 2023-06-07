import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import dicomWebServerConfig from "Configs/DICOMWebServer.config";
import QIDO from "csy-dicomweb-qido-rs";
import _ from "lodash";


const firstQuery = createAsyncThunk(
    "firstQuery",
    async (queryParameter: queryParameter, thunkAPI) => {
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

        return qido.response;
    }
)



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

type queryParameter = {
    StudyDate: string,
    StudyTime: string,
    AccessionNumber: string,
    ModalitiesInStudy: string,
    ReferringPhysicianName: string,
    PatientName: string,
    PatientID: string,
    StudyInstanceUID: string,
    StudyID: string,
    limit: string,
    offset: string
}


enum QIDO_RS_Response {
    "StudyDate" = "00080020",
    "StudyTime" = "00080030",
    "AccessionNumber" = "00080050",
    "ModalitiesInStudy" = "00080061",
    "ReferringPhysicianName" = "00080090",
    "PatientName" = "00100010",
    "PatientID" = "00100020",
    "PatientBirthDate" = "00100030",
    "PatientSex" = "00100040",
    "StudyInstanceUID" = "0020000D",
    "StudyID" = "00200010",
    "NumberOfStudyRelatedSeries" = "00201206",
    "NumberOfStudyRelatedInstances" = "00201208"
}

type metadataStructure = {
    "vr" : string,
    "Value"?: Array<string>
}

type metadataPatientNameValueStructure = {
    "vr" : string,
    "Value"?: Array<{"Alphabetic": string}>
}


type result = {
    "00080020" : metadataStructure,
    "00080030" : metadataStructure,
    "00080050" : metadataStructure,
    "00080061" : metadataStructure,
    "00080090" : metadataStructure,
    "00100010" : metadataStructure,
    "00100020" : metadataStructure,
    "00100030" : metadataStructure,
    "00100040" : metadataStructure,
    "0020000D" : metadataStructure,
    "00200010" : metadataStructure,
    "00201206" : metadataStructure,
    "00201208" : metadataStructure
}

type qidorsState = {
    config: queryConfig,
    parameter: queryParameter,
    results: result[],
    isResultsEmpty: Boolean,
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
    isResultsEmpty: false,
    status: null
};





export const qidorsSlice = createSlice({
    name: "qidors",
    initialState,
    reducers: {
        updateQueryParameter: (state, actions) => {
            state.parameter = actions.payload as queryParameter;
        },
        loadingMoreResult: (state) => {

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
    }
});

export type { queryParameter, qidorsState, result };

export const { updateQueryParameter, loadingMoreResult } = qidorsSlice.actions;

export { firstQuery }

export { QIDO_RS_Response };

export default qidorsSlice.reducer;