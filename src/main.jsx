import React from 'react';
import './index.css'
import { createRoot } from "react-dom/client";
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';
import ViewerPage from './routes/viewer/[...rest]/ViewerPage';
import Search from "./routes/search/SearchArea.jsx"
import {ServerProvider} from "./lib/ServerContext.jsx";



const Main = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Navigate to ="/search"/>} />
                <Route path="/viewer" element={<ViewerPage />} />
                <Route path="/search" element={<Search />} />
            </Routes>
        </Router>
    );
};

createRoot(document.getElementById('root')).render(
    <ServerProvider>
        <Main />
    </ServerProvider>);
