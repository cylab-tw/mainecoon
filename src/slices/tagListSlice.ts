import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type tag = {
    color: string,
    name: string,
    count: number
};

type tagListState = {
    tagList: tag[]
}

const initialState: tagListState = {
    tagList: []
};

export const tagListSlice = createSlice({
    name: "tagList",
    initialState,
    reducers: {
        addTestTag: (state) => {
            const testTag: tag = {
                color: "#FFA500",
                name: "fakeTagName",
                count: 666
            }
            state.tagList.push(testTag);
        }
    },
});

export const { addTestTag } = tagListSlice.actions;

export default tagListSlice.reducer;