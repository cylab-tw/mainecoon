import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Study, Series, Instance, Frame } from "csy-dicomweb-wado-rs-uri";
import _, { create } from "lodash";

import { Point, Circle, LineString, Polygon, MultiLineString, MultiPolygon, MultiPoint } from 'ol/geom';
import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { Coordinate, createStringXY } from 'ol/coordinate';

// 整理 ANN
const convertAnnotation = createAsyncThunk(
    "convertAnnotation",
    async (annotationSeries: Series[], thunkAPI): Promise<VectorLayer<VectorSource>[]> => {
        // 結果
        let result: VectorLayer<VectorSource>[] = [];

        // 讀取每個 Series
        for (let i = 0; i < annotationSeries.length; i++) {
            const singleAnnotaionSeries = annotationSeries[i];

            // 本 Series ANN 的集合
            const annSource = new VectorSource();

            // 建立本 Series 的初始化 Style
            const style = new Style({
                stroke: new Stroke({
                    color: getColorByIndex("stroke", i),
                    width: 1,
                }),
                fill: new Fill({
                    color: getColorByIndex("fill", i),
                }),
            });

            const pointStyle = new Style({
                image: new CircleStyle({
                    radius: 5,
                    stroke: new Stroke({
                        color: getColorByIndex("stroke", i),
                        width: 1
                    }),
                    fill: new Fill({
                        color: getColorByIndex("fill", i)
                    }),
                })
            })


            // 可能有多次 ANN 的結果 (instance)
            const metadatas = singleAnnotaionSeries.metadata;

            // 每次 ANN 之中可能有多組 ANN
            for (let j = 0; j < metadatas.length; j++) {
                const metadata = metadatas[j];
                const annotationCoordinateType = _.first(getMetadataValue(metadata, "006A0001") as []); // 006A0001
                const pixelOriginInterpretation = _.first(getMetadataValue(metadata, "00480301") as []); // 00480301 Required if 006A0001 = 2D
                const referencedImageSequence = _.first(getMetadataValue(metadata, "00081140") as []); // 00081140 Required if 006A0001 = 2D

                // 可能有多組 ANN
                const annotationGroupSequence = getMetadataValue(metadata, "006A0002") as []; // 006A0002

                console.log("這組ANN裡面有: ");
                // 每組 ANN 裡面可能含有多種型態的 ANN (Point、Open Polylines、Closed Polygons、Circles、Ellipses、Squares、Rectangles)
                for (let k = 0; k < annotationGroupSequence.length; k++) {
                    const singleAnnotationGroup = annotationGroupSequence[k] as {};
                    const graphicType = _.first(getMetadataValue(singleAnnotationGroup, "00700023") as []) as string; // 00700023 (Point、Open Polylines、Closed Polygons、Circles、Ellipses、Squares、Rectangles)
                    const pointCoordinatesData = getOFDICOMMetadataValuesFromBase64(getMetadataValue(singleAnnotationGroup, "00660016") as string); // 00660016
                    const doublePointCoordinatesData = _.first(getMetadataValue(singleAnnotationGroup, "00660022") as []); // 00660022
                    const numberofAnnotations = _.first(getMetadataValue(singleAnnotationGroup, "006A000C") as []); // 006A000C
                    const longPrimitivePointIndexList = getMetadataValue(singleAnnotationGroup, "00660040") as string; // 00660040 Required if Graphic Type (0070,0023) is POLYLINE or POLYGON.    

                    // 整理座標資料
                    let coordinates: [number[]] = [[]];
                    for (let i = 0; i < pointCoordinatesData.length; i += 2) {
                        const x = pointCoordinatesData[i];
                        const y = pointCoordinatesData[i + 1];
                        const coordinate = [x, y];

                        // 第一個是宣告時的預設值則取代掉
                        if (_.isEqual(_.first(coordinates), [])) {
                            coordinates[0] = coordinate;
                        } else {
                            coordinates.push(coordinate);
                        }
                    }

                    // 依據不同型別的圖製作對應的標記
                    switch (graphicType) {
                        case "POINT":
                            annSource.addFeature(getPointFeature(coordinates, pointStyle));
                            break;
                        case "POLYLINE":
                            annSource.addFeature(getPolylineFeature(coordinates, style));
                            break;
                        case "POLYGON":
                            annSource.addFeature(getPolygonFeature(coordinates, style));
                            break;
                        case "ELLIPSE":
                            annSource.addFeature(getEllipseFeature(coordinates, style));
                            break;
                        case "RECTANGLE":
                            annSource.addFeature(getRectangleFeature(coordinates, style));
                            break;
                        default:
                            console.log("graphicType is undefined");
                            break;
                    }
                }
            }

            // 取得此 Series 的 ANN
            result.push(new VectorLayer({
                className: _.toString(i),
                source: annSource
            }));
        }

        return result;
    }
)

