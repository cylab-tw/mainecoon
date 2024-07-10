import React, {useEffect, useRef, useState} from 'react';
import 'ol/ol.css';
import {
    Attribution,
    defaults as defaultControls,
    FullScreen,
    OverviewMap,
    Rotate,
    ScaleLine,
    Zoom,
    ZoomSlider,
    ZoomToExtent
} from 'ol/control';
import {Map} from 'ol';
import MousePosition from 'ol/control/MousePosition.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {computeAnnotationFeatures} from '../../../lib/microscopy-viewers/annotation';
import {computePyramidInfo} from '../../../lib/microscopy-viewers/pyramid';
import PropTypes from 'prop-types';
import {DragPan, Draw, PinchZoom} from "ol/interaction";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Polygon from "ol/geom/Polygon";
import LineString from "ol/geom/LineString";
import convert from 'color-convert';
import {toast} from "react-toastify";
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import {MultiPoint} from "ol/geom";

const MicroscopyViewer = ({
                              baseUrl,
                              studyUid,
                              seriesUid,
                              images,
                              annotations,
                              group,
                              drawType,
                              drawColor,
                              save,
                              undoState,
                              onMessageChange,
                              layers
                          }) => {
    const [errorMessage, setErrorMessage] = useState(undefined);
    let touch = false;
    let currentFeature = null;
    const [isDrawingEllipse, setIsDrawingEllipse] = useState(false);
    const [ellipseCenter, setEllipseCenter] = useState(null);
    const [ellipsePreview, setEllipsePreview] = useState(null);
    const [isDrawingRectangle, setIsDrawingRectangle] = useState(false);
    const [rectangleCenter, setRectangleCenter] = useState(null);
    const [rectanglePreview, setRectanglePreview] = useState(null);
    const drawInteractionRef = useRef(null);
    const currentFeatureCoords = [];
    const sourceRef = useRef(new VectorSource({wrapX: false}));
    const drawnShapesStack = useRef([]);
    const savedEllipsesSourceRef = useRef(new VectorSource({wrapX: false}));
    const savedRectangleSourceRef = useRef(new VectorSource({wrapX: false}));
    const [newAnnSeries, setNewAnnSeries] = useState(false);
    const [newAnnAccession, setNewAnnAccession] = useState(false);
    const [accessionNumber, setAccessionNumber] = useState('');
    const [groupName, setGroupName] = group;
    const [undo, setUndo] = undoState;
    const [layer, setLayer] = layers;
    const mapRef = useRef(null);
    const [color, setColor] = useState([]);

    function lightenColor(color) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const opacity = 0.2;
        const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        return rgbaColor;
    }

    useEffect(() => {
        const fetchData = async () => {
            if (images.length === 0) return;
            const ViewerID = "ViewerID";
            try {
                const {extent, layer, resolutions, view} =
                    computePyramidInfo(baseUrl, studyUid, seriesUid, images);
                document.getElementById(ViewerID).innerHTML = '';
                const vector = new VectorLayer({source: sourceRef.current});
                const savedEllipsesLayer = new VectorLayer({
                    source: savedEllipsesSourceRef.current
                });
                const savedRectangleLayer = new VectorLayer({
                    source: savedRectangleSourceRef.current
                });
                mapRef.current = new Map({
                    controls: defaultControls().extend([
                        new MousePosition({
                            coordinateFormat: (c) => (c ? `${c[0].toFixed(2)}, ${-c[1].toFixed(2)}` : ''),
                            className: 'm-1.5 text-center text-sm ',
                        }),
                        new OverviewMap({
                            collapsed: false,
                            collapseLabel: '\u00AB',
                            label: '\u00BB',
                            layers: [
                                new TileLayer({
                                    source: layer.getSource() ?? undefined, // 確保使用相同的圖層源，或者提供一個替代方案
                                })
                            ],
                            tipLabel: 'Overview Map'
                        }),
                        new ScaleLine(),
                        new FullScreen(),
                        new Rotate(),
                        new ZoomSlider(),
                        new ZoomToExtent(),
                        new Zoom(),
                        new Attribution()
                    ]),
                    // target: 'map',
                    target: ViewerID,
                    layers: [layer, vector, savedEllipsesLayer, savedRectangleLayer],
                    view,
                });

                {
                    annotations.map((annotation) => {
                        computeAnnotationFeatures(annotation, resolutions)
                            .then(({features0, annGroupName0}) => {
                                groupName.push(annGroupName0)
                                features0.map((feature) => {
                                    const color1 = getRandomColor();
                                    color.push(color1)


                                    if (feature.length > 0) {
                                        let fill;
                                        if (annotation[0].graphicType === "POLYGON") {
                                            fill = new Fill({
                                                color: lightenColor(color1)
                                            });
                                        }

                                        const style = new Style({
                                            stroke: new Stroke({
                                                color: color1,
                                                width: 1
                                            }),
                                            fill: fill
                                        });

                                        const source = new VectorSource({features: feature});
                                        const newLayer = new VectorLayer({source, extent, style});
                                        newLayer.setVisible(false);
                                        mapRef.current.addLayer(newLayer);

                                    } else {
                                        return
                                    }
                                })
                                onMessageChange(mapRef.current.getLayers());
                                setLayer(mapRef.current.getLayers());

                            })
                            .catch((error) => {
                                setErrorMessage('Failed to load annotations.');
                                console.error(error);
                            })
                    })
                }
                mapRef.current.getView().fit(extent, {size: mapRef.current.getSize()});
            } catch (error) {
                setErrorMessage('Unexpected error occurred.');
                console.error('error:', error);
            }
        };

        if (images) fetchData();
    }, [images, annotations]);

    const getRandomColor = () => {
        let color = 'rgba(';
        for (let i = 0; i < 3; i++) {
            let component = Math.floor(Math.random() * 256);
            color += component;
            if (i < 2) color += ', ';
        }
        color += ', 1)';
        return color;
    };


    return (
        <div className={`relative w-full flex grow`}>
            <div id="ViewerID" className="h-full w-full"/>
            <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                <p>{errorMessage}</p>
            </div>
        </div>
    );
};

export default MicroscopyViewer;
