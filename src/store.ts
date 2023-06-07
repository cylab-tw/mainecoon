import { configureStore } from "@reduxjs/toolkit";
import tagListSliceRedcuer from "Slices/tagListSlice"
import qidorsSliceReducer from "Slices/qidorsSlice"
import { loggerMiddleware } from "Middleware";
import { combineReducers } from "@reduxjs/toolkit";
import pyramidSliceReducer from "Slices/pyramidSlice";
import searchAreaSlice from "Slices/searchAreaSlice/searchAreaSlice";
import imageWithReportSlice from "Slices/imageWithReportSlice/imageWithReportSlice";

const reducers = combineReducers({
    tagListSliceRedcuer,
    qidorsSliceReducer,
    pyramidSliceReducer,
    searchAreaSlice,
    imageWithReportSlice
})

const store = configureStore({
    reducer: reducers,
    middleware: (getCurrentMiddleware) => {
        return getCurrentMiddleware({
            serializableCheck: false
        }).concat(loggerMiddleware);
    }

})

export type RootState = ReturnType<typeof reducers>;
export type AppDispatch = typeof store.dispatch;

export default store;