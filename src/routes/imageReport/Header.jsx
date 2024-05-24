import React from "react";
import mainecoon from "../../assests/mainecoon.png"
import { Link } from 'react-router-dom';

const ImagePageHeader = () => {

    return <>
        <div className="m-0 p-0">
            <div className=" text-white bg-green-600/80 p-1 ">
                <div className="flex flex-row">
                    <Link to="/search" className={"w-16 h-16 flex flex-column justify-center items-center ml-3 mt-2"}>
                        <img src={mainecoon} alt="maincoon"/>
                    </Link>
                    <div className="flex justify-center items-center ">
                        <h1 className="text-2xl mt-2 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                    </div>
                </div>
            </div>
        </div>
    </>
};

export default ImagePageHeader;
