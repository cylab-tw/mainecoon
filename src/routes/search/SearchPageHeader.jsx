import React, {useContext, useEffect, useRef, useState} from "react";
import mainecoon from "../../assests/mainecoon.png"
import {Link} from 'react-router-dom';
import Server from "./Server.jsx";
import {ServerContext} from "../../lib/ServerContext.jsx";
import SearchForm from "./SearchForm.jsx";
import {CombineSearchURL} from "../../lib/search/index.js";

const SearchPageHeader = ({setSearchResults, pageLimit, pageOffset, setHandleNextPageChange,setIsLoading}) => {
    const [server, setServer] = useContext(ServerContext)
    const [isMouseOn, setIsMouseOn] = useState(false);
    const myRef = useRef(null);
    const [parameter, setParameter] = useState({
        StudyDate: undefined,
        StudyTime: undefined,
        AccessionNumber: undefined,
        ModalitiesInStudy: "SM",
        ReferringPhysicianName: undefined,
        PatientName: undefined,
        PatientID: undefined,
        StudyInstanceUID: undefined,
        StudyID: undefined
    })


    useEffect(() => {
        setIsLoading(true);
        const searchUrl = CombineSearchURL(parameter, server, pageLimit, pageOffset);
        fetch(searchUrl).then(response => response.json()).then(data => {
            setSearchResults(data)
            setIsLoading(false)
        })
    }, []);

    useEffect(() => {
        setIsLoading(true);
        const searchUrl = CombineSearchURL(parameter, server, pageLimit, pageOffset);
        fetch(searchUrl)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    return [];
                }
            })
            .then(data => {
                if (data.length - pageLimit < 0) {
                    setHandleNextPageChange(false);
                } else {
                    setHandleNextPageChange(true);
                }
                setSearchResults(data);
                setIsLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setSearchResults([]);
                setIsLoading(false);
            });

    }, [server, pageLimit, pageOffset])

    const mouseOnFun = () => {
        setIsMouseOn(true)
    };
    const mouseOutFun = () => {
        setIsMouseOn(false)
    };

    useOutsideClick(myRef, () => {
        mouseOutFun()
    });

    return <>
        <div className="sticky m-0 top-0 p-0 w-full z-50">
            <div className="text-white bg-green-600 p-1 ">
                <div className="flex flex-row justify-between h-auto ">
                    <div className="flex">
                        <div className="flex justify-center items-center ">
                            <Link to="/" className="w-16 h-16 flex flex-column justify-center items-center ml-3 mt-2">
                                <img src={mainecoon} alt="maincoon"/>
                            </Link>
                            <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                        </div>
                        <div className="ml-32">
                            <div ref={myRef} className="" onMouseOver={mouseOnFun}>
                                <div className="my-2 mx-4">
                                    <div className="flex flex-fill flex-column border-b border-white">
                                        <SearchForm name="PatientID" setSearchResults={setSearchResults}
                                                    pageLimit={pageLimit} Parameter={[parameter, setParameter]}
                                                    pageOffset={pageOffset} setIsMouseOn={setIsMouseOn}
                                                    setIsLoading={setIsLoading}
                                        />
                                    </div>
                                </div>
                                <div className="relative ">
                                    <div
                                        className={`absolute border-b border-white bg-green-600 rounded-lg -top-4 ${isMouseOn ? '' : "hidden"}`}>
                                        <div className="mt-2.5 ml-1 pl-4 pr-4">
                                            <SearchForm name="PatientName" setSearchResults={setSearchResults}
                                                        pageLimit={pageLimit} Parameter={[parameter, setParameter]}
                                                        pageOffset={pageOffset} setIsMouseOn={setIsMouseOn}
                                                        setIsLoading={setIsLoading}/>
                                            <SearchForm name="StudyInstanceUID" setSearchResults={setSearchResults}
                                                        pageLimit={pageLimit} Parameter={[parameter, setParameter]}
                                                        pageOffset={pageOffset} setIsMouseOn={setIsMouseOn}
                                                        setIsLoading={setIsLoading}/>
                                            <SearchForm name="AccessionNumber" setSearchResults={setSearchResults}
                                                        pageLimit={pageLimit} Parameter={[parameter, setParameter]}
                                                        pageOffset={pageOffset} setIsMouseOn={setIsMouseOn}
                                                        setIsLoading={setIsLoading}/>
                                            <SearchForm name="StudyDate" setSearchResults={setSearchResults}
                                                        pageLimit={pageLimit} Parameter={[parameter, setParameter]}
                                                        pageOffset={pageOffset} setIsMouseOn={setIsMouseOn}
                                                        setIsLoading={setIsLoading}/>
                                        </div>
                                        <div className="flex justify-end mb-1.5 mr-2 font-bold">
                                            <button onClick={mouseOutFun}>Close</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Server/>
                </div>
            </div>
        </div>
    </>
};

export const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = event => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(event);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
};


export default SearchPageHeader;
