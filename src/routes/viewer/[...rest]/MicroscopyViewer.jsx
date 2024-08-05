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
import {computeAnnotationFeatures, getRandomColor, lightenColor, updateAnnotation} from '../../../lib/microscopy-viewers/annotation';
import {computePyramidInfo} from '../../../lib/microscopy-viewers/pyramid';
import {Fill, Stroke, Style} from 'ol/style';
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";
import CircleStyle from "ol/style/Circle.js";
import VectorImageLayer from "ol/layer/VectorImage.js";
import {DragRotateAndZoom, defaults as defaultInteractions, Select, Translate, Snap} from 'ol/interaction.js';

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images, Loading, layers,annotations, NewSeriesInfo,DrawColor,onMessageChange}) => {
    const [newSeriesInfo, setNewSeriesInfo] = NewSeriesInfo
    const {status} = newSeriesInfo;
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [layer, setLayer] = layers;
    const mapRef = useRef(null);
    const [loading, setLoading] = Loading;
    const [annotationList, setAnnotationList] = useContext(AnnotationsContext)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const {extent, layer, resolutions, view, PixelSpacings} = computePyramidInfo(baseUrl, studyUid, seriesUid, images);
                const viewerElement = document.getElementById("ViewerID");
                viewerElement.innerHTML = '';

                const controls = [
                    // ...defaultControls().getArray(),
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
                    // new ZoomToExtent(),
                    new Zoom({
                        className: 'zoom-control' // 添加自定义的类名
                    }),
                    new Attribution(),
                ];

                const select = new Select();

                const translate = new Translate({
                    features: select.getFeatures(),
                });

                mapRef.current = new Map({
                    // shift+drag to rotate and zoom
                    interactions: defaultInteractions().extend([new DragRotateAndZoom(),select, translate]),
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
                    const {features, group, seriesUid, centerCoordinates} = await computeAnnotationFeatures(annotationList[key], resolutions);
                    console.log('features', features);
                    console.log('centerCoordinates', centerCoordinates);
                    const annotationGroup = Object.values(group);
                    features.forEach((feature, index) => {
                        if (feature.length > 0) {
                            const groupColor = getRandomColor();
                            const fill = group.graphicType === "POLYGON" ?
                                new Fill({color: lightenColor(groupColor)}) : undefined;
                            const style = new Style({
                                stroke: new Stroke({color: groupColor, width: 1}),
                                fill,
                                image: new CircleStyle({
                                    radius: 5,
                                    fill: new Fill({color: 'rgba(255,255,255,0.2)'}),
                                    stroke: new Stroke({color: groupColor, width: 2})
                                })
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
                                                centerCoordinates: centerCoordinates[index]
                                            }
                                        }
                                    }
                                ]
                            }));
                            const source = new VectorSource({wrapX: false, features: feature});

                            // let newLayer = mapRef.current.getLayers().getArray().find(layer => layer.get('seriesUid') === seriesUid);
                            let newLayer;
                            if (annotationGroup[0].numberOfAnnotations > 1000) {
                                newLayer = new VectorImageLayer({source, extent, style});
                            } else if (annotationGroup[0].numberOfAnnotations < 1000) {
                                newLayer = new VectorLayer({source, extent, style});
                            }
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
                    onMessageChange({mapRef:mapRef})
                    setLayer(tempLayer);
                });
            } catch (error) {
                setErrorMessage('Failed to load image.');
                console.error(error);
            }
        };
        // {((images.length > 0)&&(Object.values(annotationList).length !== 0)) && fetchData()}
        {images.length > 0 && fetchData()}
    }, [baseUrl, studyUid, seriesUid, images,annotations]);

    useEffect(() => {updateAnnotation(mapRef, NewSeriesInfo, layers, setAnnotationList,DrawColor)}, [status])

    return (
        <div id="ViewerID" className={`relative w-full flex grow bg-gray-100`}>
            {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-t-primary border-b-green-400 rounded-full animate-spin"/>
                </div>
            ) : (
                <>
                    <div className="max-h-full h-100 w-full"/>
                    <div
                        className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                        <p>{errorMessage}</p>
                    </div>
                </>
            )}
        </div>
    );
};


export default MicroscopyViewer;
