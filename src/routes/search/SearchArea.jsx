import SearchPageHeader from "../search/SearchPageHeader.jsx"
import React, {useCallback, useContext, useState} from 'react';
import {SearchResultList} from "../search/SearchResultList.jsx";
import {firstQuery} from "../../lib/search/index.js";


const Main = () => {
    const [state, setState] = useState({
        config: {},
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
            limit: 10,
            offset: 0
        },
        isNextQueryEmpty: false,
        status: null
    });


    console.log("state", state)
    const [pageLimit, setPageLimit] = useState(state.parameter.limit || 10);
    const [pageOffset, setPageOffset] = useState(state.parameter.offset || 0);
    const handlePageLimit = (e) => {
        const {name, value} = e.target;
        if (name === "offset") {
            setPageOffset(value)
        } else if (name === "limit") {
            setPageLimit(value)
        }
    }

    const handlePrePageChangeMessage = () => {
        const newPageOffset = pageOffset - pageLimit
        if(newPageOffset < 0){
            setPageOffset(0)
            return
        }else{
            setPageOffset(newPageOffset)
        }
    }
    const handleNextPageChangeMessage = () => {
        console.log("pageLimit2", pageLimit)
        console.log("pageOffset2", pageOffset)
        const newPageOffset = pageOffset + pageLimit
        if (newPageOffset < 0) {
            setPageOffset(0)
            return
        }else{
            setPageOffset(newPageOffset)
        }
    }

    console.log("112315645646465")



    return <>
        <SearchPageHeader initialState={{state, setState}}
                          // onMessageChange={handleStateChange}
                          // pageLimit={pageLimit}
                          // pageOffset={pageOffset}
        />
        <div className="overflow-y-auto max-w-full border-2 h-full">
            {/*style={{scrollbarWidth: 'none', 'msOverflowStyle': 'none'}}>*/}
            <div className="flex h-full border-2 flex-cols-2">
                <div className="flex flex-row w-full justify-center">
                    <div className=" right-6 mt-2 absolute">
                        <input
                            type="number"
                            min="1"
                            name={"limit"}
                            value={pageLimit}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                            placeholder={"Page Limit"}
                            onChange={handlePageLimit}
                        />
                        <input
                            type="number"
                            min="1"
                            name={"offset"}
                            value={pageOffset}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg"
                            placeholder={"Page Offset"}
                            onChange={handlePageLimit}
                        />
                        <button className="shadow-2xl w-20 shadow-black m-2 rounded-md px-2 bg-green-400 text-white p-1" onClick={handlePrePageChangeMessage}>pre</button>
                        <button className="shadow-2xl w-20 shadow-black m-2 rounded-md px-2 bg-green-400 text-white p-1" onClick={handleNextPageChangeMessage}>next</button>
                    </div>

                    <div className="flex flex-column border-2  w-full mt-14 mr-4 ml-4 mb-4 rounded-xl shadow-2xl overflow-x-hidden overflow-y-auto">
                        <SearchResultList state={state}/>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default Main;
