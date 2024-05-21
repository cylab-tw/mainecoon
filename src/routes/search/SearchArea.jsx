import SearchPageHeader from "../search/SearchPageHeader.jsx"
import React, {useCallback, useContext, useEffect, useState} from 'react';
import {SearchResultList} from "../search/SearchResultList.jsx";
import {firstQuery} from "../../lib/search/index.js";
import {Icon} from "@iconify/react";



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
        const newPageOffset = Number(pageOffset) + Number(pageLimit)
        if (newPageOffset < 0) {
            setPageOffset(0)
            return
        }else{
            setPageOffset(newPageOffset)
        }
    }

    useEffect(() => {
        setState({
            ...state,
            parameter: {
                ...state.parameter,
                limit: pageLimit || 10,
                offset: pageOffset || 0
            }
        })
    }, [pageOffset, pageLimit]);

    const [handlePrePageChange, setHandlePrePageChange] = useState(true);
    const [handleNextPageChang, setHandleNextPageChange] = useState(true);
    useEffect( () => {
        const { limit, offset } = state.parameter;
        setHandlePrePageChange(offset > 0)
        firstQuery({...state.parameter,limit:1,offset:limit + offset}).then(({ result } ) => {
            setHandleNextPageChange(result.length > 0)
        })
    }, [state]);



    return <>
        <SearchPageHeader initialState={{state, setState}}
                          // onMessageChange={handleStateChange}
                          // pageLimit={pageLimit}
                          // pageOffset={pageOffset}
        />
        <div className="max-w-full">
            {/*style={{scrollbarWidth: 'none', 'msOverflowStyle': 'none'}}>*/}
            <div className="flex h-full flex-col m-3 gap-3">
                    <div className="flex items-center justify-center">
                        <button className="shadow-2xl w-9 flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-400 text-white h-9 disabled:bg-gray-200" onClick={handlePrePageChangeMessage} disabled={!handlePrePageChange}><Icon icon="el:chevron-left" /></button>
                        <p className="px-3">Limit:</p>
                        <input
                            type="number"
                            min="1"
                            name={"limit"}
                            value={pageLimit}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                            placeholder={"Page Limit"}
                            onChange={handlePageLimit}
                        />
                        <p className="px-3">Offset:</p>
                        <input
                            type="number"
                            min="1"
                            name={"offset"}
                            value={pageOffset}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                            placeholder={"Page Offset"}
                            onChange={handlePageLimit}
                        />
                        <button className="shadow-2xl w-9 flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-400 text-white h-9 disabled:bg-gray-200" onClick={handleNextPageChangeMessage} disabled={!handleNextPageChang}><Icon icon="el:chevron-right" /></button>
                    </div>


                    <div className="flex flex-column rounded-xl overflow-hidden shadow-lg border-2 ">
                        <SearchResultList state={state}/>
                    </div>
                    <div className=" flex items-center justify-center mb-3">
                        <button className="shadow-2xl w-9  flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-400 text-white h-9 disabled:bg-gray-200" onClick={handlePrePageChangeMessage} disabled={!handlePrePageChange}><Icon icon="el:chevron-left" /></button>
                        <p className="px-3">Limit:</p>
                        <input
                            type="number"
                            min="1"
                            name={"limit"}
                            value={pageLimit}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                            placeholder={"Page Limit"}
                            onChange={handlePageLimit}
                        />
                        <p className="px-3">Offset:</p>
                        <input
                            type="number"
                            min="1"
                            name={"offset"}
                            value={pageOffset}
                            className="w-28 h-9 border-2 text-center border-gray-200 rounded-lg mr-3"
                            placeholder={"Page Offset"}
                            onChange={handlePageLimit}
                        />
                        <button className="shadow-2xl w-9  flex justify-center items-center shadow-black m-2 rounded-md px-2 bg-green-400 text-white h-9 disabled:bg-gray-200" onClick={handleNextPageChangeMessage} disabled={!handleNextPageChang}><Icon icon="el:chevron-right" /></button>
                    </div>


            </div>
        </div>
    </>
};

export default Main;
