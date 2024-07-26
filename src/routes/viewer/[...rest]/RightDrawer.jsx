import {Icon} from "@iconify/react";
import SpecimenList from "./Specimen.jsx";
import React, {useContext, useEffect, useState} from "react";
import DescriptionPlate from "./DescriptionPlate.jsx";
import Annotaions from "./Annotaions.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import GeometryPicker from "./GeometryPicker.jsx";
import mdiAddSeries from '@iconify-icons/mdi/add'
import {generateSeriesUID} from "../../../lib/search/index.js";

const RightDrawer = ({urlInfo,SMseriesUid, labelOpen, handleLabelOpen,Loading, Layers, RightDrawerOpen, handleDeleteAnn,
                         CurrentDraw,onMessageChange}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [drawTypes, setDrawTypes] = useState('')
    const [currentDraw, setCurrentDraw] = CurrentDraw

    const AddNewSeries = (value) => {
        const seriesUid = generateSeriesUID();
        setDrawTypes(value);
        onMessageChange({name: 'addSeries', type: value, seriesUid: seriesUid, smSeriesUid: SMseriesUid});
        setIsOpen(false);
        setCurrentDraw({seriesUid: seriesUid, index: 0});
        onMessageChange({seriesUid: seriesUid});
    }

    const openGeometryPicker = (event) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
    }

    const handleMessage = (message) => {
        onMessageChange(message);
    }

    return (
        <div className="h-100 overflow-auto " style={{width: '550px'}}>
            <div className="flex flex-col w-full h-full border-end">
                <div className="flex flex-row items-center bg-green-300 justify-between border-b border-gray-100/60">
                    <div className="flex text-left">
                        <div className="bg-opacity-100 flex z-30">
                            <button
                                className="flex items-center bg-gray-400 hover:bg-gray-600 text-white font-bold rounded-r-lg px-2 py-1"
                                onClick={RightDrawerOpen}>{'>>'}
                            </button>
                        </div>
                        <div className="flex items-center" value={3} onClick={(e) => handleLabelOpen(e, 3)}>
                            <label className="ml-5 text-sm my-2 font-bold font-sans flex">
                                Slide label
                                <Icon icon="fluent:slide-text-sparkle-24-filled" width="20" height="20"
                                      className="ml-3 text-white"/>
                            </label>
                        </div>
                    </div>
                    <div className="mr-5">
                        <Icon icon={labelOpen[3] === 0 ? "line-md:chevron-small-down" : "line-md:chevron-small-up"}
                              width="20" height="20"/>
                    </div>
                </div>
                {labelOpen[3] !== 0 && <div className="border-b border-gray-200/50">
                    <div className="my-1.5">Slide Label</div>
                </div>}
                    <DescriptionPlate label="Specimens"
                                      icon="pajamas:details-block"
                                      isOpen={labelOpen[4] !== 0}
                                      onClick={(e) => handleLabelOpen(e, 4)}
                    >
                        <SpecimenList urlInfo={urlInfo}/>
                    </DescriptionPlate>
                <div className="h-full border-t border-gray-100/60">
                    <DescriptionPlate label="Annotations"
                                      icon="pajamas:details-block"
                                      isOpen={labelOpen[5] !== 0}
                                      onClick={(e) => handleLabelOpen(e, 5)}
                                      action={
                                          <>
                                              <button
                                                  className="border-1 hover:bg-green-200 rounded-lg m-2 p-1 font-sans font-bold text-sm"
                                                  onClick={openGeometryPicker}>
                                                  <Icon icon={mdiAddSeries} width="20" height="20"/>
                                              </button>
                                              <div className="relative">
                                                  <div
                                                      className={`absolute bg-white -right-8 border-2 rounded-xl p-2 mt-3 flex ${isOpen ? '' : 'hidden'}`}>
                                                      <GeometryPicker className={'bg-white/80'}
                                                                      onPick={(value) => AddNewSeries(value)}
                                                                      onClick={openGeometryPicker}/>
                                                  </div>
                                              </div>
                                          </>
                                      }
                    >
                        <Annotaions Layers={Layers} onMessageChange={handleMessage} Loading={Loading}
                                    CurrentDraw={CurrentDraw}/>
                    </DescriptionPlate>
                </div>
            </div>
        </div>
    );
}

export default RightDrawer;
