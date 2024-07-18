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
import {Map} from 'ol';
import MousePosition from 'ol/control/MousePosition.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {computeAnnotationFeatures} from '../../../lib/microscopy-viewers/annotation';
import {computePyramidInfo} from '../../../lib/microscopy-viewers/pyramid';
import {Fill, Stroke, Style} from 'ol/style';
import LoadingSpin from "./LoadingSpin.jsx";
import {AnnotationsContext} from "../../../lib/AnnotaionsContext.jsx";

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images,Loading, layers}) => {
    const [errorMessage, setErrorMessage] = useState(undefined);
    const [layer, setLayer] = layers;
    const mapRef = useRef(null);
    const [loading, setLoading] = Loading;
    const [annotationList,setAnnotationList] = useContext(AnnotationsContext)

    function lightenColor(color) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const opacity = 0.2;
        const rgbaColor = `rgba(${r}, ${b}, ${b}, ${opacity})`;
        return rgbaColor;
    }

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
                    const {features, groups, seriesUid} = await computeAnnotationFeatures(annotationList[key], resolutions);
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
                    // onMessageChange({layer : tempLayer});
                    setLayer(tempLayer);
                    // onMessageChange({layer : mapRef.current.getLayers(),seriesUid:seriesUid});
                });
            } catch (error) {
                setErrorMessage('Failed to load image.');
                console.error(error);
            }
        };


        fetchData();
    }, [baseUrl, studyUid, seriesUid, images]);

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
        <div id="ViewerID" className={`relative w-full flex grow bg-gray-100`}>
            {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-t-primary border-b-green-400 rounded-full animate-spin"/>
                </div>
            ) : (
                <>
                    <div className="h-full w-full"/>
                    <div className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                        <p>{errorMessage}</p>
                    </div>
                </>
            )}
        </div>
    );
};

export default MicroscopyViewer;
