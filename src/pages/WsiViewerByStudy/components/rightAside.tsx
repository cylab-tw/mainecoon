// react
import React, { useState, useEffect, useRef } from 'react';

import { useAppSelector, useAppDispatch } from "Hook";
import _ from "lodash";

import Accordion from 'react-bootstrap/Accordion';



type RightAside = {
    seriesInstanceUID: string
}


const RightAside: React.FunctionComponent<RightAside> = ({
    seriesInstanceUID
}) => {

    const imageWithReportReducer = useAppSelector((state) => state.imageWithReportSlice);
    const seriesResults = imageWithReportReducer.imageResult?.Series;
    const smSeriesResult = seriesResults[_.toNumber(_.findKey(seriesResults, { 'uid': seriesInstanceUID }))];
    const metadata = _.first(smSeriesResult.metadata);

    // Patient 
    const patientName: string = _.get(_.first(_.get(_.get(metadata, "00100010"), "Value")), "Alphabetic");
    const patientID: string = _.first(_.get(_.get(metadata, "00100020"), "Value"));
    const patientBirthDate: string = _.first(_.get(_.get(metadata, "00100030"), "Value"));
    const patientSex: string = _.first(_.get(_.get(metadata, "00100040"), "Value"));

    // Case 
    const accessionNumber: string = _.first(_.get(_.get(metadata, "00080050"), "Value"));
    const studyID: string = _.first(_.get(_.get(metadata, "00200010"), "Value"));
    const studyDate: string = _.first(_.get(_.get(metadata, "00080020"), "Value"));
    const studyTime: string = _.first(_.get(_.get(metadata, "00080030"), "Value"));


    // SlideLabel
    const labelText: string = _.first(_.get(_.get(metadata, "22000002"), "Value"));
    const barcodeValue: string = _.first(_.get(_.get(metadata, "22000005"), "Value"));

    
    return <>
        <div className='w-600px h-100 bg-white overflow-scroll' style={{ whiteSpace: 'pre-line' }}>
            <Accordion defaultActiveKey={["0", "1", "2"]} alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>Patient</Accordion.Header>
                    <Accordion.Body>
                        <p>patientName: {patientName}</p>
                        <p>patientID: {patientID}</p>
                        <p>patientBirthDate: {patientBirthDate}</p>
                        <p>patientSex: {patientSex}</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Case</Accordion.Header>
                    <Accordion.Body>
                        <p>AccessionNumber: {accessionNumber}</p>
                        <p>StudyID: {studyID}</p>
                        <p>StudyDate: {studyDate}</p>
                        <p>StudyTime: {studyTime}</p>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="2">
                    <Accordion.Header>SlideLabel</Accordion.Header>
                    <Accordion.Body>
                        <p>labelText: {labelText}</p>
                        <p>barcodeValue: {barcodeValue}</p>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    </>
}


export default RightAside;