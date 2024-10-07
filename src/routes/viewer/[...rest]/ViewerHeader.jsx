import './pacman-loader.css';
import {useContext, useRef, useState} from "react";
import mainecoon from "../../../assests/mainecoon.png"
import {Link} from 'react-router-dom';
import {Icon} from "@iconify/react";
import Modal from "./ToolsModal.jsx";
import PatientDetails from "./PatientDetails.jsx";
import {useOutsideClick} from "../../search/SearchPageHeader.jsx";
import GeometryPicker from "./GeometryPicker.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import Cookies from 'js-cookie';
import {toast} from "react-toastify";

const ViewerPageHeader = ({
                              DrawColor,
                              detail,
                              save,
                              isLeftOpen,
                              isReportOpen,
                              onMessageChange,
                              studyUid,
                              seriesUid,
                              imageLoading
                          }) => {
    const [saveAnnotations, setSaveAnnotations] = save;
    const [isLeftDrawerOpen, setIsLeftDrawerOpen] = isLeftOpen;
    const [isShowReport, setIsShowReport] = isReportOpen;
    const [isMouseOn, setIsMouseOn] = useState(false);
    const [isMouseOnPatient, setIsMouseOnPatient] = useState(false);
    const [isMouseOnCase, setIsMouseOnCase] = useState(false);
    const [drawColor, setDrawColor] = DrawColor;
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext)
    const [okToSave, setOkToSave] = useState(false);
    const [loading, setLoading] = useState(false);
    const accessToken = Cookies.get('access_token');
    const handleSaveAnnotations = (studyUid, seriesUid) => {
        setSaveAnnotations(!saveAnnotations);

        const totalPixelMatrixColumns = annotationList.totalPixelMatrixColumns;

        const formatCoordinates = (type, data) => {
            switch (type) {
                case 'POLYLINE':
                    return data.map(shape => `(${shape[0]},${-shape[1]})`);
                case 'POLYGON':
                    return data.flatMap(shape => shape.map(nestedList => `(${nestedList[0]},${-nestedList[1]})`));
                case 'RECTANGLE':
                    return data.flatMap(nestedList => nestedList.map(coordinateList => `(${coordinateList[0]},${-coordinateList[1]})`));
                case 'POINT':
                    return data.map(shape => `(${shape[0]},${-shape[1]})`);
                case 'ELLIPSE':
                    let formattedCoordinates = [];
                    let MaxX = -Infinity, MaxY = -Infinity, MinX = Infinity, MinY = Infinity;
                    let pointA = '', pointB = '', pointC = '', pointD = '';

                    data.forEach(nestedList => {
                        nestedList.forEach(coordinateList => {
                            if (coordinateList[0] > MaxX) {
                                MaxX = coordinateList[0];
                                pointA = `(${coordinateList[0]},${-coordinateList[1]})`;
                            }
                            if (coordinateList[0] < MinX) {
                                MinX = coordinateList[0];
                                pointC = `(${coordinateList[0]},${-coordinateList[1]})`;
                            }
                            if (coordinateList[1] > MaxY) {
                                MaxY = coordinateList[1];
                                pointB = `(${coordinateList[0]},${-coordinateList[1]})`;
                            }
                            if (coordinateList[1] < MinY) {
                                MinY = coordinateList[1];
                                pointD = `(${coordinateList[0]},${-coordinateList[1]})`;
                            }
                        });
                    });

                    formattedCoordinates.push(pointB, pointD, pointC, pointA);
                    return formattedCoordinates;
                default:
                    return [];
            }
        };

        let saveDataJson = null;
        let save = false;

        Object.values(annotationList).forEach(annotation => {
            Object.values(annotation).forEach(group => {
                if (group.editable === true) {
                    const data = Object.values(group.group).flatMap(item => {
                        if (typeof item.pointsData === 'object' && Object.keys(item.pointsData).length === 0) {
                            return [];
                        }
                        return (item.graphicType === 'POLYLINE' || item.graphicType === 'POLYGON')
                            ? item.pointsData.map(point => ({
                                type: item.graphicType,
                                GroupName: item.groupName,
                                coordinates: formatCoordinates(item.graphicType, point),
                            }))
                            : [{
                                type: item.graphicType,
                                GroupName: item.groupName,
                                coordinates: formatCoordinates(item.graphicType, item.pointsData),
                            }];
                    });
                    if (data.length > 0) {
                        saveDataJson = JSON.stringify({
                            token: accessToken,
                            totalPixelMatrixColumns,
                            data
                        });
                        console.log('saveDataJson', saveDataJson);
                        save = true;
                    }
                }
            });
        });

        if (!save) {
            setOkToSave(false);
            toast.error('Please finish editing before saving');
            return;
        }

        setOkToSave(true);
        setLoading(true);
        setIsMouseOn(false);

        fetch(`/api/SaveAnnData/studies/${studyUid}/series/${seriesUid}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: saveDataJson,
        })
            .then(response => {
                setLoading(false);
                if (response.ok) {
                    toast.success('Annotations saved successfully');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    toast.error('Failed to save annotations');
                }
            })
            .catch(() => {
                setLoading(false);
                toast.error('Network error, please try again');
            });
    };


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
    useOutsideClick(myPatientDetailsRef, () => {
        mouseOutPatientFun()
    });
    useOutsideClick(myCaseDetailsRef, () => {
        mouseOutCaseFun()
    });


    const handleDraw = (name, type) => {
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
            {loading && <div
                className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white p-5 rounded-lg">
                    <div className="loader mx-auto mb-2"></div>
                    <span className="text-2xl font-bold">Saving Annotations...</span>
                </div>
            </div>
            }

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

                    <div
                        className="text-black w-full flex justify-start items-center text-center font-bold gap-1 text-sm">
                        {/*<div>*/}
                        {/*    <button*/}
                        {/*        className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"*/}
                        {/*        onClick={() => setIsShowReport(!isShowReport)}>*/}
                        {/*        <Icon icon="tabler:report" width="18" height="18"/>*/}
                        {/*        <span className="sm:inline hidden ml-1">Report</span>*/}
                        {/*    </button>*/}
                        {/*</div>*/}
                        <div>
                            <button
                                className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                onClick={() => setIsLeftDrawerOpen(!isLeftDrawerOpen)}>
                                <Icon icon="fluent:pane-open-24-regular" width="18" height="18"/>
                                <span className="sm:inline hidden ml-1">All</span>
                            </button>
                        </div>
                        <div>
                            <button
                                className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                ref={myPatientDetailsRef} onMouseOver={mouseOnPatientFun}
                                onMouseLeave={mouseOutPatientFun}>
                                <Icon icon="bi:people-circle" width="18" height="18"/>
                                <span className="sm:inline hidden ml-1">Patient</span>
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnPatient ? '' : 'hidden'}`}>
                                <PatientDetails detail={detail} label={"Patient"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                        <div>
                            <button
                                className="flex bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                ref={myCaseDetailsRef} onMouseOver={mouseOnCaseFun}
                                onMouseLeave={mouseOutCaseFun}
                            ><Icon icon="fluent:document-data-16-filled" width="20" height="20"/>
                                <span className="sm:inline hidden ml-1">Study</span>
                            </button>
                            <div className={`relative bg-white z-10 ${isMouseOnCase ? '' : 'hidden'}`}>
                                <PatientDetails detail={detail} label={"Study"} style={"ViewerHeader"}/>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end items-center w-full">
                        <div ref={myRef} onClick={mouseOnFun}
                             className={`mr-2 ${imageLoading ? 'pointer-events-none opacity-50' : ''}`}>
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block">
                                <Icon icon="mdi:tag-edit" className="text-black h-5 w-5"/>
                            </button>
                        </div>

                        <div className="flex flex-row gap-2">
                            <button className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"
                                    onClick={() => handleDraw('cancel', '')}>
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
                            <button className="bg-white hover:bg-blue-400 rounded-lg p-1.5 mr-6 mb-1 block"
                                    onClick={() => handleSaveAnnotations(studyUid, seriesUid)}
                            >
                                <Icon icon="ant-design:save-outlined" className="text-black h-5 w-5"/>
                            </button>
                            {/*<button*/}
                            {/*    className="bg-white hover:bg-yellow-500 rounded-lg p-1.5 mr-1 mb-1 block"*/}
                            {/*>*/}
                            {/*    <Icon icon="gg:undo" className="text-black h-6 w-6"/>*/}
                            {/*</button>*/}
                            {/*<button className="ml-4 mr-1 mb-1" style={{transform: 'rotate(180deg)'}}>*/}
                            {/*    <Icon icon="fluent:list-28-filled" className="text-black h-5 w-5"/>*/}
                            {/*</button>*/}
                        </div>
                    </div>
                </div>
            </div>
            <Modal isOpen={isMouseOn}>
                <div className="m-2 mt-3 flex">
                    <GeometryPicker className="flex"
                                    buttonClassName={"bg-white mr-2 hover:bg-green-400 hover:text-white"}
                                    onPick={(type) => handleDraw('drawtype', type)}/>
                </div>
            </Modal>

        </>)
};

export default ViewerPageHeader;
