import {Icon} from "@iconify/react";
import SpecimenList from "./Specimen.jsx";
import React, {useContext, useEffect, useState} from "react";
import DescriptionPlate from "./DescriptionPlate.jsx";
import Annotaions from "./Annotaions.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import GeometryPicker from "./GeometryPicker.jsx";
import {getRandomColor} from "./MicroscopyViewer.jsx";

import mdiAddSeries from '@iconify-icons/mdi/add'
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";

const RightDrawer = ({SMseriesUid,labelOpen, handleLabelOpen, Specimen,Loading, Layers, RightDrawerOpen, handleDeleteAnn, onMessageChange,NewSeriesInfo}) => {
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext);
    const [isOpen, setIsOpen] = useState(false);
    const [layers, setLayers] = Layers;


    const [drawTypes, setDrawTypes] = useState('')

    const [currentDraw, setCurrentDraw] = useState({seriesUid:"",index:""});
    const AddNewSeries = (value) => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const formattedMonth = month < 10 ? `0${month}` : month;
        const SeriesUiddate = `${date.getFullYear()}${formattedMonth}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;
        const seriesUid = `2.16.886.111.100513.6826.${SeriesUiddate}`;
        setDrawTypes(value);
        onMessageChange({name: 'addSeries', type: value, seriesUid: seriesUid,smSeriesUid:SMseriesUid});
        setIsOpen(false);
        setCurrentDraw({seriesUid:seriesUid,index:0});
    }

    const openGeometryPicker = (event) => {
        event.stopPropagation();
        setIsOpen(!isOpen);
    }

    const handleMessage = (message) => {
        onMessageChange(message);
    }

    return (
        <div className="!h-100 overflow-auto " style={{width:'500px'}}>
            <div className="flex flex-col w-full h-full border-end">
                <div className="flex flex-row items-center bg-green-300 justify-between">
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
                {labelOpen[3] !== 0 && <div className="">
                    <div className="my-1.5">Slide Label</div>
                </div>}
                <DescriptionPlate label="Specimens"
                                  icon="pajamas:details-block"
                                  isOpen={labelOpen[4] !== 0}
                                  onClick={(e) => handleLabelOpen(e, 4)}
                >
                    <SpecimenList Specimen={Specimen}/>
                </DescriptionPlate>
                <div className="overflow-auto">
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
                                              <div className={`absolute bg-white -right-8 border-2 rounded-xl p-2 mt-3 flex ${isOpen ? '' : 'hidden'}`}>
                                                  <GeometryPicker className={'bg-white/80'} onPick={(value) => AddNewSeries(value)} onClick={openGeometryPicker}/>
                                              </div>
                                          </div>
                                      </>
                                  }
                >
                    <Annotaions Layers={Layers} onMessageChange={handleMessage} Loading={Loading} CurrentDraw={[currentDraw, setCurrentDraw]}/>
                </DescriptionPlate>
                </div>
            </div>
        </div>
    );
}

export default RightDrawer;
