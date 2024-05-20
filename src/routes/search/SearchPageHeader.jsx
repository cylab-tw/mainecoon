import React, {useEffect, useState} from "react";
import mainecoon from "../../assests/mainecoon.png"
import { Link } from 'react-router-dom';
import {SearchHeader} from "./SearchHeader.jsx";

const SearchPageHeader = ({initialState}) => {
    const {state, setState} = (initialState);


    // const handleMessageChange = (result, parameter, qidoConfig) => {
    //     const newState = {
    //         ...state,
    //         // results: result,
    //         parameter: parameter,
    //         config: qidoConfig
    //     };
    //     setState(newState);
    //     // onMessageChange(newState);
    // };

    return <>
        <div className="m-0 p-0">
            <div className=" text-white bg-green-400 p-1 ">
                <div className="flex flex-row">
                    <Link to="/" className={"w-16 h-16 flex flex-column justify-center items-center ml-3 mt-2"}>
                        <img src={mainecoon} alt="maincoon"/>
                    </Link>
                    <div className="flex justify-center items-center ">
                        <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                    </div>
                    <div className="ml-32">
                        <SearchHeader  State={[state, setState]}
                                      // pageLimit={pageLimit} pageOffset={pageOffset} onMessageChange={handleMessageChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default SearchPageHeader;
