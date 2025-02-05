const enableDragPan = () => {
    if (mapRef.current) //函数獲取地圖的所有交互（Interactions）。交互包括拖拽、缩放、旋轉等 {
        const interactions = mapRef.current.getInteractions();
    const dragPan = interactions.getArray().find(interaction => interaction instanceof DragPan);
    if (dragPan) dragPan.setActive(true);
    const pinchZoom = interactions.getArray().find(interaction => interaction instanceof PinchZoom)
    if (pinchZoom) pinchZoom.setActive(true);
}


const disableDragPan = () => {
    if (mapRef.current)       //函数獲取地圖的所有交互（Interactions）。交互包括拖拽。 
        const interactions = mapRef.current.getInteractions();
    //DragPan 是 OpenLayers 中負責處理地圖拖拽行為 
    const dragPan = interactions.getArray().find(interaction => interaction instanceof DragPan)
    const pinchZoom = interactions.getArray().find(interaction => interaction instanceof PinchZoom)
    if (pinchZoom) pinchZoom.setActive(false)
    if (dragPan) dragPan.setActive(false)
}
}
;
useEffect(() => {
    if (drawType) {
        if (!mapRef.current) return;
        disableDragPan()      // 如果当前正在绘制椭圆，则处理椭圆的结束逻辑 
        if (isDrawingEllipse) {
            setIsDrawingEllipse(false)
            if (ellipsePreview) {
                ellipsePreview.setGeometry(null)
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
        }        // 移除当前的绘图交互（如果存在
        if (drawInteractionRef.current) {
            mapRef.current.removeInteraction(drawInteractionRef.current);
            drawInteractionRef.current = null;
        }
        // 对于椭圆，设置相关状态以启用特殊的椭圆绘图逻
        if (drawType === 'Ellipse') {
            setIsDrawingEllipse(true);
        }
    } else if (drawType === 'Rectangle') {
        setIsDrawingRectangle(true);
    } else if (drawType === 'Polygon') {
        const drawInteraction = new Draw({
            source: sourceRef.current
            type: drawType, // 使用选定的绘图类型
            style: new Style({
                fill: new Fill({color: drawColor + '80', weight: 1}),
                stroke: new Stroke({color: drawColor, width: 1})
            })
        });
        drawInteraction.on('drawstart', function (event) {
            event.feature.setStyle(new Style({
                fill: new Fill({color: drawColor + '80', weight: 1}),
                stroke: new Stroke({color: drawColor, width: 1})
            }));
        })
        drawInteraction.on('drawend', function (event) {
            drawnShapesStack.current.push({id: event.feature.getId(), type: drawType})
        });
        mapRef.current.addInteraction(drawInteraction);
        drawInteractionRef.current = drawInteraction;
    }
    const moveHandler = (evt) => {
        if (touch) {
            return
        }
    }
}
evt.preventDefault();
if (!currentFeature) {
    // let cf = sourceRef.current.getFeatures().pop();
    currentFeature = new Feature({
        style: new Style({
            fill: new Fill({color: drawColor + '80'}),
            stroke: new Stroke({color: drawColor, width: 1}),
            image: new CircleStyle({radius: 5, fill: new Fill({color: drawColor + '80'})})
        })
    })
    sourceRef.current.addFeature(currentFeature);
}            // console.log('currentFeature', currentFeature)
if (evt.dragging) {
    if (drawType === 'Point') {
        currentFeatureCoords.push(evt.coordinate);
    }
    currentFeature.setGeometry(new MultiPoint(currentFeatureCoords));
    currentFeature.setStyle(new Style({
        image: new CircleStyle({radius: 5, fill: new Fill({color: drawColor + '80'})})
    }));
} else if (drawType === 'LineString') {
    // console.log(currentFeature) 
    currentFeatureCoords.push(evt.coordinate);
    currentFeature.setGeometry(new LineString(currentFeatureCoords));
    currentFeature.setStyle(new Style({stroke: new Stroke({color: drawColor, width: 1})}));
}
}
}
const mouseUpHandler = (evt) => {
    if (drawType === 'LineString' && currentFeatureCoords.length > 1) {
        drawnShapesStack.current.push({id: currentFeature.getId(), type: drawType});
        currentFeature = null;
        currentFeatureCoords.length = 0;
    } else if (drawType === 'Point' && currentFeatureCoords.length > 0) {
        drawnShapesStack.current.push({id: currentFeature.getId(), type: drawType});
        currentFeature = null
        currentFeatureCoords.length = 0;
    }
}
const mouseDownHandler = (evt) => {
    mapRef.current.on('pointermove', moveHandler);
    mapRef.current.on('pointerup', mouseUpHandler);
}
mapRef.current.on('pointerdown', mouseDownHandler);
if (currentFeature) {
    currentFeature = null;
    currentFeatureCoords.length = 0;
}
return () => {
    mapRef.current.un('pointerdown', mouseDownHandler);
    mapRef.current.un('pointermove', moveHandler);
    mapRef.current.un('pointerup', mouseUpHandler);
};
} else
if (drawType === null) {
    enableDragPan()
    // 2. 取消當前的繪圖操作 
    if (drawInteractionRef.current) {
        currentFeature = null;
        currentFeatureCoords.length = 0;
        mapRef.current.removeInteraction(drawInteractionRef.current);
        drawInteractionRef.current = null; // 移除繪圖交互引用 
    }
}
},
[drawType, drawColor]
)
;useEffect(() => {
    if (!mapRef.current || !sourceRef.current) return; // 如果正在绘制椭圆，添加事件监听 
    if (isDrawingEllipse) {
        const newEllipsePreview = new Feature();
        newEllipsePreview.setStyle(new Style({
            fill: new Fill({color: drawColor + '80'}),
            stroke: new Stroke({color: drawColor, width: 1})
        }));
        setEllipsePreview(newEllipsePreview);
        sourceRef.current.addFeature(newEllipsePreview);
        const clickHandler = (event) => {
            if (!ellipseCenter) {
                setEllipseCenter(event.coordinate);
            } else {
                const radiusX = calculateRadius(event.coordinate, ellipseCenter);
                const radiusY = radiusX / 2; // 假設Y轴半径为X轴的一
                const ellipseCoords = createEllipse(ellipseCenter, radiusX, radiusY);
                // console.log('[ellipseCoords]', [ellipseCoords]
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
        const ellipseFeature = new Feature(ellipsePreview.getGeometry());
        ellipseFeature.setStyle(new Style({
            fill: new Fill({color: drawColor + '80'}),
            stroke: new Stroke({color: drawColor, width: 1})
        }));
        savedEllipsesSourceRef.current.addFeature(ellipseFeature); // 將橢圓添加到保存圖層 
        drawnShapesStack.current.push({id: ellipseFeature.getId(), type: 'ELLIPSE'});
        ellipsePreview.setGeometry(null); // 清除預覽圖層中的橢圓 
        sourceRef.current.removeFeature(ellipsePreview); // 從原來的圖層中移除 
        setEllipsePreview(null); // 重置預覽Feature 
    }
}, [isDrawingEllipse, ellipseCenter]);
useEffect(() => {    // 如果正在绘制椭圆，添加事件监听 
    if (isDrawingRectangle) {
        const newRectanglePreview = new Feature();
        newRectanglePreview.setStyle(new Style({
            fill: new Fill({color: drawColor + '80'}),
            stroke: new Stroke({color: drawColor, width: 1})
        }));
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
        const rectangleFeature = new Feature(rectanglePreview.getGeometry());
        rectangleFeature.setStyle(new Style({
            fill: new Fill({color: drawColor + '80'}),
            stroke: new Stroke({color: drawColor, width: 1})
        }));
        savedRectangleSourceRef.current.addFeature(rectangleFeature); // 將橢圓添加到保存圖層 
        drawnShapesStack.current.push({id: rectangleFeature.getId(), type: 'RECTANGLE'});
        rectanglePreview.setGeometry(null); // 清除預覽圖層中的橢圓 
        sourceRef.current.removeFeature(rectanglePreview); // 從原來的圖層中移除 
        setRectanglePreview(null); // 重置預覽 Feature 
    }
}, [isDrawingRectangle, rectangleCenter]);

function undoFeature() {
    let features = sourceRef.current.getFeatures();
    const item = drawnShapesStack.current.pop() ?? "Polygon";
    if (!item) return;
    switch (item.type) {
        case 'ELLIPSE':
            features = savedEllipsesSourceRef.current.getFeatures();
            if (features.length > 0) savedEllipsesSourceRef.current.removeFeature(features[features.length - 1]);
            break;
        case 'RECTANGLE':
            features = savedRectangleSourceRef.current.getFeatures();
            if (features.length > 0) savedRectangleSourceRef.current.removeFeature(features[features.length - 1]);
            break;
        default:
            features = sourceRef.current.getFeatures();
            for (const feature of features?.toReversed().slice(0, 1) ?? []) {
                sourceRef.current.removeFeature(feature);
            }
    }
    setUndo([...undo.slice(0, undo.length - 1)]);
}

useEffect(() => {
    if (!undo || undo.length === 0) return;
    undoFeature();
}, [undo]);

function calculateRadius(coord1, coord2) {
    return Math.sqrt(Math.pow(coord1[0] - coord2[0], 2) + Math.pow(coord1[1] - coord2[1], 2));
}

function createRectangle(center, width, height, rotation = 0) {
    let halfWidth = width / 2;
    let halfHeight = height / 2;
    let cosRotation = Math.cos(rotation);
    let sinRotation = Math.sin(rotation);
    let topLeft = [center[0] - halfWidth * cosRotation - halfHeight * sinRotation, center[1] - halfWidth * sinRotation + halfHeight * cosRotation];
    let topRight = [center[0] + halfWidth * cosRotation - halfHeight * sinRotation, center[1] + halfWidth * sinRotation + halfHeight * cosRotation];
    let bottomRight = [center[0] + halfWidth * cosRotation + halfHeight * sinRotation, center[1] + halfWidth * sinRotation - halfHeight * cosRotation];
    let bottomLeft = [center[0] - halfWidth * cosRotation + halfHeight * sinRotation, center[1] - halfWidth * sinRotation - halfHeight * cosRotation];
    return [topLeft, topRight, bottomRight, bottomLeft]; // 確保長方形閉合 }  
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
                let fillColor = null;
                let strokeColor = null;
                if (feature instanceof CustomShape) {
                    type = feature.type;
                    feature = feature.feature;
                }
                // 获取几何类型和坐标
                const geometry = feature.getGeometry();
                if (geometry instanceof Point) {
                    type = "POINT";
                }
                let coords = geometry.getCoordinates();
                // 修改 y 轴坐
                coords[1] *= -1;
                coordinates.push(formatCoordinate(coords))
            }
        }
    else
        if (geometry instanceof Polygon) {
            type ??= "POLYGON";
        }
        let coords = geometry.getCoordinates()[0].map(coord => formatCoordinate(coord));
        if (type === 'ELLIPSE') {
            coords = calculateExtremityPoints(coords);
            const points = coords.map(coord => coord.replace(/[()]/g, '').split(',').map(Number));
            // console.log("points", points)                 // 修改 y 轴坐标 
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
    }

else
    if (geometry instanceof LineString) {
        type = "POLYLINE";
        coordinates = geometry.getCoordinates().map(coord => {                 // 修改 y 轴坐标 
            coord[1] *= -1;
            return formatCoordinate(coord);
        });
    }
    const style = feature.getStyle();
    if (style) {
        if (style.getImage()) {
            const image = style.getImage();
            if (image.getFill()) fillColor = image.getFill().getColor();
            if (image.getStroke()) strokeColor = image.getStroke().getColor();
        } else {
            if (style.getFill()) fillColor = style.getFill().getColor();
            if (style.getStroke()) strokeColor = style.getStroke().getColor();
        }
    }
    const hexColor = strokeColor || fillColor?.slice(0, 7);
    return {
        type,
        coordinates: coordinates.map(coord => `(${coord[0].toFixed(1)}, ${coord[1].toFixed(1)})`),
        color: hexColor ? convert.hex.lab(hexColor) : null,
    };
}

).
filter(annotation => annotation.type !== null);
const groupedAnnotations = Object.values(savedAnnotations.reduce((acc, curr) => {
    if (acc[curr.type]) {
        acc[curr.type].coordinates = acc[curr.type].coordinates.concat(curr.coordinates);
    } else {
        acc[curr.type] = {type: curr.type, coordinates: curr.coordinates};
    }
    return acc;
}, {}))

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
    }
    const formattedDataJson = JSON.stringify(formattedData);        // 使用 formattedData 作为请求体
    fetch(`http://127.0.0.1:5000/SaveAnnData/studies/${studyUid}/series/${seriesUid}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formattedData)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
            toast.error("發生未知錯誤")
        }
        toast.success("上傳成功")
        return response.json();
    }).then(data => {
        console.log('API response:', data);
    }).catch(error => {
        console.error('Error:', error);
    });
} else {
    console.error("Failed to extract study and series IDs from URL");
    toast.error("發生未知錯誤")
}
}
,
[save]
)
;

function calculateExtremityPoints(coordinates) {
    const points = coordinates.map(coord => coord.replace(/[()]/g, '').split(',').map(Number));
    const points = coordinates
    // console.log("points", points)
    // Encapsulated helper function to estimate the center of the ellips
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
}

// Estimate the center of the ellipse
const center = estimateCenter(points);
// Find the farthest and closest points to the center to estimate the axes
let maxDist = 0;
let minDist = Infinity
points.forEach(point => {
    const dist = distance(center, point);
    if (dist > maxDist) maxDist = dist;
    if (dist < minDist) minDist = dist
});   // Assuming the farthest point approximates the semi-major axi
// and the closest point approximates the semi-minor axis 
const semiMajorAxisLength = maxDist;
const semiMinorAxisLength = minDist;
// Calculate extremity points without considering rotation
//A more complex fitting method would be required to handle rotation properly
const extremities = {
    majorAxis: [[center[0] - semiMajorAxisLength, center[1]], [center[0] + semiMajorAxisLength, center[1]]],
    minorAxis: [[center[0], center[1] - semiMinorAxisLength], [center[0], center[1] + semiMinorAxisLength]]
}
return [...extremities.majorAxis, ...extremities.minorAxis].map(point => `(${point[0]}, ${point[1]})`)
}
}
