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
import {toast} from "react-toastify";
import {Style, Fill, Stroke, Circle as CircleStyle} from 'ol/style';
import {Icon} from "@iconify/react";
import {getAnnotations} from "../../../lib/dicom-webs/series.js";

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images,annotations, drawType, save,onMessageChange}) => {
    const [loading, setLoading] = useState(true);
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


    const enableDragPan = () => {
        if (mapRef.current) {
            //函数獲取地圖的所有交互（Interactions）。交互包括拖拽、缩放、旋轉等。
            const interactions = mapRef.current.getInteractions();
            const dragPan = interactions.getArray().find(interaction => interaction instanceof DragPan);
            if (dragPan) dragPan.setActive(true);
            const pinchZoom = interactions.getArray().find(interaction => interaction instanceof PinchZoom);
            if (pinchZoom) pinchZoom.setActive(true);
        }
    };


    useEffect(() => {
        if (drawType) {
            if (!mapRef.current) return;
            disableDragPan();

            // 如果当前正在绘制椭圆，则处理椭圆的结束逻辑
            if (isDrawingEllipse) {
                setIsDrawingEllipse(false);
                if (ellipsePreview) {
                    ellipsePreview.setGeometry(null);
                    sourceRef.current.removeFeature(ellipsePreview);
                    setEllipsePreview(null);
                }
                setEllipseCenter(null);
            } else if (isDrawingRectangle) {
                setIsDrawingRectangle(false);
                if (rectanglePreview) {
                    rectanglePreview.setGeometry(null);
                    sourceRef.current.removeFeature(rectanglePreview);
                    setRectanglePreview(null);
                }
                setRectangleCenter(null);
            }

            // 移除当前的绘图交互（如果存在）
            if (drawInteractionRef.current) {
                mapRef.current.removeInteraction(drawInteractionRef.current);
                drawInteractionRef.current = null;
            }

            // 对于椭圆，设置相关状态以启用特殊的椭圆绘图逻辑
            if (drawType === 'Ellipse') {
                setIsDrawingEllipse(true);
            } else if (drawType === 'Rectangle') {
                setIsDrawingRectangle(true);
            } else if (drawType === 'Polygon') {
                const drawInteraction = new Draw({
                    source: sourceRef.current,
                    type: drawType, // 使用选定的绘图类型
                });
                // console.log('drawInteraction', drawInteraction)
                mapRef.current.addInteraction(drawInteraction);
                drawnShapesStack.current.push(drawType);
                drawInteractionRef.current = drawInteraction;
            }

            const moveHandler = (evt) => {
                if (touch) {
                    return
                }
                evt.preventDefault();

                if (!currentFeature) {
                    currentFeature = new Feature();
                    sourceRef.current.addFeature(currentFeature);
                }
                if (evt.dragging) {
                    if (drawType === 'Point') {
                        currentFeature.setGeometry(new Point(evt.coordinate));
                        currentFeature = null;
                    } else if (drawType === 'LineString') {
                        // console.log(currentFeature)
                        currentFeatureCoords.push(evt.coordinate);
                        currentFeature.setGeometry(new LineString(currentFeatureCoords));
                    }
                }
            }

            const mouseUpHandler = (evt) => {
                if (drawType === 'LineString' && currentFeatureCoords.length > 1) {
                    // console.log('currentFeatureCoords', [currentFeatureCoords])
                    currentFeature = null;
                    currentFeatureCoords.length = 0;
                }
            }

            mapRef.current.on('pointermove', moveHandler);
            mapRef.current.on('pointerup', mouseUpHandler);

            if (currentFeature) {
                currentFeature = null;
                currentFeatureCoords.length = 0;
            }

            return () => {
                mapRef.current.un('pointermove', moveHandler);
                mapRef.current.un('pointerup', mouseUpHandler);
            };

        } else if (drawType === null) {
            enableDragPan();
            // 2. 取消當前的繪圖操作
            if (drawInteractionRef.current) {
                currentFeature = null;
                currentFeatureCoords.length = 0;
                mapRef.current.removeInteraction(drawInteractionRef.current);
                drawInteractionRef.current = null; // 移除繪圖交互引用
            }
        }
    }, [drawType]);

    useEffect(() => {
        if (!mapRef.current || !sourceRef.current) return;

        // 如果正在绘制椭圆，添加事件监听
        if (isDrawingEllipse) {
            const newEllipsePreview = new Feature();
            setEllipsePreview(newEllipsePreview);
            sourceRef.current.addFeature(newEllipsePreview);

            const clickHandler = (event) => {
                if (!ellipseCenter) {
                    setEllipseCenter(event.coordinate);
                } else {
                    const radiusX = calculateRadius(event.coordinate, ellipseCenter);
                    const radiusY = radiusX / 2; // 假設Y轴半径为X轴的一半
                    const ellipseCoords = createEllipse(ellipseCenter, radiusX, radiusY);
                    // console.log('[ellipseCoords]', [ellipseCoords])
                    newEllipsePreview.setGeometry(new Polygon([ellipseCoords]));
                    setIsDrawingEllipse(false); // 结束繪製
                    setEllipseCenter(null);
                }
            };

            const moveHandler = (event) => {
                if (ellipseCenter) {
                    const radiusX = calculateRadius(event.coordinate, ellipseCenter);
                    const radiusY = radiusX / 2; // 同上
                    const ellipseCoords = createEllipse(ellipseCenter, radiusX, radiusY);
                    newEllipsePreview.setGeometry(new Polygon([ellipseCoords]));
                }
            };

            mapRef.current.on('singleclick', clickHandler);
            mapRef.current.on('pointermove', moveHandler);
            return () => {
                mapRef.current.un('singleclick', clickHandler);
                mapRef.current.un('pointermove', moveHandler);
                sourceRef.current.removeFeature(newEllipsePreview);
            };
        }


        if (!isDrawingEllipse && ellipsePreview) {
            savedEllipsesSourceRef.current.addFeature(new Feature(ellipsePreview.getGeometry())); // 將橢圓添加到保存圖層
            drawnShapesStack.current.push('ELLIPSE');
            ellipsePreview.setGeometry(null); // 清除預覽圖層中的橢圓
            sourceRef.current.removeFeature(ellipsePreview); // 從原來的圖層中移除
            setEllipsePreview(null); // 重置預覽Feature
        }
    }, [isDrawingEllipse, ellipseCenter]);

    useEffect(() => {
        // 如果正在绘制椭圆，添加事件监听
        if (isDrawingRectangle) {
            const newRectanglePreview = new Feature();
            setRectanglePreview(newRectanglePreview);
            sourceRef.current.addFeature(newRectanglePreview);
            const clickHandler = (event) => {
                if (!rectangleCenter) {
                    setRectangleCenter(event.coordinate);
                } else {
                    const radiusX = calculateRadius(event.coordinate, rectangleCenter);
                    const radiusY = radiusX / 2; // 假设Y轴半径为X轴的一半
                    const rectangleCoords = createRectangle(rectangleCenter, radiusX, radiusY);
                    // console.log('[rectangleCoords]', [rectangleCoords])
                    newRectanglePreview.setGeometry(new Polygon([rectangleCoords]));
                    setIsDrawingRectangle(false); // 结束绘制
                    setRectangleCenter(null); // 重置中心
                }
            };

            const moveHandler = (event) => {
                if (rectangleCenter) {
                    const radiusX = calculateRadius(event.coordinate, rectangleCenter);
                    const radiusY = radiusX / 2; // 同上
                    const rectangleCoords = createRectangle(rectangleCenter, radiusX, radiusY);
                    newRectanglePreview.setGeometry(new Polygon([rectangleCoords]));
                }
            };

            mapRef.current.on('singleclick', clickHandler);
            mapRef.current.on('pointermove', moveHandler);

            return () => {
                mapRef.current.un('singleclick', clickHandler);
                mapRef.current.un('pointermove', moveHandler);
                sourceRef.current.removeFeature(newRectanglePreview);
            };
        }
        if (!isDrawingRectangle && rectanglePreview) {
            savedRectangleSourceRef.current.addFeature(new Feature(rectanglePreview.getGeometry())); // 將橢圓添加到保存圖層
            drawnShapesStack.current.push('RECTANGLE');
            rectanglePreview.setGeometry(null); // 清除預覽圖層中的橢圓
            sourceRef.current.removeFeature(rectanglePreview); // 從原來的圖層中移除
            setRectanglePreview(null); // 重置預覽Feature
        }
    }, [isDrawingRectangle, rectangleCenter]);

    function undoFeature() {
        let features = sourceRef.current.getFeatures();
        switch (drawnShapesStack.current.pop()) {
            case 'ELLIPSE':
                features = savedEllipsesSourceRef.current.getFeatures();
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    savedEllipsesSourceRef.current.removeFeature(lastFeature);
                }
                break;
            case 'RECTANGLE':
                features = savedRectangleSourceRef.current.getFeatures();
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    savedRectangleSourceRef.current.removeFeature(lastFeature);
                }
                break;
            default:
                if (features.length > 0) {
                    const lastFeature = features[features.length - 1];
                    sourceRef.current.removeFeature(lastFeature);
                    // console.log('lastFeature', lastFeature)
                    if (drawType && currentFeature) {
                        currentFeature = new Feature();
                        sourceRef.current.addFeature(currentFeature);
                        currentFeatureCoords.length = 0;
                    }
                }
        }
    }

    function calculateRadius(coord1, coord2) {
        return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
    }

    function createRectangle(center, width, height, rotation = 0) {
        let halfWidth = width / 2;
        let halfHeight = height / 2;
        let cosRotation = Math.cos(rotation);
        let sinRotation = Math.sin(rotation);

        let topLeft = [
            center[0] - halfWidth * cosRotation - halfHeight * sinRotation,
            center[1] - halfWidth * sinRotation + halfHeight * cosRotation
        ];

        let topRight = [
            center[0] + halfWidth * cosRotation - halfHeight * sinRotation,
            center[1] + halfWidth * sinRotation + halfHeight * cosRotation
        ];

        let bottomRight = [
            center[0] + halfWidth * cosRotation + halfHeight * sinRotation,
            center[1] + halfWidth * sinRotation - halfHeight * cosRotation
        ];

        let bottomLeft = [
            center[0] - halfWidth * cosRotation + halfHeight * sinRotation,
            center[1] - halfWidth * sinRotation - halfHeight * cosRotation
        ];

        return [topLeft, topRight, bottomRight, bottomLeft]; // 確保長方形閉合
    }

    function createEllipse(center, semiMajor, semiMinor, rotation = 0, sides = 50) {
        let angleStep = (2 * Math.PI) / sides;
        let coords = [];

        for (let i = 0; i < sides; i++) {
            let angle = i * angleStep;
            let x = center[0] + semiMajor * Math.cos(angle) * Math.cos(rotation) - semiMinor * Math.sin(angle) * Math.sin(rotation);
            let y = center[1] + semiMajor * Math.cos(angle) * Math.sin(rotation) + semiMinor * Math.sin(angle) * Math.cos(rotation);
            coords.push([x, y]);
        }
        coords.push(coords[0]); // Ensure the ellipse is closed

        return coords;
    }

    useEffect(() => {
        if (save === false) return;
        const features = sourceRef.current.getFeatures();

        function CustomShape(type, feature) {
            this.type = type;
            this.feature = feature;
        }

        const rectanglesFeatures = savedRectangleSourceRef.current.getFeatures();
        features.push(...rectanglesFeatures.map(feature => new CustomShape('RECTANGLE', feature)));

        const ellipsesFeatures = savedEllipsesSourceRef.current.getFeatures();
        features.push(...ellipsesFeatures.map(feature => new CustomShape('ELLIPSE', feature)));

        const formatCoordinate = (coord) => {
            return [parseFloat(coord[0].toFixed(1)), parseFloat(coord[1].toFixed(1))];
        };

        const savedAnnotations = features.map(feature => {
            let type = null;
            let coordinates = [];

            if (feature instanceof CustomShape) {
                type = feature.type;
                feature = feature.feature;
            }

            // 获取几何类型和坐标
            const geometry = feature.getGeometry();
            if (geometry instanceof Point) {
                type = "POINT";
                let coords = geometry.getCoordinates();
                // 修改 y 轴坐标
                coords[1] *= -1;
                coordinates.push(formatCoordinate(coords));
            } else if (geometry instanceof Polygon) {
                type ??= "POLYGON";
                let coords = geometry.getCoordinates()[0].map(coord => formatCoordinate(coord));
                if (type === 'ELLIPSE') {
                    coords = calculateExtremityPoints(coords);
                    const points = coords.map(coord => coord.replace(/[()]/g, '').split(',').map(Number));
                    // console.log("points", points)
                    // 修改 y 轴坐标
                    coordinates = points.map(coord => {
                        coord[1] *= -1;
                        return coord;
                    });
                } else {
                    // 修改 y 轴坐标
                    coordinates = coords.map(coord => {
                        coord[1] *= -1;
                        return coord;
                    });
                }

            } else if (geometry instanceof LineString) {
                type = "POLYLINE";
                coordinates = geometry.getCoordinates().map(coord => {
                    // 修改 y 轴坐标
                    coord[1] *= -1;
                    return formatCoordinate(coord);
                });
            }

            return {type, coordinates: coordinates.map(coord => `(${coord[0].toFixed(1)}, ${coord[1].toFixed(1)})`)};
        }).filter(annotation => annotation.type !== null);

        const groupedAnnotations = Object.values(savedAnnotations.reduce((acc, curr) => {
            if (acc[curr.type]) {
                acc[curr.type].coordinates = acc[curr.type].coordinates.concat(curr.coordinates);
            } else {
                acc[curr.type] = {type: curr.type, coordinates: curr.coordinates};
            }
            return acc;
        }, {}));

        // console.log('Grouped Annotations:', groupedAnnotations);

        function extractStudyAndSeriesIdsFromUrl(url) {
            const parsedUrl = new URL(url);
            const studyUid = parsedUrl.searchParams.get('studyUid');
            const seriesUid = parsedUrl.searchParams.get('seriesUid');

            return {studyUid, seriesUid};
        }

        const currentUrl = window.location.href;
        const ids = extractStudyAndSeriesIdsFromUrl(currentUrl);
        if (ids) {
            const studyUid = ids.studyUid;
            const seriesUid = ids.seriesUid;
            const formattedData = {
                NewAnnSeries: newAnnSeries ? "true" : "false",
                OldAnnSeriesOID: seriesUid,
                NewAnnAccession: newAnnAccession ? "true" : "false",
                AccessionNumber: accessionNumber,
                data: savedAnnotations // 原有的转换逻辑
            };
            const formattedDataJson = JSON.stringify(formattedData);
            // 使用 formattedData 作为请求体
            fetch(`http://127.0.0.1:5000/SaveAnnData/studies/${studyUid}/series/${seriesUid}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formattedData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                        toast.error("發生未知錯誤")
                    }
                    toast.success("上傳成功")
                    return response.json();
                })
                .then(data => {
                    console.log('API response:', data);
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        } else {
            console.error("Failed to extract study and series IDs from URL");
            toast.error("發生未知錯誤")
        }
    }, [save]);

    const disableDragPan = () => {
        if (mapRef.current) {
            //函数獲取地圖的所有交互（Interactions）。交互包括拖拽。
            const interactions = mapRef.current.getInteractions();
            //DragPan 是 OpenLayers 中負責處理地圖拖拽行為
            const dragPan = interactions.getArray().find(interaction => interaction instanceof DragPan);
            // const pinchZoom = interactions.getArray().find(interaction => interaction instanceof PinchZoom);
            // if (pinchZoom) pinchZoom.setActive(false);
            if (dragPan) dragPan.setActive(false);
        }
    };

    const mapRef = useRef(null);


    const getRandomColor = () => {
        const letters = '0123456789ABCEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };


    useEffect(() => {
        const fetchData = async () => {
            if (images.length === 0) {
                setLoading(false);
                return;
            }
            setLoading(true);
            console.log("annotationsViewer", annotations)
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
                                    source: layer.getSource() ?? undefined , // 確保使用相同的圖層源，或者提供一個替代方案
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

                {annotations.map((annotation) => {

                    computeAnnotationFeatures(annotation, resolutions)
                    .then((features) => {
                        const color = getRandomColor(); // 为当前图层生成一个随机颜色
                        console.log("features", features)
                        if (features.length > 0) {
                            const style = new Style({
                                stroke: new Stroke({
                                    color: color,
                                    width: 1
                                })
                            });

                            const source = new VectorSource({features});
                            const newLayer = new VectorLayer({source,extent, style});
                            newLayer.setVisible(false);
                            mapRef.current.addLayer(newLayer);

                        }else{
                            return
                        }
                        onMessageChange(mapRef.current.getLayers());
                    })
                    .catch((error) => {
                        setErrorMessage('Failed to load annotations.');
                        console.error(error);
                    })
                    .finally(() => setLoading(false));
                })}

                mapRef.current.getView().fit(extent, {size: mapRef.current.getSize()});
            } catch (error) {
                setErrorMessage('Unexpected error occurred.');
                setLoading(false);
                console.error('error:', error);
            }
        };
        if (images) fetchData();
    }, [images, annotations]);


    return (
        <div className={`relative w-full flex grow ${loading ? 'loading' : ''}`}>
            <div id="ViewerID" className="h-full w-full"/>
            <div className={`absolute inset-0 z-10 flex items-end justify-center  ${!loading ? 'hidden' : ''}`}>
                {/*<span className="loader border-green-500"/>*/}

                {/*<Icon icon="svg-spinners:12-dots-scale-rotate" width="24" height="24" />*/}
                {/*<div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-300 ${loading ? 'bottom-2' : '-bottom-8'}`}>*/}
                {/*    <div className="flex items-center gap-3 rounded-full border bg-white/75 px-2 py-1 text-xs shadow">*/}
                {/*        /!*<span className="loader h-4 w-4 border-2 border-green-500"/>*!/*/}
                {/*        <Icon icon="svg-spinners:12-dots-scale-rotate" width="28" height="28" className="text-green-400" />*/}
                {/*        <p className="text-lg">Loading Annotations...</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
            <div
                className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                <p>{errorMessage}</p>
            </div>
        </div>
    );
};

function calculateExtremityPoints(coordinates) {
    // const points = coordinates.map(coord => coord.replace(/[()]/g, '').split(',').map(Number));
    // console.log("coordinates", coordinates)
    const points = coordinates
    // console.log("points", points)

    // Encapsulated helper function to estimate the center of the ellipse
    function estimateCenter(points) {
        let sumX = 0, sumY = 0;

        points.forEach(point => {
            sumX += point[0];
            sumY += point[1];
        });

        return [sumX / points.length, sumY / points.length];
    }

    // Encapsulated helper function to calculate the distance between two points
    function distance(point1, point2) {
        return Math.sqrt((point1[0] - point2[0]) ** 2 + (point1[1] - point2[1]) ** 2);
    }

    // Estimate the center of the ellipse
    const center = estimateCenter(points);

    // Find the farthest and closest points to the center to estimate the axes
    let maxDist = 0;
    let minDist = Infinity;
    points.forEach(point => {
        const dist = distance(center, point);
        if (dist > maxDist) maxDist = dist;
        if (dist < minDist) minDist = dist;
    });

    // Assuming the farthest point approximates the semi-major axis
    // and the closest point approximates the semi-minor axis
    const semiMajorAxisLength = maxDist;
    const semiMinorAxisLength = minDist;

    // Calculate extremity points without considering rotation
    // A more complex fitting method would be required to handle rotation properly
    const extremities = {
        majorAxis: [[center[0] - semiMajorAxisLength, center[1]], [center[0] + semiMajorAxisLength, center[1]]],
        minorAxis: [[center[0], center[1] - semiMinorAxisLength], [center[0], center[1] + semiMinorAxisLength]]
    };

    return [...extremities.majorAxis, ...extremities.minorAxis].map(point => `(${point[0]}, ${point[1]})`);
}

MicroscopyViewer.propTypes = {
    // baseUrl: PropTypes.string.isRequired,
    // studyUid: PropTypes.string.isRequired,
    // seriesUid: PropTypes.string.isRequired,
    // images: PropTypes.array.isRequired,
    // annotations: PropTypes.array.isRequired,
    baseUrl: PropTypes.string,
    studyUid: PropTypes.any,
    seriesUid: PropTypes.any,
    images: PropTypes.any,
    annotations: PropTypes.any,

};

export default MicroscopyViewer;
