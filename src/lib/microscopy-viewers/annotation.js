import {LineString, MultiLineString, MultiPoint, MultiPolygon, Polygon} from 'ol/geom';
import {Feature} from 'ol';
import {multipartDecode} from '../utils/multipart';
import {Fill, Stroke, Style} from "ol/style.js";
import VectorSource from "ol/source/Vector.js";
import VectorLayer from "ol/layer/Vector.js";
import {createBox} from "ol/interaction/Draw.js";
import CircleStyle from "ol/style/Circle.js";
import {Draw, Snap} from "ol/interaction.js";
import {DicomTags as DicomTag} from "../dicom-webs/index.js";
import {generateGroupUID} from "../search/index.js";

const decodeData = (encodedData, vr) => {
    let buffer;
    if (!encodedData) {
        return null
    }
    if (typeof encodedData === 'string') {
        const decodedData = atob(encodedData);

        const byteArray = new Uint8Array(decodedData.length);
        for (let i = 0; i < decodedData.length; i++) {
            byteArray[i] = decodedData.charCodeAt(i);
        }

        buffer = byteArray.buffer;
    } else {
        buffer = encodedData[0];
    }

    switch (vr) {
        case 'OL':
            return new Uint32Array(buffer);
        case 'OF':
            return new Float32Array(buffer);
        case 'OD':
            return new Float64Array(buffer);
        default:
            return new TextDecoder().decode(buffer);
    }
}

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

export const computeAnnotationFeatures = async (annotations, resolutions) => {
    const features = [];
    let groups;
    console.log("123annotations", annotations);
    if (Object.keys(annotations).length === 0) return {features, groups};
    const {group, referencedInstanceUID, seriesUid} = annotations[0];

    const referencedResolution = resolutions.find(res => res.instanceUID === referencedInstanceUID)?.resolution || resolutions[resolutions.length - 1].resolution;

    let points, indexes;
    let centerCoordinatesArray = [];
    await Promise.all(Object.keys(group).map(async (key) => {
        let pointCoordinatesData = group[key].dicomJson[DicomTag.PointCoordinatesData];
        pointCoordinatesData ??= group[key].dicomJson[DicomTag.DoublePointCoordinatesData];
        const pointIndexList = group[key].dicomJson[DicomTag.LongPrimitivePointIndexList]
        const graphicType = group[key].dicomJson[DicomTag.GraphicType].Value[0];
        const feature = [];

        if (pointCoordinatesData.InlineBinary) {
            points = decodeData(pointCoordinatesData.InlineBinary, pointCoordinatesData.vr);
        } else if (pointCoordinatesData.BulkDataURI) {
            const response = await fetch(pointCoordinatesData.BulkDataURI);
            const vr = pointCoordinatesData.vr === 'UR' ? 'OF' : pointCoordinatesData.vr;
            points = decodeData(multipartDecode(await response.arrayBuffer()), vr);
        }

        if (pointIndexList) {
            if (pointIndexList.InlineBinary) {
                indexes = decodeData(pointIndexList.InlineBinary, pointIndexList.vr);
            } else if (pointIndexList.BulkDataURI) {
                const response = await fetch(pointIndexList.BulkDataURI);
                const vr = pointIndexList.vr === 'UR' ? 'OL' : pointIndexList.vr;
                indexes = decodeData(multipartDecode(await response.arrayBuffer()), vr);
            }
        }

        indexes = indexes?.map(index => index - 1);
        points = points?.map(point => point * referencedResolution*1.00000005);

        if (!points || points.length === 0) {
            console.warn('Missing points data for graphic type:', group[key].graphicType);
            return;
        }
        if (indexes && indexes.length === 0) {
            console.warn('Missing indexes data for graphic type:', group[key].graphicType);
        }

        const coordinates = [];
        let hasNegativeCoordinates = false;

        for (let i = 0; i < points.length; i += 2) {
            // coordinates.push([points[i]+825, -points[i + 1]+2765]);
            coordinates.push([points[i], -points[i + 1]]);
        }

        let shapesCoordinates = []; // 原來的 `test`
        let centerCoordinates = []; // 原來的 `tempCenter`

        const calculateCenter = (coordinates) => {
            let maxX = -Infinity, maxY = -Infinity, minX = Infinity, minY = Infinity;
            coordinates.forEach(([x, y]) => {
                maxX = Math.max(maxX, Math.abs(x));
                minX = Math.min(minX, Math.abs(x));
                maxY = Math.max(maxY, Math.abs(y));
                minY = Math.min(minY, Math.abs(y));
            });

            const centerX = (maxX + minX) / 2;
            const centerY = (maxY + minY) / 2;
            return [centerX, -centerY];
        };

        if (['POLYLINE', 'POLYGON'].includes(graphicType)) {
            for (let i = 0; i < indexes?.length; i++) {
                let index = indexes[i];
                let index2 = indexes[i + 1] || points.length;
                let shape = [];

                for (let j = index; j < index2; j += 2) {
                    shape.push([points[j], -points[j + 1]]);
                }

                shapesCoordinates.push(shape);
                centerCoordinates.push(calculateCenter(shape));
            }

            centerCoordinatesArray.push(centerCoordinates);
        } else if (['ELLIPSE', 'RECTANGLE'].includes(graphicType)) {
            for (let i = 0; i < points.length; i += 8) {
                const coords = [];
                for (let j = i; j < i + 8; j += 2) {
                    coords.push([points[j], points[j + 1]]);
                }
                centerCoordinates.push(calculateCenter(coords));
            }

            centerCoordinatesArray.push(centerCoordinates);
        } else if (graphicType === 'POINT') {
            for (let i = 0; i < points.length; i += 2) {
                centerCoordinates.push([points[i], -points[i + 1]]);
            }
            console.log(`${graphicType}`, centerCoordinates);
            centerCoordinatesArray.push(centerCoordinates);
        }

        if (hasNegativeCoordinates) {
            console.warn('Detected negative coordinates, some annotations may be out of bounds.');
        }

        if ((group[key].graphicType === 'POLYLINE' || group[key].graphicType === 'POLYGON') && !indexes) {
            console.warn('Missing indexes data for graphic type:', group[key].graphicType);
        }


        switch (group[key].graphicType) {
            case 'POINT':
                feature.push(new Feature({geometry: new MultiPoint(coordinates)}));
                break;
            case 'POLYLINE':
                handlePolylineFeature(feature, coordinates, indexes);
                break;
            case 'POLYGON':
                handlePolygonFeature(feature, coordinates, indexes);
                break;
            case 'ELLIPSE':
                handleEllipseFeature(feature, coordinates);
                break;
            case 'RECTANGLE':
                handleRectangleFeature(feature, coordinates);
                break;
            default:
                console.error('Unrecognized graphic type:', group[key].graphicType);
        }
        features.push(feature);
    }));
    return {features, group, seriesUid,centerCoordinatesArray};
};


