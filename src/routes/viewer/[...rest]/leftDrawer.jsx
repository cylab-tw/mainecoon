import React, {useState} from "react";
import PatientDetails from "./PatientDetails.jsx";
import {Icon} from "@iconify/react";

const LeftDrawer = ({detail,labelOpen,isLabelOpen,smAccessionNumber,seriesUid,smSeriesUid}) => {
    const [isLabelOpenDrawer,setIsLabelOpenDrawer] = isLabelOpen;
    const [seriesUId,setSeriesUId] = seriesUid;
    const [smSeriesUId,setSmSeriesUId] = smSeriesUid;

    const Section = ({label, icon, isOpen, handleToggle, children}) => (
        <div className="flex flex-col bg-green-50 w-full h-full border-end">
            <div className={`flex flex-row items-center bg-green-300 mt-2 justify-between`} onClick={handleToggle}>
                <div className="flex items-center">
                    <label className="ml-5 text-lg mt-2 font-bold font-sans mb-2 flex items-center">
                        {label}
                        <Icon icon={icon} width="28" height="28" className="ml-3 text-white"/>
                    </label>
                </div>
                <div className="mr-1">
                    <Icon icon={isOpen ? "line-md:chevron-small-up" : "line-md:chevron-small-down"}
                          width="24"
                          height="24"/>
                </div>
            </div>
            {/*<div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0 overflow-hidden'}`}>*/}
            {isOpen && children}
            {/*</div>*/}
        </div>
    );
    const handleLabelOpen = (e, value) => {
        e.preventDefault();
        // const value = parseInt(e.currentTarget.getAttribute('value'));
        const newLabelOpen = [...labelOpen];
        newLabelOpen[value] = newLabelOpen[value] === 0 ? 1 : 0;
        setIsLabelOpenDrawer(newLabelOpen);
    }
    function navigateTo(e) {
        const value = e.target.value
        setSeriesUId(value)
        setSmSeriesUId(value)
    }


    return (
        <div className={`!h-100 w-3/12 overflow-auto `}>
            <div className="flex flex-col w-full h-full border-end">
                <div>
                    <Section
                        label="Patient"
                        icon="bi:people-circle"
                        isOpen={labelOpen[0] !== 0}
                        handleToggle={(e) => handleLabelOpen(e, 0)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label={"Patient"} />
                    </Section>
                </div>
                <div>
                    <Section
                        label="Case"
                        icon="fluent:document-data-16-filled"
                        isOpen={labelOpen[1] !== 0}
                        handleToggle={(e) => handleLabelOpen(e, 1)}
                    >
                        <PatientDetails labelOpen={labelOpen} detail={detail} label={"Case"} />
                    </Section>
                </div>
                <div>
                    <Section
                        label="Series"
                        icon="fluent:document-data-16-filled"
                        isOpen={labelOpen[2] !== 0}
                        handleToggle={(e) => handleLabelOpen(e, 2)}
                    >
                        <div className="bg-green-50">
                            <div className="p-1.5">
                                {smAccessionNumber.map((series, index) => (
                                    <div key={index}>
                                        <button
                                            className="text-lg w-full mt-2 p-1.5 hover:bg-green-100"
                                            onClick={(e) => navigateTo(e, series[0])}
                                            value={series[0]}
                                        >
                                            {series[1]}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    )
}
export default LeftDrawer;