function getColorByIndex(mode: string, index: number): string {
    const colorIndex = index % 6;
    const StrokeColorList = [
        "rgb(0, 0, 255)",
        "rgb(0, 255, 0)",
        "rgb(0, 255, 255)",
        "rgb(255, 0, 0)",
        "rgb(255, 0, 255)",
        "rgb(255, 255, 0)",
    ];

    const FillColorList = [
        "rgba(0, 0, 255, 0.3)",
        "rgba(0, 255, 0, 0.3)",
        "rgba(0, 255, 255, 0.3)",
        "rgba(255, 0, 0, 0.3)",
        "rgba(255, 0, 255, 0.3)",
        "rgba(255, 255, 0, 0.3)",
    ];

    return _.isEqual(mode, "stroke") ? StrokeColorList[colorIndex] : FillColorList[colorIndex];
}

function getPointFeature(coordinates: [number[]], style: Style): Feature {
    console.log("graphicType is POINT");
    console.log("coordinates", coordinates);

    const result = new Feature({
        geometry: new MultiPoint(coordinates)
    });

    result.setStyle(style);

    return result;
}

function getPolylineFeature(coordinates: [number[]], style: Style): Feature {
    console.log("graphicType is POLYLINE");
    console.log("coordinates", coordinates);

    const result = new Feature({
        geometry: new LineString(coordinates)
    });

    result.setStyle(style);

    return result;
}

function getPolygonFeature(coordinates: [number[]], style: Style): Feature {
    console.log("graphicType is POLYGON");
    console.log("coordinates", coordinates);

    const formatedCoordinates: Coordinate[] = [];

    _.forEach(coordinates, (coordinate) => {
        formatedCoordinates.push(coordinate as Coordinate);
    })

    const result = new Feature({
        geometry: new Polygon([formatedCoordinates])
    });

    result.setStyle(style);

    return result;
}

function getEllipseFeature(coordinates: [number[]], style: Style): Feature {
    console.log("graphicType is ELLIPSE");
    console.log("coordinates", coordinates);
    return new Feature();
}

function getRectangleFeature(coordinates: [number[]], style: Style): Feature {
    console.log("graphicType is RECTANGLE");
    console.log("coordinates", coordinates);

    const formatedCoordinates: Coordinate[] = [];

    _.forEach(coordinates, (coordinate) => {
        formatedCoordinates.push(coordinate as Coordinate);
    })

    const result = new Feature({
        geometry: new Polygon([formatedCoordinates])
    });

    result.setStyle(style);

    return result;
}


function getMetadataValue(metadata: {}, numberOfMetadata: string): {} | [string] | string {
    const parameter = _.has(_.get(metadata, numberOfMetadata), "Value") ? "Value" : "InlineBinary";
    const result = _.get(_.get(metadata, numberOfMetadata), parameter);
    return result;
}

function getOFDICOMMetadataValuesFromBase64(base64: string): Float32Array {
    const decodeBase64 = window.atob(base64);
    const byteNumbers = new Uint8Array(decodeBase64.length);
    for (let i = 0; i < decodeBase64.length; i++) {
        byteNumbers[i] = decodeBase64.charCodeAt(i);
    }
    const result = new Float32Array(byteNumbers.buffer);
    return result;
}






// 整理單一 Instances
const sortSpecificPyramid = createAsyncThunk(
    "sortSpecificPyramid",
    async (singleSeries: Series, thunkAPI): Promise<Series> => {
        let result: Series = _.cloneDeep(singleSeries);
        let instances: Instance[] = singleSeries.Instances;

        instances = await getImageTypeIsVolumeInstances(instances);
        instances = await getSortedInstances(instances);
        result.Instances = instances;

        return result;
    }
)

async function getSortInstancesByNumberOfFrames(instances: Instance[]): Promise<Instance[]> {
    // Frames數量由小至大排列
    return instances.sort((a, b) => a.Frames.length - b.Frames.length);
}

