import React from "react";
import { Link } from "react-router-dom";


const Header: React.FC = () => {
    return <>
        <div className="m-0 p-0">
            <nav className="navbar text-white bg-primary pd-3">
                <div className="container-fluid">
                    <Link className="navbar-brand text-white" to="/">MaineCoonViewer</Link>
                </div>
            </nav>
        </div>
    </>
};

export default Header;
