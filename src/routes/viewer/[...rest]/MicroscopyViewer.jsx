import React, {useContext, useEffect, useRef, useState} from 'react';
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
import Map from 'ol/Map.js';
import MousePosition from 'ol/control/MousePosition.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {computeAnnotationFeatures} from '../../../lib/microscopy-viewers/annotation';
import {computePyramidInfo} from '../../../lib/microscopy-viewers/pyramid';
import {Fill, Stroke, Style} from 'ol/style';
import Draw from 'ol/interaction/Draw.js';
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import {Polygon} from "ol/geom";
import {createBox} from "ol/interaction/Draw.js";
import CircleStyle from "ol/style/Circle.js";

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images, Loading, layers, NewSeriesInfo}) => {
    const [newSeriesInfo, setNewSeriesInfo] = NewSeriesInfo
    const {status} = newSeriesInfo;
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [layer, setLayer] = layers;
    const mapRef = useRef(null);
    const [loading, setLoading] = Loading;
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext)


    useEffect(() => {
        const fetchData = async () => {
            if (images.length === 0) return;
            try {
                const {
                    extent,
                    layer,
                    resolutions,
                    view,
                    PixelSpacings
                } = computePyramidInfo(baseUrl, studyUid, seriesUid, images);
                const viewerElement = document.getElementById("ViewerID");
                while (viewerElement.firstChild) {
                    viewerElement.removeChild(viewerElement.firstChild);
                }

                const controls = [
                    ...defaultControls().getArray(),
                    new MousePosition({
                        wrapX: false,
                        coordinateFormat: (c) => c ? `(${c[0].toFixed(2)}, ${-c[1].toFixed(2)})` : '',
                        className: 'absolute left-auto right-0 m-2 rounded-sm bg-white/75 px-1 py-0.5 text-xs font-medium',
                    }),
                    new OverviewMap({
                        collapsed: false,
                        layers: [new TileLayer({source: layer.getSource()})],
                    }),
                    ...(PixelSpacings ? [new ScaleLine({units: 'metric', className: 'ol-scale-line'})] : []),
                    new ScaleLine(),
                    new FullScreen(),
                    new Rotate(),
                    new ZoomSlider(),
                    new ZoomToExtent(),
                    new Zoom(),
                    new Attribution(),
                ];

                mapRef.current = new Map({
                    controls,
                    target: "ViewerID",
                    layers: [layer],
                    view,
                });

                mapRef.current.on('loadstart', () => setLoading(true));
                mapRef.current.on('loadend', () => setLoading(false));
                mapRef.current.getView().fit(extent, {size: mapRef.current.getSize()});
                let tempLayer = {}
                Object.keys(annotationList).map(async (key) => {
                    const {
                        features,
                        groups,
                        seriesUid
                    } = await computeAnnotationFeatures(annotationList[key], resolutions);
                    const annotationGroup = Object.values(groups);

                    features.forEach((feature, index) => {
                        if (feature.length > 0) {
                            const groupColor = getRandomColor();
                            const fill = groups.graphicType === "POLYGON" ?
                                new Fill({color: lightenColor(groupColor)}) : undefined;

                            const style = new Style({
                                stroke: new Stroke({
                                    color: groupColor,
                                    width: 1,
                                }),
                                fill,
                            });
                            setAnnotationList(prevAnnotations => ({
                                ...prevAnnotations,
                                [key]: [
                                    {
                                        ...prevAnnotations[key][0],
                                        group: {
                                            ...prevAnnotations[key][0].group,
                                            [annotationGroup[index].groupUid]: {
                                                ...prevAnnotations[key][0].group[annotationGroup[index].groupUid],
                                                color: groupColor,
                                            }
                                        }
                                    }
                                ]
                            }));
                            const source = new VectorSource({wrapX: false, features: feature});
                            const newLayer = new VectorLayer({source, extent, style});
                            newLayer.setVisible(false);
                            mapRef.current.addLayer(newLayer)
                            tempLayer = {
                                ...tempLayer,
                                [seriesUid]: {
                                    ...(tempLayer[seriesUid] || {}),
                                    [annotationGroup[index].groupUid]: newLayer
                                }
                            }

                        }
                    });
                    setLayer(tempLayer);
                });
            } catch (error) {
                setErrorMessage('Failed to load image.');
                console.error(error);
            }
        };


        fetchData();
    }, [baseUrl, studyUid, seriesUid, images]);


    useEffect(() => {
        console.log("updatedAnnotationList", annotationList)
    }, [annotationList]);


    useEffect(() => {
        createNewAnnotation(mapRef, NewSeriesInfo, layers, setAnnotationList)
    }, [status])


    return (
        <div id="ViewerID" className={`relative w-full flex grow bg-gray-100`}>
            {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-t-primary border-b-green-400 rounded-full animate-spin"/>
                </div>
            ) : (
                <>
                    <div className="h-full w-full"/>
                    <div
                        className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                        <p>{errorMessage}</p>
                    </div>
                </>
            )}
        </div>
    );
};

