import {Icon} from "@iconify/react";
import React from "react";

const DescriptionPlate = ({ label, icon, isOpen, onClick, children }) => {
    return (
        <>
            <div className="flex flex-row items-center bg-green-300 justify-between" onClick={onClick}>
                <div className="flex items-center">
                    <label className="ml-3 text-md mt-2 font-bold font-sans mb-2">{label}</label>
                    <Icon icon={icon} width="28" height="28" className="ml-3 text-white" />
                </div>
                <div className="mr-5">
                    <Icon icon={isOpen ? "line-md:chevron-small-up" : "line-md:chevron-small-down"} width="24" height="24" />
                </div>
            </div>
            {isOpen && children}
        </>
    );
}


export default DescriptionPlate;