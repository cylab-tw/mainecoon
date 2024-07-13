import React, {useRef, useState} from "react";
import mainecoon from "../../../assests/mainecoon.png"
import {Link} from 'react-router-dom';
import {Icon} from "@iconify/react";
import Modal from "./ToolsModal.jsx";
import PatientDetails from "./PatientDetails.jsx";
import {useOutsideClick} from "../../search/SearchPageHeader.jsx";

const ViewerPageHeader = ({detail, annColor, drawType, undo, save, isLeftOpen, labelOpen, isReportOpen, studyUid}) => {
    const [drawColor, setDrawColor] = annColor
    const [drawOfType, setDrawOfType] = drawType;
    const [undoDraw, setUndoDraw] = undo;
    const [saveAnnotations, setSaveAnnotations] = save;
    const [isLeftDrawerOpen, setIsLeftDrawerOpen] = isLeftOpen;
    const [isShowReport, setIsShowReport] = isReportOpen;
    const [isMouseOn, setIsMouseOn] = useState(false);
    const [isMouseOnPatient, setIsMouseOnPatient] = useState(false);
    const [isMouseOnCase, setIsMouseOnCase] = useState(false);

    const updateDrawType = (e, type) => {
        let prevButton = e.target;
        for (let i = 0; !prevButton?.querySelector('svg.animate-bounce') && i < 5; i++) {
            prevButton = prevButton.parentElement;
        }
        prevButton.querySelector('svg.animate-bounce')?.classList.remove('animate-bounce');
        let target = e.target;
        while (!target.querySelector('svg')) target = target.parentElement;
        target.querySelector('svg').classList.add('animate-bounce');
        setDrawOfType(type);
    };

    const undoFeature = () => {
        setUndoDraw([...undoDraw, drawOfType]); // FIXME
    }

    const handleSaveAnnotations = () => {
        setSaveAnnotations(!saveAnnotations);
    }

    const handleViewer = (e) => {
        setDrawOfType(null)
        let target = e.target;
        while (!target.querySelector('svg.animate-bounce')) target = target.parentElement;
        target.querySelector('svg.animate-bounce').classList.remove('animate-bounce');
    }

    const mouseOnFun = () => {
        setIsMouseOn(!isMouseOn);
    };
    const mouseOnPatientFun = () => {
        setIsMouseOnPatient(!isMouseOnPatient);
    }
    const mouseOnCaseFun = () => {
        setIsMouseOnCase(!isMouseOnCase);
    }

    // IPAD觸控
    const mouseOutFun = () => {
        setIsMouseOn(false);
        handleViewer();
    };
    const mouseOutPatientFun = () => {
        setIsMouseOnPatient(false);
    };
    const mouseOutCaseFun = () => {
        setIsMouseOnCase(false);
    };

    const myRef = useRef(null);
    const myPatientDetailsRef = useRef(null);
    const myCaseDetailsRef = useRef(null);
    // useOutsideClick(myRef, () => {mouseOutFun()});
    useOutsideClick(myPatientDetailsRef, () => {mouseOutPatientFun()});
    useOutsideClick(myCaseDetailsRef, () => {mouseOutCaseFun()});


    return (
        <>
            <div className="bg-green-500 text-white p-1 h-fit">
                <div className="flex flex-row ">
                    <div className="flex">
                        <Link to="/" className={"w-14 h-14 flex flex-column justify-center items-center ml-3 mt-1"}>
                            <img src={mainecoon} alt="maincoon"/>
                        </Link>
                        <div className="flex items-center">
                            <h1 className="text-2xl mt-1 ml-2 mr-5 font-bold font-serif">MAINECOON</h1>
                        </div>
                    </div>

                    <div className="text-black flex w-full justify-start text-center m-2 font-bold gap-2">
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    onClick={() => setIsShowReport(!isShowReport)}
                            ><Icon icon="tabler:report" width="24" height="24" className="mr-1"/>Report
                            </button>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}
                            ><Icon icon="fluent:pane-open-24-regular" width="24" height="24" className="mr-1"/>All
                            </button>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    ref={myPatientDetailsRef} onMouseOver={mouseOnPatientFun} onMouseLeave={mouseOutPatientFun}>
                                <Icon icon="bi:people-circle" width="24" height="24" className="mr-1"/>Patient
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnPatient ? '' : 'hidden'}`}>
                                    <PatientDetails detail={detail} label={"Patient"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    ref={myCaseDetailsRef} onMouseOver={mouseOnCaseFun} onMouseLeave={mouseOutCaseFun}
                            ><Icon icon="fluent:document-data-16-filled" width="24" height="24" className="mr-1"/>Study
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnCase ? '' : 'hidden'}`}>
                                <PatientDetails detail={detail} label={"Study"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center w-full">
                        <div ref={myRef} onClick={mouseOnFun}>
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block">
                                <Icon icon="mdi:tag-edit" className="text-black h-6 w-6"/>
                            </button>
                        </div>
                        <div className="flex flex-row m-2 gap-2">
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    onClick={handleViewer}>
                                <Icon icon="fa6-regular:hand" className="animate-bounce text-black h-6 w-6"/>
                            </button>
                            <button className="relative bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                    onClick={handleViewer}>
                                <label className="contents ">
                                    <span className="h-6 w-6 block" style={{backgroundColor: drawColor}}></span>
                                    <input
                                        type="color"
                                        className="h-[0.01rem] w-[0.01rem] absolute tops left-1/2 invisible"
                                        onChange={(e) => setDrawColor(e.target.value)}
                                        value={drawColor}
                                    />
                                </label>
                            </button>
                            <button className="bg-white hover:bg-blue-400 rounded-lg p-2 mr-1 mb-1 block"
                                    onClick={handleSaveAnnotations}
                            >
                                <Icon icon="ant-design:save-outlined" className="text-black h-6 w-6"/>
                            </button>
                            <button
                                className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-1 mb-1 block"
                                onClick={undoFeature}
                            >
                                <Icon icon="gg:undo" className="text-black h-6 w-6"/>
                            </button>
                            <button className="ml-4 mr-1 mb-1" style={{transform: 'rotate(180deg)'}}>
                                <Icon icon="fluent:list-28-filled" className="text-black h-6 w-6"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isMouseOn}>
                <div className="m-2 mt-3 flex">

                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'Point')}
                    >
                        <Icon icon="tabler:point-filled" className="text-black h-6 w-6"/>
                    </button>
                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'LineString')}
                    >
                        <Icon icon="material-symbols-light:polyline-outline"
                              className="text-black h-6 w-6"/>
                    </button>
                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'Polygon')}
                    >
                        <Icon icon="ph:polygon" className="text-black h-6 w-6"/>
                    </button>
                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'Rectangle')}
                    >
                        <Icon icon="f7:rectangle" className="text-black h-6 w-6"/>
                    </button>
                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'Ellipse')}
                    >
                        <Icon icon="mdi:ellipse-outline" className="text-black h-6 w-6"/>
                    </button>
                    <button className="bg-white hover:bg-yellow-500 rounded-lg p-2 mr-2 mb-2 block"
                            onClick={(e) => updateDrawType(e, 'ELLIPSE')}
                    >
                        <Icon icon="bx:screenshot" className="text-black h-6 w-6"/>
                    </button>
                    <button
                        className="bg-white hover:bg-red-500 text-red-500 hover:text-white rounded-lg p-2 mb-2 block"
                        onClick={mouseOutFun}
                    >
                        <Icon icon="pajamas:close-xs" className="h-6 w-6"/>
                    </button>
                </div>
            </Modal>

        </>)
};

export default ViewerPageHeader;
