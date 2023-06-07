import React from 'react';
import _ from "lodash";

import { ReportList } from "./components/ReportList";
import { ImageResultList } from "./components/ImageResultList";


const Header: React.FC = () => {
	return <>
		<nav className="navbar bg-white border-bottom h-navbarh">
			<div className="container-fluid">
				<a className="navbar-brand text-primary">
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-images" viewBox="0 0 16 16">
						<path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
						<path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2zM14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1zM2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1h-10z" />
					</svg>
					<span className="ps-2 fs-5 fw-bolder">{"Image & Report"}</span>
				</a>
			</div>
		</nav>
	</>
}



const ImageWithReportArea: React.FC = () => {
	return <>
		<div className="bg-white bg-opacity-25 flex-fill d-flex flex-column w-0">
			<Header />

			<div className="flex-fill overflow-y-auto overflow-x-hidden h-0 p-4 row row-cols-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-4 row-cols-xxl-5">
				<ImageResultList />
			</div>

			<div className="h-25 border bg-white d-flex overflow-y-hidden overflow-x-auto p-4">
				<ReportList />
			</div>

		</div>
	</>
};

export default ImageWithReportArea;
