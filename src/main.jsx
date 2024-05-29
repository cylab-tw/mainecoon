import React from 'react';
import './index.css'
import { createRoot } from "react-dom/client";
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import ViewerPage from './routes/viewer/[...rest]/ViewerPage';
import Search from "./routes/search/SearchArea.jsx"
import ImageReport from "./routes/imageReport/ImageWithReportArea.jsx";



const Main = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to ="/search"/>} />
                {/*<Route path="/viewer/:rest" element={<ViewerPage />} />*/}
                <Route path="/viewer" element={<ViewerPage />} />
                <Route path="/search" element={<Search />} />
                <Route path="/image/:id" element={<ImageReport/>}/>
            </Routes>
        </Router>
    );
};

createRoot(document.getElementById('root')).render(<Main />);
