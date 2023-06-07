import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";

import { QueryParameter_StudyDate } from "./SearchHeader/QueryParameter/StudyDate";
import { QueryParameter_AccessionNumber } from "./SearchHeader/QueryParameter/AccessionNumber";
import { QueryParameter_StudyUID } from "./SearchHeader/QueryParameter/StudyUID";
import { QueryParameter_PatientName } from "./SearchHeader/QueryParameter/PatientName";
import { QueryParameter_PatientID } from "./SearchHeader/QueryParameter/PatientID";

const SearchHeader: React.FC = () => {

    const [isMouseOn, setIsMouseOn] = useState(false);

    function mouseOnFun() {
        setIsMouseOn(true);
    }

    function mouseOutFun() {
        setIsMouseOn(false);
    }

    return <>
        <div
            className="position-relative"
            onMouseOver={mouseOnFun}>
            <SearchHeaderLiteMode />
            {isMouseOn && <SearchHeaderExpandMode onMouseHoverHandler={mouseOutFun} />}
        </div>
    </>
}

type SearchHeaderProps = {
    onMouseHoverHandler: () => void
}

const SearchHeaderExpandMode: React.FC<SearchHeaderProps> = ({ onMouseHoverHandler }) => {




    return <>
        <nav className="navbar bg-white border-bottom position-absolute top-0 start-0 w-100" onMouseLeave={onMouseHoverHandler}>
            <div className="container-fluid">
                <div className="d-flex flex-fill flex-column">
                    <QueryParameter_PatientID />
                    <QueryParameter_PatientName />
                    <QueryParameter_StudyUID />
                    <QueryParameter_AccessionNumber />
                    <QueryParameter_StudyDate />
                </div>
            </div>
        </nav>
    </>
}



const SearchHeaderLiteMode: React.FC = () => {

    return <>
        <nav className="navbar bg-white border-bottom h-navbarh">
            <div className="container-fluid">
                <div className="d-flex flex-fill flex-column">
                    <QueryParameter_PatientID />
                </div>
            </div>
        </nav>
    </>
}


export { SearchHeader };