const createNewAnnotation = (mapRef, NewSeriesInfo, layers, setAnnotationList) => {
    const [newSeriesInfo, setNewSeriesInfo] = NewSeriesInfo;
    const {action, name, status, type, annSeriesUid, annGroupUid, smSeriesUid} = newSeriesInfo;
    const [layer, setLayer] = layers;
    if (mapRef.current === null || NewSeriesInfo === undefined) return;
    if (status === false) return;
    // 移除所有互動
    mapRef.current.getInteractions().getArray().forEach(interaction => {
        mapRef.current.removeInteraction(interaction);
    });

    const graphicType = {
        'POINT': {type: 'Point'},
        'POLYLINE': {type: 'LineString'},
        'POLYGON': {type: 'Polygon'},
        'ELLIPSE': {type: 'Circle', function: createEllipse()},
        'RECTANGLE': {type: 'Circle', function: createBox()}
    }

    if (action === 'update') {
        const groupColor = getRandomColor();
        const lightColor = lightenColor(groupColor);
        const fill = type === "POLYGON" ? new Fill({color: lightenColor(groupColor)}) : undefined;
        const image = type === "POINT" ?
            new CircleStyle({
            radius: 5,
            fill: new Fill({color: lightColor}),
            stroke: new Stroke({color: groupColor, width: 2})
        }) :
        new CircleStyle({
            radius: 5,
            fill: new Fill({color: groupColor})})

        const style = new Style({
            stroke: new Stroke({
                color: groupColor,
                width: 1,
            }),
            fill,
            image
        });
        const source = new VectorSource({wrapX: false});
        const newLayer = new VectorLayer({source, style});
        const draw = new Draw({
            source: source,
            type: graphicType[type].type,
            geometryFunction: graphicType[type].function,
            freehand: true,
            style: style
        });
        newLayer.setVisible(true);
        mapRef.current.addLayer(newLayer)
        mapRef.current.addInteraction(draw);
        const date = new Date();
        const month = date.getMonth() + 1;
        const formattedMonth = month < 10 ? `0${month}` : month;
        const SeriesUiddate = `${date.getFullYear()}${formattedMonth}${date.getDate()}${date.getHours()}${date.getMinutes()}${date.getSeconds()}`;

        if (name === 'addSeries') {
            console.log("add series")
            setLayer({
                ...layer,
                [annSeriesUid]: {
                    ...(layer[annSeriesUid] || {}),
                    [SeriesUiddate]: newLayer
                }
            });

            setAnnotationList((prevAnnotationList) => {
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [{
                        accessionNumber: SeriesUiddate,
                        editable: true,
                        group: {
                            [SeriesUiddate]: {
                                color: groupColor,
                                dicomJson: {},
                                graphicType: type,
                                groupGenerateType: "auto",
                                groupName: "Group 1",
                                groupUid: SeriesUiddate,
                                indexesData: {},
                                modality: "ANN",
                                pointsData: {},
                                seriesUid: annSeriesUid,
                                visible: true
                            }
                        },
                        referencedInstanceUID: smSeriesUid,
                        seriesUid: annSeriesUid,
                        status: true
                    }]
                };
            });
        } else if (name === 'addGroup') {
            setAnnotationList((prevAnnotationList) => {
                const num = Object.keys(prevAnnotationList[annSeriesUid][0].group).length + 1;
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [
                        {
                            ...prevAnnotationList[annSeriesUid][0],
                            group: {
                                ...prevAnnotationList[annSeriesUid][0].group,
                                [SeriesUiddate]: {
                                    color: groupColor,
                                    dicomJson: {},
                                    graphicType: type,
                                    groupGenerateType: "auto",
                                    groupName: `Group ${num}`,
                                    groupUid: SeriesUiddate,
                                    indexesData: {},
                                    modality: "ANN",
                                    pointsData: {},
                                    seriesUid: annSeriesUid,
                                    visible: true
                                }
                            }
                        }
                    ]
                };
            });
            setLayer((prevLayers) => {
                return {
                    ...prevLayers,
                    [annSeriesUid]: {
                        ...prevLayers[annSeriesUid],
                        [SeriesUiddate]: newLayer
                    }
                };
            })
        } else if (name === 'currentDraw') {
            const existingLayer = layer[annSeriesUid];
            const selectedLayer = existingLayer[annGroupUid];
            const selectedStyle = selectedLayer.getStyle();

            const selectedDraw = new Draw({
                source: selectedLayer.getSource(),
                type: graphicType[type].type,
                geometryFunction: graphicType[type].function,
                freehand: true,
                style: selectedStyle
            });

            setAnnotationList((prevAnnotationList) => {
                layer[annSeriesUid][annGroupUid].setVisible(true);
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [
                        {
                            ...prevAnnotationList[annSeriesUid][0],
                            group: {
                                ...prevAnnotationList[annSeriesUid][0].group,
                                [annGroupUid]: {
                                    ...prevAnnotationList[annSeriesUid][0].group[annGroupUid],
                                    visible: true,
                                },
                            },
                        },
                    ],
                };
            })

            mapRef.current.addInteraction(selectedDraw);
        } else {
            return
        }
    } else if (action === 'delete') {
        if (name === 'deleteSeries') {
            mapRef.current.getInteractions().getArray().forEach(interaction => {
                mapRef.current.removeInteraction(interaction);
            });
            const existingLayer = layer[annSeriesUid];
            Object.keys(existingLayer).map((key) => {
                mapRef.current.removeLayer(existingLayer[key]);
            });
            setAnnotationList((prevAnnotationList) => {
                delete prevAnnotationList[annSeriesUid];
                return prevAnnotationList;
            });
            setLayer((prevLayers) => {
                delete prevLayers[annSeriesUid];
                return prevLayers;
            });
        } else if (name === 'deleteGroup') {
            mapRef.current.getInteractions().getArray().forEach(interaction => {
                mapRef.current.removeInteraction(interaction);
            });
            const existingLayer = layer[annSeriesUid];
            const selectedLayer = existingLayer[annGroupUid];
            mapRef.current.removeLayer(selectedLayer);
            setAnnotationList((prevAnnotationList) => {
                const group = prevAnnotationList[annSeriesUid][0].group;
                delete group[annGroupUid];
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [
                        {
                            ...prevAnnotationList[annSeriesUid][0],
                            group,
                        },
                    ],
                };
            });
        } else {
            return;
        }
    }
    console.log("mapRef", mapRef.current.getLayers().getArray())
    setNewSeriesInfo({name: '', status: false, type: '', annSeriesUid: ''});
}