const handlePolylineFeature = (feature, coordinates, indexes) => {
    let lineStringCoords = [];
    for (let i = 0; i < indexes.length; i++) {
        const coord = coordinates.slice(indexes[i], indexes[i + 1] || coordinates.length);
        if (coord && coord.length > 1) {
            lineStringCoords.push(coord);
            if (lineStringCoords.length > 10000) {
                feature.push(new Feature({geometry: new MultiLineString(lineStringCoords)}));
                lineStringCoords = [];
            }
        }
    }
    if (lineStringCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiLineString(lineStringCoords)}));
    }
    // for (let i = 0; i < indexes.length; i++) {
    //     const coord = coordinates.slice(indexes[i], indexes[i + 1] || coordinates.length);
    //     if (coord && coord.length > 1) {
    //         feature.push(new Feature({ geometry: new LineString(coord) }));
    //     }
    // }
};

const handlePolygonFeature = (feature, coordinates, indexes) => {
    let polygonCoords = [];
    for (let i = 0; i < indexes.length; i++) {
        const start = Math.floor(indexes[i] / 2);
        const end = Math.floor(indexes[i + 1] / 2) || coordinates.length;
        const coord = coordinates.slice(start, end).concat([coordinates[start]]);
        if (coord && coord.length > 1) {
            polygonCoords.push([coord]);
            if (polygonCoords.length > 10000) {
                feature.push(new Feature({geometry: new MultiPolygon(polygonCoords)}));
                polygonCoords = [];
            }
        }
    }
    if (polygonCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(polygonCoords)}));
    }
    // for (let i = 0; i < indexes.length; i++) {
    //     const start = Math.floor(indexes[i] / 2);
    //     const end = Math.floor(indexes[i + 1] / 2) || coordinates.length;
    //     const coord = coordinates.slice(start, end).concat([coordinates[start]]);
    //     if (coord && coord.length > 1) {
    //         feature.push(new Feature({ geometry: new Polygon([coord]) }));
    //     }
    // }
};

const handleEllipseFeature = (feature, coordinates) => {
    let ellipseCoords = [];
    for (let i = 0; i < coordinates.length; i += 4) {
        const coord = calculateEllipsePoints(coordinates.slice(i, i + 4));
        ellipseCoords.push([coord]);
        if (ellipseCoords.length > 10000) {
            feature.push(new Feature({geometry: new MultiPolygon(ellipseCoords)}));
            ellipseCoords = [];
        }
    }
    if (ellipseCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(ellipseCoords)}));
    }
    // for (let i = 0; i < coordinates.length; i += 4) {
    //     const coord = calculateEllipsePoints(coordinates.slice(i, i + 4));
    //     const polygon = new Polygon([coord]);
    //     feature.push(new Feature({ geometry: polygon }));
    // }
};

