import { Icon } from "@iconify/react";
import React from "react";

const DescriptionPlate = ({ label, icon, isOpen, onClick, children, action }) => {
    return (
        <>
            <div className="flex flex-row items-center bg-green-300/80 justify-between" onClick={onClick}>
                <div className="flex items-center">
                    <label className="ml-3 text-sm my-2 font-bold font-sans">{label}</label>
                    <Icon icon={icon} width="20" height="20" className="ml-3 text-white" />
                </div>
                <div className="flex mr-5 items-center">
                    {action && <div className="">{action}</div>}
                    <Icon icon={isOpen ? "line-md:chevron-small-up" : "line-md:chevron-small-down"} width="20" height="20" />
                </div>
            </div>
            {isOpen && children}
        </>
    );
}

export default DescriptionPlate;
