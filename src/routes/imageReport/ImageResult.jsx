import React from "react";
import {useNavigate} from 'react-router-dom';
import {Icon} from '@iconify/react';

const ImageResult = ({wadoSingleSeries}) => {

    const everySeries_numberOfFramesList = [];
    const navigate = useNavigate();
    const modalityAttribute = wadoSingleSeries.metadata[0]?.['00080060']?.Value ?? null;
    const T = new Set((wadoSingleSeries.metadata[0]?.['006A0002']?.Value ?? []).flatMap((tags) => tags['00700023'].Value));
    const studyInstanceUID = wadoSingleSeries.metadata[0]?.['0020000D']?.Value ?? null;
    const seriesInstanceUID = wadoSingleSeries.metadata[0]?.['0020000E']?.Value ?? null;

    if (modalityAttribute == "SM") {
        for (let index = 0; index < wadoSingleSeries.metadata.length; index++) {
            const element = wadoSingleSeries.metadata[index];
            const value = element?.['00280008']?.Value?.[0];
            const numberOfFrames = value != null ? value.toString() : null;
            everySeries_numberOfFramesList.push(numberOfFrames);
        }
    }

    const sorted_everySeries_numberOfFramesList = everySeries_numberOfFramesList.slice().sort((a, b) => a - b);
    const maxNumberOfFrames = sorted_everySeries_numberOfFramesList[sorted_everySeries_numberOfFramesList.length - 1];
    const seriesLevel = wadoSingleSeries.metadata.length;

    function OnClick() {
        if (studyInstanceUID == null && seriesInstanceUID == null) return;
        navigate(`../viewer/NTUNHS?studyUid=${studyInstanceUID}&seriesUid=${seriesInstanceUID}`);
    }

    return (
        <>
            <div className="mt-4 ">
                <div className=" w-full mb-2 h-[15rem] border-4 rounded-lg shadow-xl shadow-gray-400"
                     key="{seriesInstanceUID}"
                     onClick={OnClick}>
                    {(modalityAttribute == "SM" || modalityAttribute == "ANN") && (
                        <div className="">
                            {modalityAttribute == "SM" && (
                                <>
                                    <div className="">
                                        <div className="flex justify-center">
                                            <Icon icon="emojione-monotone:microscope" width="128" height="128"/>
                                        </div>
                                        <div className="flex flex-col space-y-0 ">
                                            <h5 className="text-green-500 font-bold ml-3 mt-1">{modalityAttribute}</h5>
                                            <p className="ml-3 text-sm">最大圖片數量：{maxNumberOfFrames}張</p>
                                            <p className="ml-3 text-sm">擁有放大倍率：{seriesLevel}層</p>
                                        </div>
                                    </div>
                                </>)
                            }
                            {modalityAttribute == "ANN" && (
                                <>
                                    <div className=" ">
                                        <div className="flex justify-center mb-2">
                                            <Icon icon="fluent:tag-search-24-filled" width="128" height="128"
                                                  className="text-red-500/90"/>
                                        </div>
                                        <div className="flex flex-col space-y-0">
                                            <p className="font-bold text-green-500 text-lg ml-3 mb-5">{modalityAttribute}</p>
                                            <p className="-translate-y-4 mr-3 ml-3 font-bold mb-5 text-[0.8rem] font-mono mt-2"> {Array.from(T).sort().join(', ')}</p>
                                        </div>
                                    </div>
                                </>)
                            }
                        </div>)
                    }
                    {modalityAttribute != "SM" && modalityAttribute != "ANN" && (
                        <>
                            <div className="flex justify-center">
                                <Icon icon="logos:whatwg" width="118" height="118"/>
                            </div>
                            <p className="font-bold text-green-500 text-lg ml-3 mt-3">{modalityAttribute}</p>
                        </>)
                    }
                </div>
            </div>
        </>)
}

export {ImageResult};