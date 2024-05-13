import React from 'react';
import './index.css'
import { createRoot } from 'react-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ViewerPage from './routes/viewer/[...rest]/ViewerPage';
import Root from "./routes/root.jsx";


const Main = () => {
    return (
        <Router>
            <Routes>
                <Route path="/viewer/:rest" element={<ViewerPage />} />


                {/*<Route path="/viewer/test" element={<ViewerPage />} />*/}
                <Route path="/test/:rest" element={<Root />} />
            </Routes>
        </Router>
    );
};

createRoot(document.getElementById('root')).render(<Main />);
