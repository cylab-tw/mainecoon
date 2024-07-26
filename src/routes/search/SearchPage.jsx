import {useState} from 'react';
import {SearchResultList} from "../search/SearchResultList.jsx";
import {Icon} from "@iconify/react";
import SearchPageHeader from "./SearchPageHeader.jsx";

const Main = () => {
    const [pageLimit, setPageLimit] = useState(10);
    const [pageOffset, setPageOffset] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [handleNextPageChange, setHandleNextPageChange] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const handlePageLimit = (e) => {
        const {name, value} = e.target;
        let num = value
        if(num === 0){
            num = 10
        }
        if (name === "offset") {
            setPageOffset(num)
        } else if (name === "limit") {
            setPageLimit(num)
        }
    }

    const handlePrePageChangeMessage = () => {
        const newPageOffset = pageOffset - pageLimit
        if (newPageOffset < 0) {
            setPageOffset(0)
            return
        } else {
            setPageOffset(newPageOffset)
        }
    }
    const handleNextPageChangeMessage = () => {
        const newPageOffset = Number(pageOffset) + Number(pageLimit)
        if (newPageOffset < 0) {
            setPageOffset(0)
            return
        } else {
            setPageOffset(newPageOffset)
        }
    }

    return (
        <div className="flex flex-col h-full ">
            <div>
                <SearchPageHeader setSearchResults={setSearchResults}
                                  pageLimit={pageLimit} pageOffset={pageOffset}
                                  setHandleNextPageChange={setHandleNextPageChange} setIsLoading={setIsLoading}/>
            </div>
            <div className="h-full m-4 overflow-auto bg-white border">
                <SearchResultList searchResults={searchResults} isLoading={isLoading}/>
            </div>
            {/*分頁*/}
            <div className="flex items-center justify-center h-fit bg-gray-200 p-1">
                <button
                    className="shadow-2xl w-9  flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-600 text-white h-9 disabled:bg-gray-400"
                    onClick={handlePrePageChangeMessage} disabled={pageOffset === 0 && pageLimit > 0}>
                    <Icon icon="el:chevron-left"/>
                </button>
                <p className="px-3">Limit:</p>
                <input type="number"
                       min="1"
                       name="limit"
                       value={pageLimit}
                       className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                       placeholder="Page Limit"
                       onChange={handlePageLimit}
                />
                <p className="px-3">Offset:</p>
                <input type="number"
                       min="1"
                       name="offset"
                       value={pageOffset}
                       className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                       placeholder="Page Offset"
                       onChange={handlePageLimit}
                />
                <button
                    className="shadow-2xl w-9  flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-600 text-white h-9 disabled:bg-gray-400"
                    onClick={handleNextPageChangeMessage} disabled={!handleNextPageChange}>
                    <Icon icon="el:chevron-right"/>
                </button>
            </div>
        </div>
    )
};

export default Main;
