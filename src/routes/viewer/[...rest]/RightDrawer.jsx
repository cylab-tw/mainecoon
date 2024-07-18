import {Icon} from "@iconify/react";
import SpecimenList from "./Specimen.jsx";
import React, {useContext, useEffect} from "react";
import DescriptionPlate from "./DescriptionPlate.jsx";
import Annotaions from "./Annotaions.jsx";
import LoadingSpin from "./LoadingSpin.jsx";

const RightDrawer = ({
                         labelOpen, handleLabelOpen, Specimen, Layers,RightDrawerOpen,
                         expandedGroups,handleDeleteAnn}) => {

    // 處理annGroup選單
    const handleAnnDrawer = (index) => {
        if (expandedGroups.includes(index)) {
            setExpandedGroups(expandedGroups.filter((item) => item !== index));
        } else {
            setExpandedGroups([...expandedGroups, index]);
        }
    }

    return (
        <div className="!h-100 w-3/12 overflow-auto">
            <div className="flex flex-col w-full h-full border-end">
                <div className="flex flex-row items-center bg-green-300 justify-between">
                    <div className="flex text-left">
                        <div className="bg-opacity-100 flex z-30">
                            <button
                                className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg p-3"
                                onClick={RightDrawerOpen}>
                                {'>>'}
                            </button>
                        </div>
                        <div className="flex items-center" value={3} onClick={(e) => handleLabelOpen(e, 3)}>
                            <label className="ml-5 text-md mt-2 font-bold font-sans mb-2 flex">
                                Slide label
                                <Icon icon="fluent:slide-text-sparkle-24-filled" width="28" height="28"
                                      className="ml-3 text-white"/>
                            </label>
                        </div>
                    </div>
                    <div className="mr-5">
                        <Icon icon={labelOpen[3] === 0 ? "line-md:chevron-small-down" : "line-md:chevron-small-up"}
                              width="24" height="24"/>
                    </div>
                </div>
                {labelOpen[3] !== 0 && <div className="">
                    <div className="p-1.5">Slide Label</div>
                </div>}
                <DescriptionPlate label="Specimens"
                                  icon="pajamas:details-block"
                                  isOpen={labelOpen[4] !== 0}
                                  onClick={(e) => handleLabelOpen(e, 4)}
                >
                    <SpecimenList Specimen={Specimen}/>
                </DescriptionPlate>
                <DescriptionPlate label="Annotations"
                                  icon="pajamas:details-block"
                                  isOpen={labelOpen[5] !== 0}
                                  onClick={(e) => handleLabelOpen(e, 5)}>

                    <Annotaions Layers={Layers}/>
                </DescriptionPlate>
                <div className="flex justify-center">
                    <button className="border-1 bg-green-300 rounded-lg m-2 p-2 font-sans font-bold text-sm">Add Series</button>
                </div>
            </div>
        </div>
    )
}

export default RightDrawer;