const createEllipse = () => {
    return (coordinates, geometry) => {
        if (!geometry) {
            geometry = new Polygon([]);
        }

        const [center, end] = coordinates;
        const radiusX = Math.abs(end[0] - center[0]);
        const radiusY = Math.abs(end[1] - center[1]);
        const numPoints = 64;
        const angleStep = (2 * Math.PI) / numPoints;
        const ellipseCoords = [];

        for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const x = center[0] + radiusX * Math.cos(angle);
            const y = center[1] + radiusY * Math.sin(angle);
            ellipseCoords.push([x, y]);
        }

        ellipseCoords.push(ellipseCoords[0]); // close the polygon

        geometry.setCoordinates([ellipseCoords]);
        return geometry;
    };
};

function calculateEllipsePoints(points) {
    const [highest, lowest, leftmost, rightmost] = points;

    // Calculate semi-major axis (a) and semi-minor axis (b)
    const a = Math.sqrt((rightmost[0] - leftmost[0]) ** 2 + (rightmost[1] - leftmost[1]) ** 2) / 2;
    const b = Math.sqrt((highest[0] - lowest[0]) ** 2 + (highest[1] - lowest[1]) ** 2) / 2;

    // Determine the center (h, k) of the ellipse
    const h = (leftmost[0] + rightmost[0]) / 2;
    const k = (highest[1] + lowest[1]) / 2;

    // Estimate the rotation angle theta
    // Assuming the major axis is closer to the line connecting highest and lowest points
    const theta = Math.atan2(rightmost[1] - leftmost[1], rightmost[0] - leftmost[0]);

    // Calculate 50 evenly distributed points along the ellipse
    const pointsOnEllipse = [];
    for (let i = 0; i < 50; i++) {
        const t = (2 * Math.PI * i) / 50;
        const xPrime = a * Math.cos(t) * Math.cos(theta) - b * Math.sin(t) * Math.sin(theta) + h;
        const yPrime = a * Math.cos(t) * Math.sin(theta) + b * Math.sin(t) * Math.cos(theta) + k;
        pointsOnEllipse.push([xPrime, yPrime]);
    }

    return pointsOnEllipse;
}

function lightenColor(color) {
    const [r, g, b] = color.match(/\d+/g).map(Number);
    const opacity = 0.2;
    const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
    return rgbaColor;
}

export const getRandomColor = () => {
    let color = 'rgba(';
    for (let i = 0; i < 3; i++) {
        let component = Math.floor(Math.random() * 256);
        color += component;
        if (i < 2) color += ', ';
    }
    color += ', 1)';
    return color;
};
export default MicroscopyViewer;
