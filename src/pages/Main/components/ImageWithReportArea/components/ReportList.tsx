import React from "react";
import { useAppSelector, useAppDispatch } from "Hook";

import _ from "lodash";

import { Report } from "./Report";
import { report as reportType } from "Slices/imageWithReportSlice/components/types/report";


const ReportList: React.FC = () => {

	const imageWithReportSlice = useAppSelector((state) => state.imageWithReportSlice);
	const reportResults = imageWithReportSlice.reportResult;
	const isLoading = _.isEqual(imageWithReportSlice.reportResultStatus, "Loading");

	return <>
		{
			!isLoading && reportResults?.map((reportResult: reportType, index) => {
				const reportResultIndex = index;
				const reportTitle = `Report_${_.toString(reportResultIndex + 1).padStart(3, "000")}`;

				const seriesInstanceUID = reportResult.seriesInstanceUID;
				const diagnosticReportUrl = reportResult.diagnosticReportUrl;

				return <>
					<Report title={reportTitle} seriesInstanceUID={seriesInstanceUID} diagnosticReportUrl={diagnosticReportUrl} />
				</>
			})
		}

		{
			isLoading && (
				<>
					<span>
						Loading
					</span>
				</>
			)
		}
	</>
}



export { ReportList };