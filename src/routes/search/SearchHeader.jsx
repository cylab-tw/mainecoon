import React, {useEffect, useRef, useState} from 'react';
import Modal from './SearchHeaderModal';

const SearchHeader = ({State}) => {

    const [isMouseOn, setIsMouseOn] = useState(false);
    const [state, setState] = State;
    const [parameter, setParameter] = useState(state.parameter);

    const queryParameterHandler = (e) => {
        const {name, value} = e.target;
        setParameter(prevState => ({
            ...prevState,
            [name]: value
        }));
    };
    console.log("parameter", parameter)


    const mouseOnFun = () => {
        setIsMouseOn(true);
    };
    // IPAD觸控
    const mouseOutFun = () => {
        setIsMouseOn(false);
    };

    const myRef = useRef(null);
    useOutsideClick(myRef, () => {
        mouseOutFun()
    });

    const searchBtnOnClick = async () => {
        setState({...state,parameter,timeStamp:Date.now()})
    };


    return (
        <>
            <div ref={myRef} className="" onMouseOver={mouseOnFun}>
                <div className="bg-auto border-bottom m-2 ">
                    <div className="">
                        <div className="flex flex-fill flex-column">
                            <div className="flex flex-fill border-b border-white pb-0.5">
                                <div className="flex items-center me-2 font-bold">Patient ID :</div>
                                <input
                                    className="border-2 m-2 p-2 rounded-lg text-black"
                                    name="PatientID"
                                    value={parameter.PatientID}
                                    onChange={(e) => {
                                        queryParameterHandler(e)
                                    }}
                                />
                                <button className="border-2 m-2 rounded-lg px-2 " onClick={searchBtnOnClick}>Search
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                {isMouseOn &&
                    <Modal isOpen={true} onClose={mouseOutFun}>
                        <div className="flex flex-fill flex-column mt-2">
                            <div className="flex w-full">
                                <div className="flex items-center me-2 font-bold">Patient&nbsp;Name&nbsp;:</div>
                                <input
                                    className="border-2 m-2 p-2 rounded-lg text-black w-full"
                                    name="PatientName"
                                    value={parameter.PatientName}
                                    onChange={(e) => {
                                        queryParameterHandler(e)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-fill flex-column">
                            <div className="flex flex-fill w-full">
                                <div className="flex items-center me-2 font-bold">StudyUID&nbsp;:</div>
                                <input
                                    className="border-2 m-2 p-2 rounded-lg text-black w-full"
                                    name="StudyInstanceUID"
                                    value={parameter.StudyInstanceUID}
                                    onChange={(e) => {
                                        queryParameterHandler(e)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-fill flex-column">
                            <div className="flex flex-fill w-full">
                                <div className="flex items-center me-2 font-bold">AccessionNumber&nbsp;:</div>
                                <input
                                    className="border-2 m-2 p-2 rounded-lg text-black w-full"
                                    name="AccessionNumber"
                                    value={parameter.AccessionNumber}
                                    onChange={(e) => {
                                        queryParameterHandler(e)
                                    }}
                                />
                            </div>
                        </div>
                        <div className="flex flex-fill flex-column border-b border-white mb-3 pb-3">
                            <div className="flex flex-fill w-full ">
                                <div className="flex items-center me-2 font-bold">StudyDate&nbsp;:</div>
                                <input
                                    className="border-2 m-2 p-2 rounded-lg text-black w-full"
                                    name="StudyDate"
                                    value={parameter.StudyDate}
                                    onChange={(e) => {
                                        queryParameterHandler(e)
                                    }}
                                />
                            </div>
                        </div>
                    </Modal>}
            </div>
        </>
    );
};


export const useOutsideClick = (ref, callback) => {
    useEffect(() => {
        const handleClickOutside = event => {
            if (ref.current && !ref.current.contains(event.target)) {
                callback(event);
                // ref.current.dispatchEvent(new CustomEvent('click-outside'));
            }
        };
        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [ref, callback]);
};

export {SearchHeader};
