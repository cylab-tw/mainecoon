import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";

import _ from "lodash";

import { updateQueryParameter, firstQuery, getNextTenResult } from "Slices/searchAreaSlice/searchAreaSlice";
import { SearchResult } from './SearchResult';

const SearchResultList: React.FC = () => {

    const searchResultListRef = useRef<HTMLDivElement>(null);

    const searchAreaReducer = useAppSelector((state) => state.searchAreaSlice);
    const queryParameter = searchAreaReducer.parameter;
    const results = _.isEmpty(searchAreaReducer.results) ? [] : searchAreaReducer.results;
    const isNextQueryEmpty = searchAreaReducer.isNextQueryEmpty;

    const dispatch = useAppDispatch();

    function onScroll() {
        if (searchResultListRef.current) {
            const clientHeight = searchResultListRef.current.clientHeight;
            const scrollHeight = searchResultListRef.current.scrollHeight;
            const scrollTop = searchResultListRef.current.scrollTop;

            // 卷軸觸底行為
            if (scrollTop + clientHeight === scrollHeight) {
                // 下一階段查詢 不是空的才查詢
                if (isNextQueryEmpty != true) {
                    dispatch(getNextTenResult(queryParameter));
                }

            }
        }
    }

    return <>
        <div className="flex-fill overflow-y-auto overflow-x-hidden h-0" onScroll={onScroll} ref={searchResultListRef}>
            {
                results.map((result) => {
                    return <>
                        <SearchResult
                            qidorsSingleStudy={result}
                        />
                    </>
                })
            }
        </div>
    </>
}




export { SearchResultList }