async function getSortedInstancesByTotalPixel(instances: Instance[]): Promise<Instance[]> {
    let tempInstace: Instance[] = _.cloneDeep(instances);
    let result: Instance[];

    for (let i = 0; i < tempInstace.length - 1; i++) {
        for (let j = 0; j < tempInstace.length - 1 - i; j++) {
            const instance = _.get(tempInstace, j);
            const nextInstance = _.get(tempInstace, j + 1);

            const instanceMetadata = _.get(instance, "metadata");
            const nextInstanceMetadata = _.get(nextInstance, "metadata");

            const instanceTotalPixelMatrixRows = _.toNumber(_.first(_.get(_.get(instanceMetadata, "00480007"), "Value"))); //00480007 總高
            const instanceTotalPixelMatrixColumns = _.toNumber(_.first(_.get(_.get(instanceMetadata, "00480006"), "Value"))); //00480006 總寬

            const nextInstanceTotalPixelMatrixRows = _.toNumber(_.first(_.get(_.get(nextInstanceMetadata, "00480007"), "Value"))); //00480007 總高
            const nextInstanceTotalPixelMatrixColumns = _.toNumber(_.first(_.get(_.get(nextInstanceMetadata, "00480006"), "Value")));//00480006 總寬

            // 計算 高*寬 的面積數值，因為圖片長寬通常都會大於 100，所以先除 100 避免乘出來的數值變大。
            const instanceProduct = (instanceTotalPixelMatrixRows / 100) * (instanceTotalPixelMatrixColumns / 100);
            const nextInstanceProduct = (nextInstanceTotalPixelMatrixRows / 100) * (nextInstanceTotalPixelMatrixColumns / 100);

            if (instanceProduct > nextInstanceProduct) {
                let temp = _.get(tempInstace, j);
                tempInstace[j] = _.get(tempInstace, j + 1);
                tempInstace[j + 1] = temp;
            }
        }
    }

    result = _.cloneDeep(tempInstace);

    return result;
}

async function getSortedInstances(instances: Instance[]): Promise<Instance[]> {
    let result: Instance[];
    result = await getSortedInstancesByTotalPixel(instances);
    result = await getSortInstancesByNumberOfFrames(result);
    return result;
}

async function getImageTypeIsVolumeInstances(instances: Instance[]): Promise<Instance[]> {
    // 00080008 imageType 是非必填
    let result: Instance[] = [];

    // 抓到有 imageType 的 Instances
    const hasImageTypeInstances: Instance[] = [];

    for (let i = 0; i < instances.length; i++) {
        const instance = _.get(instances, i);
        const metadata = instance.metadata;
        const imageTypes = _.get(metadata, "00080008");
        if (!(_.isEmpty(imageTypes)) || !(_.isUndefined(imageTypes))) {
            hasImageTypeInstances.push(instance);
        }
    }

    // 具有 imageType 的 Instances 是空的話，則認為全部皆為 Volume。
    if (_.isEmpty(hasImageTypeInstances)) {
        result = instances;
        return result;
    }

    // 找出 imageType 有 VOLUME 的 Instaces
    const imageTypeHasVolumeInstances: Instance[] = [];
    for (let i = 0; i < instances.length; i++) {
        let instance = _.get(instances, i);
        let metadata = instance.metadata;
        let imageTypes = _.get(_.get(metadata, "00080008"), "Value");

        if (_.includes(imageTypes, "VOLUME")) {
            imageTypeHasVolumeInstances.push(instance);
        }
    }


    // 剔除 imageType 有 LABEL 的 Instaces
    const imageTypeNotHasLabelInstances: Instance[] = [];
    for (let i = 0; i < imageTypeHasVolumeInstances.length; i++) {
        let instance = _.get(imageTypeHasVolumeInstances, i);
        let metadata = instance.metadata;
        let imageTypes = _.get(_.get(metadata, "00080008"), "Value");

        // 不是 LABEL 就加入
        if (!(_.includes(imageTypes, "LABEL"))) {
            imageTypeNotHasLabelInstances.push(instance);
        }
    }

    result = imageTypeNotHasLabelInstances;

    return result;
}


type pyramidState = {
    smResult?: Series,
    smStatus: string,
    annotaionResults?: VectorLayer<VectorSource>[],
    annotaionStatus: string
}

const initialState: pyramidState = {
    smResult: undefined,
    smStatus: null,
    annotaionResults: undefined,
    annotaionStatus: null
};


export const pyramidSlice = createSlice({
    name: "pyramid",
    initialState,
    reducers: {

    },
    extraReducers: (builder) => {
        builder.addCase(sortSpecificPyramid.pending, (state, action) => {
            state.smStatus = "Loading";
        })
        builder.addCase(sortSpecificPyramid.fulfilled, (state, action) => {
            state.smStatus = "Success";
            state.smResult = action.payload;
        })
        builder.addCase(sortSpecificPyramid.rejected, (state, action) => {
            state.smStatus = "Error";
        })

        builder.addCase(convertAnnotation.pending, (state, action) => {
            state.annotaionStatus = "Loading";
        })
        builder.addCase(convertAnnotation.fulfilled, (state, action) => {
            state.annotaionStatus = "Success";
            state.annotaionResults = action.payload;
        })
        builder.addCase(convertAnnotation.rejected, (state, action) => {
            state.annotaionStatus = "Error";
        })
    }
});

export { sortSpecificPyramid, convertAnnotation };

export default pyramidSlice.reducer;