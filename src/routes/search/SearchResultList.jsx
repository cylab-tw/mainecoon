import React, {useEffect, useRef, useState} from 'react';
import SearchResult from "./SearchResult.jsx";
import {firstQuery, hasNext} from "../../lib/search/index.js";
import L_Modal from "../imageReport/LoadingModal.jsx";

const SearchResultList = ({state}) => {
    const searchResultListRef = useRef();
    const [results, setResults] = useState([]);
    function onScroll() {
        if (searchResultListRef.current) {
            const clientHeight = searchResultListRef.current.clientHeight;
            const scrollHeight = searchResultListRef.current.scrollHeight;
            const scrollTop = searchResultListRef.current.scrollTop;

            // 卷軸觸底行為
            if (scrollTop + clientHeight === scrollHeight) {
                // 下一階段查詢 不是空的才查詢
                // if (!isNextQueryEmpty) {
                //     dispatch(getNextTenResult(queryParameter));
                // }
            }
        }
    }

    const [isLoading, setIsLoading] = useState(true);
    useEffect( () => {
        setIsLoading(true);
        firstQuery(state.parameter).then(({ result } ) => {
            console.log("result", result)
            setResults(Array.isArray(result) ? result : [])
            setIsLoading(false);
            return result
        })
        const hasNextResult = hasNext(state.parameter);
    }, [state]);

    return (
        <>
            {/*-ms-overflow-style*/}
            <div className="flex-fill h-0 w-full "
                 onScroll={onScroll}
                 ref={searchResultListRef}
                 style={{scrollbarWidth: 'thin', 'msOverflowStyle': 'none'}}>

                    <div className="w-full">

                        <table className="w-full mr-2 rounded-t-xl overflow-hidden">
                            <thead>
                            <tr className="h-12">
                                <td className="p-2 font-bold bg-green-400 rounded-lt-xl text-white">PatientID</td>
                                <td className="p-2 font-bold bg-green-400 text-white">Name</td>
                                <td className="p-2 font-bold bg-green-400 text-white">BirthDate</td>
                                <td className="p-2 font-bold bg-green-400 text-white">Sex</td>
                                <td className="p-2 font-bold bg-green-400 text-white">Accession Number</td>
                                <td className="p-2 font-bold bg-green-400 text-white">Study Date</td>
                                <td className="p-2 font-bold bg-green-400 text-white">SM&emsp;</td>
                                <td className="p-2 font-bold bg-green-400 text-white">ANN&nbsp;</td>
                            </tr>
                            </thead>
                            <tbody>
                            {!isLoading && results.length == 0 ? (<td colSpan={8} className="text-center">
                                <p className="p-5 text-xl font-serif">No Results Found</p></td>
                            ) : (
                            results.map((result) => {
                                return (
                                    <SearchResult
                                        key={result.id}
                                        qidorsSingleStudy={result}
                                    />
                                );
                            }))}
                            </tbody>
                        </table>

                    </div>

            </div>
            <L_Modal isOpen={isLoading}><p className="text-black">Loading...</p></L_Modal>

        </>
    );
};

export {SearchResultList};
