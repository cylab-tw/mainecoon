import {Icon} from "@iconify/react";
import SpecimenList from "./Specimen.jsx";
import React from "react";
import DescriptionPlate from "./DescriptionPlate.jsx";
const RightDrawer = ({labelOpen,handleLabelOpen,Specimen,annAccessionNumber,groupName,annCheckboxList,RightDrawerOpen,
                         expandedGroups,handleAnnDrawer,handleChecked,handleInnerChecked,handleColorChange,color,handleDeleteAnn}) => {

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
                {labelOpen[3] !== 0 && <div className=""><div className="p-1.5">Slide Label</div></div>}
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
                </DescriptionPlate>
            </div>
        </div>
    )
}

export default RightDrawer;



//ann
//                         <div className="bg-green-50">
//                             <div>
//                                 {annAccessionNumber.map((series, index0) => {
//                                     return (
//                                         <>
//                                             <div key={index0}
//                                                  className="mt-2.5 ml-2.5 mr-2.5 flex items-center hover:bg-green-100">
//                                                 {
//                                                     annCheckboxList[index0] === true ? (
//                                                         <>
//                                                             <input type="checkbox" id={series[0]}
//                                                                    name={series[0]}
//                                                                    value={series[0]}
//                                                                    className="w-6 h-6 flex"
//                                                                    onChange={(e) => handleInnerChecked(e, series[0], index0)}
//                                                             />
//                                                         </>
//                                                     ) : (
//                                                         <Icon icon="svg-spinners:6-dots-rotate"
//                                                               width="24"
//                                                               height="24"
//                                                               className="text-green-500"/>
//                                                     )
//                                                 }
//                                                 <p className="text-md w-full mt-2 p-1 ml-2 font-bold"
//                                                    onClick={(e) => handleAnnDrawer(index0)}>
//                                                     {series[1]}
//                                                 </p>
//                                                 <Icon
//                                                     icon={expandedGroups.includes(index0) ? "line-md:chevron-small-up" : "line-md:chevron-small-down"}
//                                                     className={"w-8 h-8 mr-3"}/>
//                                                 <button onClick={() => handleDeleteAnn(index0)}>
//                                                     <Icon
//                                                         icon="tabler:trash" width="24" height="24"
//                                                         className="text-red-500"/></button>
//                                             </div>
//                                             <div>
//                                                 <div
//                                                     style={{display: expandedGroups.includes(index0) ? "block" : "none"}}>
//                                                     {groupName[index0] ? (
//                                                         <div className="bg-white">
//                                                             {groupName[index0].map((group, index) =>
//                                                                 (
//                                                                     <div key={index}
//                                                                          className="ml-2.5 mr-2.5 flex items-center hover:bg-green-100">
//                                                                         {annCheckboxList[index0] === true ? (
//                                                                             <>
//                                                                                 <input
//                                                                                     type="checkbox"
//                                                                                     id={group}
//                                                                                     name={group}
//                                                                                     value={group}
//                                                                                     className="ml-6 w-6 h-6 flex"
//                                                                                     data-index={series[0]}
//                                                                                     data-groupindex={index + index0}
//                                                                                     onChange={(e) => handleChecked(e, index + index0, series[0], 0)}
//                                                                                 />
//                                                                             </>
//                                                                         ) : (
//                                                                             <Icon
//                                                                                 icon="svg-spinners:6-dots-rotate"
//                                                                                 width="24"
//                                                                                 height="24"
//                                                                                 className="ml-6 text-green-500"/>)
//                                                                         }
//                                                                         <p className="text-md w-full mt-2 p-1 ml-2 font-bold">
//                                                                             {group}
//                                                                         </p>
//                                                                         <label
//                                                                             className="contents ">
//                                                                                             <span
//                                                                                                 className="h-5 w-10 block"
//                                                                                                 style={{backgroundColor: color[index + index0]}}></span>
//                                                                             <input
//                                                                                 type="color"
//                                                                                 className="h-[0.01rem] w-[0.01rem] absolute tops left-1/2 invisible"
//                                                                                 onChange={(e) => handleColorChange(index + index0, e.target.value)}
//                                                                                 // value={drawColor}
//                                                                             />
//                                                                         </label>
//
//                                                                     </div>
//                                                                 )
//                                                             )}
//                                                         </div>
//                                                     ) : (
//                                                         <Icon icon="svg-spinners:6-dots-rotate"
//                                                               width="24" height="24"
//                                                               className="text-green-500"/>
//                                                     )
//                                                     }
//                                                 </div>
//                                             </div>
//                                         </>
//                                     )
//                                 })}
//                             </div>
//                         </div>
//
//
//                         <div className="flex justify-center">
//                             <button className="border-1 bg-green-300 rounded-lg m-2 p-2.5 font-sans font-bold">Add Series</button>
//                         </div>