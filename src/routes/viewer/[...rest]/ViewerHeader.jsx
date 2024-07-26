import {useRef, useState} from "react";
import mainecoon from "../../../assests/mainecoon.png"
import {Link} from 'react-router-dom';
import {Icon} from "@iconify/react";
import Modal from "./ToolsModal.jsx";
import PatientDetails from "./PatientDetails.jsx";
import {useOutsideClick} from "../../search/SearchPageHeader.jsx";
import GeometryPicker from "./GeometryPicker.jsx";

const ViewerPageHeader = ({DrawColor,detail, save, isLeftOpen, isReportOpen,onMessageChange}) => {
    const [saveAnnotations, setSaveAnnotations] = save;
    const [isLeftDrawerOpen, setIsLeftDrawerOpen] = isLeftOpen;
    const [isShowReport, setIsShowReport] = isReportOpen;
    const [isMouseOn, setIsMouseOn] = useState(false);
    const [isMouseOnPatient, setIsMouseOnPatient] = useState(false);
    const [isMouseOnCase, setIsMouseOnCase] = useState(false);
    const [drawColor, setDrawColor] = DrawColor;

    const handleSaveAnnotations = () => {
        setSaveAnnotations(!saveAnnotations);
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


    const handleDraw = (name,type) => {
        onMessageChange({name: name, type: type});
    }

    const handleDrawColor = (e) => {
        const hexColor = e.target.value;
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const rgbaColor = `rgba(${r}, ${g}, ${b}, 1)`;
        setDrawColor(rgbaColor);
    }


    return (
        <>
            <div className="bg-green-500 text-white p-1 h-fit">
                <div className="flex flex-row ">
                    <div className="flex">
                        <Link to="/" className={"w-14 h-14 flex flex-column items-center ml-1"}>
                            <img src={mainecoon} alt="maincoon"/>
                        </Link>
                        <div className="flex items-center">
                            <h1 className="text-2xl ml-2 mr-5 font-bold font-serif tracking-wider">MAINECOON</h1>
                        </div>
                    </div>

                    <div className="text-black w-full flex justify-start items-center text-center font-bold gap-1 text-sm">
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                    onClick={() => setIsShowReport(!isShowReport)}>
                                <Icon icon="tabler:report" width="18" height="18" />
                                <span className="sm:inline hidden ml-1">Report</span>
                            </button>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                    onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}>
                                <Icon icon="fluent:pane-open-24-regular" width="18" height="18"/>
                                <span className="sm:inline hidden ml-1">All</span>
                            </button>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                    ref={myPatientDetailsRef} onMouseOver={mouseOnPatientFun} onMouseLeave={mouseOutPatientFun}>
                                <Icon icon="bi:people-circle" width="18" height="18"/>
                                <span className="sm:inline hidden ml-1">Patient</span>
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnPatient ? '' : 'hidden'}`}>
                                    <PatientDetails detail={detail} label={"Patient"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                        <div>
                            <button className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                    ref={myCaseDetailsRef} onMouseOver={mouseOnCaseFun} onMouseLeave={mouseOutCaseFun}
                            ><Icon icon="fluent:document-data-16-filled" width="20" height="20"/>
                                <span className="sm:inline hidden ml-1">Study</span>
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnCase ? '' : 'hidden'}`}>
                                <PatientDetails detail={detail} label={"Study"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center w-full">
                        <div ref={myRef} onClick={mouseOnFun} className="mr-2">
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block">
                                <Icon icon="mdi:tag-edit" className="text-black h-5 w-5"/>
                            </button>
                        </div>
                        <div className="flex flex-row gap-2">
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block" onClick={()=>handleDraw('cancel','')}>
                                <Icon icon="fa6-regular:hand" className="text-black h-5 w-5"/>
                            </button>
                            {/*<button className="relative bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block">*/}
                            {/*    <label className="contents ">*/}
                            {/*        <span className="h-5 w-5 block" style={{backgroundColor: drawColor}}></span>*/}
                            {/*        <input*/}
                            {/*            type="color"*/}
                            {/*            className="h-5 w-5 absolute tops left-1/2 invisible"*/}
                            {/*            onChange={(e) => handleDrawColor(e)}*/}
                            {/*            value={drawColor}*/}
                            {/*        />*/}
                            {/*    </label>*/}
                            {/*</button>*/}
                            <button className="bg-white hover:bg-blue-400 rounded-lg p-1.5 mr-1 mb-1 block"
                                    onClick={handleSaveAnnotations}
                            >
                                <Icon icon="ant-design:save-outlined" className="text-black h-5 w-5"/>
                            </button>
                            <button
                                className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                            >
                                <Icon icon="gg:undo" className="text-black h-6 w-6"/>
                            </button>
                            <button className="ml-4 mr-1 mb-1" style={{transform: 'rotate(180deg)'}}>
                                <Icon icon="fluent:list-28-filled" className="text-black h-5 w-5"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isMouseOn}>
                <div className="m-2 mt-3 flex">
                    <GeometryPicker className="flex"
                                    buttonClassName={"bg-white mr-2 hover:bg-green-400 hover:text-white"}
                                    onPick={(type)=> handleDraw('drawtype',type)}/>
                </div>
            </Modal>

        </>)
};

export default ViewerPageHeader;