const handleRectangleFeature = (feature, coordinates) => {
    let rectangleCoords = [];
    for (let i = 0; i < coordinates.length; i += 4) {
        const coord = coordinates.slice(i, i + 4).concat([coordinates[i]]);
        rectangleCoords.push([coord]);
        if (rectangleCoords.length > 10000) {
            feature.push(new Feature({geometry: new MultiPolygon(rectangleCoords)}));
            rectangleCoords = [];
        }
    }
    if (rectangleCoords.length > 0) {
        feature.push(new Feature({geometry: new MultiPolygon(rectangleCoords)}));
    }
    // for (let i = 0; i < coordinates.length; i += 4) {
    //     const polygon = new Polygon([coordinates.slice(i, i + 4).concat([coordinates[i]])]);
    //     feature.push(new Feature({ geometry: polygon }));
    // }
};

export const updateAnnotation0 = (mapRef, NewSeriesInfo, layers, setAnnotationList,DrawColor) => {
    const [newSeriesInfo, setNewSeriesInfo] = NewSeriesInfo;
    const {action, name, status, type, annSeriesUid, annGroupUid, smSeriesUid} = newSeriesInfo;
    const [layer, setLayer] = layers;
    if (mapRef.current === null || NewSeriesInfo === undefined) return;
    if (status === false) return;

    const graphicType = {
        'POINT': {type: 'Point'},
        'POLYLINE': {type: 'LineString'},
        'POLYGON': {type: 'Polygon'},
        'ELLIPSE': {type: 'Circle', function: createEllipse()},
        'RECTANGLE': {type: 'Circle', function: createBox()}
    };

    mapRef.current.getInteractions().getArray().forEach(interaction => {
        if (interaction instanceof Draw) {
            mapRef.current.removeInteraction(interaction);
        }
    })

    // const color = DrawColor !== '' ? DrawColor : getRandomColor();

    if (action === 'add') {
        const groupColor = getRandomColor()
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
                fill: new Fill({color: groupColor})
            });

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
        mapRef.current.addLayer(newLayer);
        mapRef.current.addInteraction(draw);

        let snap
        snap = new Snap({source: source});
        mapRef.current.addInteraction(snap);

        const groupUID = generateGroupUID();

        if (name === 'addSeries') {
            setLayer({
                ...layer,
                [annSeriesUid]: {
                    ...(layer[annSeriesUid] || {}),
                    [groupUID]: newLayer
                }
            });

            setAnnotationList((prevAnnotationList) => {
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [{
                        accessionNumber: groupUID,
                        editable: true,
                        group: {
                            [groupUID]: {
                                color: groupColor,
                                dicomJson: {},
                                graphicType: type,
                                groupGenerateType: "auto",
                                groupName: "Group 1",
                                groupUid: groupUID,
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
                                [groupUID]: {
                                    color: groupColor,
                                    dicomJson: {},
                                    graphicType: type,
                                    groupGenerateType: "auto",
                                    groupName: `Group ${num}`,
                                    groupUid: groupUID,
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
                        [groupUID]: newLayer
                    }
                };
            });
        } else {
            return;
        }
    }
    else if (action === 'update') {
        const existingLayer = layer[annSeriesUid];
        const selectedLayer = existingLayer[annGroupUid];
        const selectedStyle = selectedLayer.getStyle();

        const updateDraw = new Draw({
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
        });

        mapRef.current.addInteraction(updateDraw);
    }
    else if (action === 'delete') {
        if (name === 'deleteSeries') {
            const existingLayer = layer[annSeriesUid];
            Object.keys(existingLayer).forEach((key) => {
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
    else if(action === 'cancel') {
        mapRef.current.getInteractions().getArray().forEach(interaction => {
            if (interaction instanceof Draw) {
                mapRef.current.removeInteraction(interaction);
            }
        })
    }

    // console.log("mapRef", mapRef.current.getLayers().getArray());
    setNewSeriesInfo({name: '', status: false, type: '', annSeriesUid: ''});
};

export const updateAnnotation = (mapRef, NewSeriesInfo, layers, setAnnotationList, DrawColor) => {
    const [newSeriesInfo, setNewSeriesInfo] = NewSeriesInfo;
    const {action, name, status, type, annSeriesUid, annGroupUid, smSeriesUid} = newSeriesInfo;
    const [layer, setLayer] = layers;
    if (mapRef.current === null || NewSeriesInfo === undefined) return;
    if (status === false) return;

    const graphicType = {
        'POINT': {type: 'Point'},
        'POLYLINE': {type: 'LineString'},
        'POLYGON': {type: 'Polygon'},
        'ELLIPSE': {type: 'Circle', function: createEllipse()},
        'RECTANGLE': {type: 'Circle', function: createBox()}
    };

    mapRef.current.getInteractions().getArray().forEach(interaction => {
        if (interaction instanceof Draw) {
            mapRef.current.removeInteraction(interaction);
        }
    });

    if (action === 'add') {
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
                fill: new Fill({color: groupColor})
            });

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

        // draw.on('drawend', (event) => {
        //     const geometry = event.feature.getGeometry();
        //     const coordinates = geometry.getCoordinates();
        //     console.log(1)
        //
        //     setAnnotationList((prevAnnotationList) => {
        //         const updatedAnnotationList = { ...prevAnnotationList };
        //         if (name === 'addSeries') {
        //             updatedAnnotationList[annSeriesUid][0].group[groupUID].pointsData = coordinates;
        //         } else if (name === 'addGroup') {
        //             updatedAnnotationList[annSeriesUid][0].group[groupUID].pointsData = coordinates;
        //         }
        //         return updatedAnnotationList;
        //     });
        // });

        draw.on('drawend', (event) => {
            const geometry = event.feature.getGeometry();
            const coordinates = geometry.getCoordinates();

            setAnnotationList((prevAnnotationList) => {
                const updatedAnnotationList = { ...prevAnnotationList };

                if (name === 'addSeries') {
                    const series = updatedAnnotationList[annSeriesUid][0].group[groupUID];
                    series.pointsData = Object.keys(series.pointsData).length !== 0 ? [...series.pointsData, coordinates] : [coordinates];
                } else if (name === 'addGroup') {
                    const group = updatedAnnotationList[annSeriesUid][0].group[groupUID];
                    group.pointsData = Object.keys(group.pointsData).length !== 0 ? [...group.pointsData, coordinates] : [coordinates];
                }

                return updatedAnnotationList;
            });
        });


        newLayer.setVisible(true);
        mapRef.current.addLayer(newLayer);
        mapRef.current.addInteraction(draw);

        const groupUID = generateGroupUID();

        if (name === 'addSeries') {
            setLayer({
                ...layer,
                [annSeriesUid]: {
                    ...(layer[annSeriesUid] || {}),
                    [groupUID]: newLayer
                }
            });

            setAnnotationList((prevAnnotationList) => {
                return {
                    ...prevAnnotationList,
                    [annSeriesUid]: [{
                        accessionNumber: groupUID,
                        editable: true,
                        group: {
                            [groupUID]: {
                                color: groupColor,
                                centerCoordinates: [],
                                dicomJson: {},
                                graphicType: type,
                                groupGenerateType: "auto",
                                groupName: "Group 1",
                                groupUid: groupUID,
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
                                [groupUID]: {
                                    centerCoordinates: [],
                                    color: groupColor,
                                    dicomJson: {},
                                    graphicType: type,
                                    groupGenerateType: "auto",
                                    groupName: `Group ${num}`,
                                    groupUid: groupUID,
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
                        [groupUID]: newLayer
                    }
                };
            });
        } else {
            return;
        }
    }
    else if (action === 'update') {
        const existingLayer = layer[annSeriesUid];
        const selectedLayer = existingLayer[annGroupUid];
        const selectedStyle = selectedLayer.getStyle();

        const updateDraw = new Draw({
            source: selectedLayer.getSource(),
            type: graphicType[type].type,
            geometryFunction: graphicType[type].function,
            freehand: true,
            style: selectedStyle
        });

        updateDraw.on('drawend', (event) => {
            const geometry = event.feature.getGeometry();
            const coordinates = geometry.getCoordinates();


            setAnnotationList((prevAnnotationList) => {
                const updatedAnnotationList = { ...prevAnnotationList };
                const series = updatedAnnotationList[annSeriesUid][0].group[annGroupUid];
                series.pointsData = Object.keys(series.pointsData).length !== 0 ? [...series.pointsData, coordinates] : [coordinates];
                return updatedAnnotationList;
            });
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
        });

        mapRef.current.addInteraction(updateDraw);
    }
    else if (action === 'delete') {
        if (name === 'deleteSeries') {
            const existingLayer = layer[annSeriesUid];
            Object.keys(existingLayer).forEach((key) => {
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
    else if(action === 'cancel') {
        mapRef.current.getInteractions().getArray().forEach(interaction => {
            if (interaction instanceof Draw) {
                mapRef.current.removeInteraction(interaction);
            }
        });
    }

    // console.log("mapRef", mapRef.current.getLayers().getArray());
    setNewSeriesInfo({name: '', status: false, type: '', annSeriesUid: ''});
};

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

export function lightenColor(color) {
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