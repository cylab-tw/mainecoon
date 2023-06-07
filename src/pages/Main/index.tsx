import Header from "Components/Header";
import React from 'react';
import TagArea from "./components/TagArea/TagArea";
import SearchArea from "./components/SearchArea/SearchArea";
import ImageWithReportArea from "./components/ImageWithReportArea/ImageWithReportArea";



const UseableBlank: React.FC = () => {
    return <>
        <div className="m-0 p-0 flex-fill">
            <div className="d-flex h-100">
                <SearchArea />
                <ImageWithReportArea />
            </div>
        </div>
    </>
}

const Main: React.FC = () => {
    return <>
        <Header />
        <UseableBlank />
    </>
};

export default Main;
