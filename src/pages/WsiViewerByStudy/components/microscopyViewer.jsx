import React, { useState, useEffect, useRef } from 'react';

import { useAppSelector, useAppDispatch } from "Hook";
import { Study, Series, Instance, Frame } from "csy-dicomweb-wado-rs-uri";
import _ from "lodash";

import Map from "ol/Map";
import View from "ol/View";
import LayerTile from "ol/layer/Tile";
import XYZ from 'ol/source/XYZ';
import { Point, Circle, MultiLineString, MultiPolygon, MultiPoint } from 'ol/geom';
import VectorLayer from 'ol/layer/Vector';
import { Feature } from 'ol';
import VectorSource from 'ol/source/Vector';
import { Projection } from 'ol/proj';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY } from 'ol/coordinate';
import { getCenter } from 'ol/extent';
import TileDebug from 'ol/source/TileDebug';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Draw, Modify, Snap } from 'ol/interaction';
import { GeoJSON, KML } from 'ol/format';

import dicomWebServerConfig from "Configs/DICOMWebServer.config";

function microscopyViewer(props) {

    const viewerID = "viewerID";

    const pyramidSliceReducer = useAppSelector((state) => state.pyramidSliceReducer);
    const Instances = pyramidSliceReducer.smResult?.Instances;
    const annVectorLayers = pyramidSliceReducer.annotaionResults;


    const map = new Map();

    useEffect(() => {
        console.log("Instances", Instances);

        const minLevel = 0;
        const maxLevel = _.size(Instances) - 1;
        const bigestInstance = _.last(Instances);
        const bigestInstanceMetadata = _.get(bigestInstance, "metadata");
        const totalPixelMatrixColumns = _.first(_.get(_.get(bigestInstanceMetadata, "00480006"), "Value")); // 00480006 總寬 TotalPixelMatrixColumns 
        const totalPixelMatrixRows = _.first(_.get(_.get(bigestInstanceMetadata, "00480007"), "Value")); // 00480007 總高 TotalPixelMatrixRows 
        const rows = _.first(_.get(_.get(bigestInstanceMetadata, "00280010"), "Value"));// 每張小圖的高
        const columns = _.first(_.get(_.get(bigestInstanceMetadata, "00280011"), "Value"));// 每張小圖的寬
        const minX = -(totalPixelMatrixColumns / 2);
        const minY = -(totalPixelMatrixRows / 2);
        const maxX = totalPixelMatrixColumns / 2;
        const maxY = totalPixelMatrixRows / 2;

        const extent = [0, 0, totalPixelMatrixColumns, totalPixelMatrixRows]; //左下角為 0,0

        const dicomProjection = new Projection({
            code: 'DICOM',
            units: 'pixels',
            extent: extent
        });

        const wsiSourceXYZ = new XYZ({
            tileUrlFunction: (tileCoord) => {
                const z = tileCoord[0];
                const x = tileCoord[1];
                const y = tileCoord[2];

                const currentInstance = Instances[z]; // 當前的 Instance
                const currentInstanceMetadata = _.get(currentInstance, "metadata"); // 當前 Instance 的 Metadata

                const currentInstanceTotalPixelMatrixColumns = _.first(_.get(_.get(currentInstanceMetadata, "00480006"), "Value")); // 00480006 總寬 TotalPixelMatrixColumns 
                const currentInstanceSingleImageWidth = _.first(_.get(_.get(currentInstanceMetadata, "00280011"), "Value")); // 每張小圖的寬
                const widthImageCount = Math.ceil(currentInstanceTotalPixelMatrixColumns / currentInstanceSingleImageWidth); // 寬度部分要擺多少張
                const index = x + y * widthImageCount // 計算 Index

                const queryMode = _.get(currentInstance, "queryMode");
                const frames = _.get(currentInstance, "Frames");

                const specificFrameObject = _.get(frames, index);
                const url = _.get(_.get(_.get(specificFrameObject, "url"), queryMode), "rendered");

                return url;
            },
            maxZoom: maxLevel,
            minZoom: minLevel,
            projection: dicomProjection,
            wrapX: false,
            interpolate: false,
        });

        const customLoader = (tile, src) => {
            const client = new XMLHttpRequest();
            client.open('GET', src);

            const tokenName = "Authorization";
            const tokenValue = _.isNull(dicomWebServerConfig.WADO.Token) ? null : dicomWebServerConfig.WADO.Token;
            client.setRequestHeader(tokenName, tokenValue);

            client.send();
        }

        // 如果 TOKEN 有數值則加入 自訂的 Loader function，達到可以每張圖片都要 TOKEN 的目的。
        if (!(_.isNull(dicomWebServerConfig.WADO.Token))) {
            wsiSourceXYZ.setTileLoadFunction(customLoader);
        }
        

        const wsiLayer = new LayerTile({
            source: wsiSourceXYZ,
            extent: extent
        });

        const tileDebug = new TileDebug({
            projection: dicomProjection
        });

        const debugLayer = new LayerTile({
            source: tileDebug
        });

        const mousePositionControl = new MousePosition({
            coordinateFormat: createStringXY(0),
        });

        const view = new View({
            center: getCenter(extent),
            zoom: 2,
            minZoom: minLevel,
            maxZoom: maxLevel,
            smoothExtentConstraint: false,
            projection: dicomProjection,
            extent: extent,
            smoothExtentConstraint: false,
            showFullExtent: true,
        });

        const source = new VectorSource({
            wrapX: false
        });
        const vector = new VectorLayer({
            source: source
        });


        const layers = [wsiLayer, debugLayer, ...annVectorLayers, vector];

        const map = new Map({
            target: viewerID,
            controls: [mousePositionControl],
            layers: layers,
            view: view
        });

        // 畫標記
        function addInteraction() {
            let draw = new Draw({
                source: source,
                type: "Point",
            });

            map.addInteraction(draw);
        }
        addInteraction();

    }, [])





    return <>
        <div className="w-100 h-100" id={viewerID}>
        </div>
    </>
}

export default microscopyViewer;