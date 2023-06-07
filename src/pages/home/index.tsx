import Header from "Components/Header";
import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
    return <>
        <Header />
        <p>Page Home</p>
        <Link to="/wsiViewerOpenLayers/1.3.46.670589.45.1.1.4993912214784.1.5436.1538560373543/1.3.46.670589.45.1.1.4993912214784.1.5436.1538560606509.3/SM">wsiViewerOpenLayers + Philips^Amy</Link>
        <Link to="/wsiViewerOpenLayers/2.16.840.1.113995.3.110.3.0.10118.2000002.278819.649182/2.16.840.1.113995.3.110.3.0.10118.2000002.862753/SM">wsiViewerOpenLayers + Diagnostics^R</Link>
        <Link to="/newMain">NewMain</Link>
    </>
};

export default Home;
