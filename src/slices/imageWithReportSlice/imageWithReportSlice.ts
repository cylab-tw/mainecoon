import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Study, Series, Instance, Frame } from "csy-dicomweb-wado-rs-uri";
import _ from "lodash";
import axios, { AxiosRequestHeaders } from "axios";

import { getInitWADOService } from "./components/getInitWADOService";
import { getImagingStudyResponseListByDICOMSeriesInstanceUIDList } from "./components/getImagingStudyResponseListByDICOMSeriesInstanceUIDList";
import { getImagingStudyResourceList } from "./components/getImagingStudyResourceList";
import { getDiagnosticReportList } from "./components/getDiagnosticReportList";
import { getDiagnosticReportConclusion } from "./components/getDiagnosticReportConclusion";

import { report } from "./components/types/report";


// 查詢 DICOM File Study Level 底下的特定 Series 的所有物件
const renderSpecificSeries = createAsyncThunk(
    "renderSpecificSeries",
    async (studyInstanceUID: string, thunkAPI): Promise<Study> => {
        const wado = await getInitWADOService();

        wado.studyInstanceUID = studyInstanceUID;
        await wado.renderSpecificSeries(studyInstanceUID);

        return wado.response;
    }
)

// 查詢 DICOM File Study Level 底下的全部 Series 的所有物件
const renderAllSeries = createAsyncThunk(
    "renderAllSeries",
    async (studyInstanceUID: string, thunkAPI): Promise<Study> => {
        const wado = await getInitWADOService();

        wado.studyInstanceUID = studyInstanceUID;
        await wado.renderAllSeries();

        return wado.response;
    }
)


// 查詢 DICOM File Study Level 的所有 Series
const querySeries = createAsyncThunk(
    "querySeries",
    async (studyInstanceUID: string, thunkAPI): Promise<Study> => {
        const wado = await getInitWADOService();

        wado.studyInstanceUID = studyInstanceUID;
        await wado.querySeries();

        return wado.response;
    }
)

// 查詢 FHIR Server 
const queryReports = createAsyncThunk(
    "queryReports",
    async (seriesInstanceUIDList: string[], thunkAPI): Promise<report[]> => {

        const isUseToken: boolean = false;
        const tokenObject: object = {};
        const queryResourceTypeName: string = "ImagingStudy";
        const fhirServerBaseURL: string = "http://140.131.93.149:8080/fhir";
        const querySpecificResourceTypeURL: string = `${fhirServerBaseURL}/${queryResourceTypeName}?_pretty=true`

        // 取得 Resource Type 為 imagingStudy 的資料 
        const imagingStudyResponseList: object[] = await getImagingStudyResponseListByDICOMSeriesInstanceUIDList(seriesInstanceUIDList, querySpecificResourceTypeURL, isUseToken, tokenObject);

        // 將 FHIR Server Response 過濾出資料數量大於0的 imagingStudyResourceList 
        const imagingStudyResourceList: object[] = await getImagingStudyResourceList(imagingStudyResponseList);

        // 將 imagingStudyResourceList 裡面的 DiagnosticReport 的 List 抓出來 
        const diagnosticReportList: report[] = await getDiagnosticReportList(imagingStudyResourceList, fhirServerBaseURL);

        // 將 DiagnosticReport 的 Conclusion 更新出來
        const result = await getDiagnosticReportConclusion(diagnosticReportList, isUseToken, tokenObject);

        return result as report[];
    }
)



type imageWithReport = {
    imageResult?: Study,
    reportResult?: report[],
    imageResultStatus: string,
    reportResultStatus: string
}

const initialState: imageWithReport = {
    imageResult: undefined,
    reportResult: undefined,
    imageResultStatus: null,
    reportResultStatus: null
};


export const imageWithReportSlice = createSlice({
    name: "imageWithReport",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(renderSpecificSeries.pending, (state, action) => {
            state.imageResultStatus = "Loading";
        })
        builder.addCase(renderSpecificSeries.fulfilled, (state, action) => {
            state.imageResultStatus = "Success";
            state.imageResult = action.payload;
        })
        builder.addCase(renderSpecificSeries.rejected, (state, action) => {
            state.imageResultStatus = "Error";
        })


        builder.addCase(renderAllSeries.pending, (state, action) => {
            state.imageResultStatus = "Loading";
        })
        builder.addCase(renderAllSeries.fulfilled, (state, action) => {
            state.imageResultStatus = "Success";
            state.imageResult = action.payload;
        })
        builder.addCase(renderAllSeries.rejected, (state, action) => {
            state.imageResultStatus = "Error";
        })


        builder.addCase(querySeries.pending, (state, action) => {
            state.imageResultStatus = "Loading";
        })
        builder.addCase(querySeries.fulfilled, (state, action) => {
            state.imageResultStatus = "Success";
            state.imageResult = action.payload;
        })
        builder.addCase(querySeries.rejected, (state, action) => {
            state.imageResultStatus = "Error";
        })

        builder.addCase(queryReports.pending, (state, action) => {
            state.reportResultStatus = "Loading";
        })
        builder.addCase(queryReports.fulfilled, (state, action) => {
            state.reportResultStatus = "Success";
            state.reportResult = action.payload;
        })
        builder.addCase(queryReports.rejected, (state, action) => {
            state.reportResultStatus = "Error";
        })
    }
});

export { renderSpecificSeries, renderAllSeries, querySeries, queryReports };

export default imageWithReportSlice.reducer;