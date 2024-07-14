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
import {Fill, Stroke, Style} from 'ol/style';

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images, annotations, group, onMessageChange, layers,}) => {
    const [errorMessage, setErrorMessage] = useState(undefined);
    // const sourceRef = useRef(new VectorSource({wrapX: false}));
    const [groupName, setGroupName] = group;
    const [layer, setLayer] = layers;
    const mapRef = useRef(null);
    const [color, setColor] = useState([]);
    const [loading, setLoading] = useState(true);

    function lightenColor(color) {
        const [r, g, b] = color.match(/\d+/g).map(Number);
        const opacity = 0.2;
        const rgbaColor = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        return rgbaColor;
    }

    useEffect(() => {
        const fetchData = async () => {
            if (images.length === 0) return;
            try {
                const {extent, layer, resolutions, view} = computePyramidInfo(baseUrl, studyUid, seriesUid, images);
                document.getElementById("ViewerID").innerHTML = '';
                // const vector = new VectorLayer({source: sourceRef.current});
                mapRef.current = new Map({
                    controls:
                        defaultControls().extend([
                            new MousePosition({
                                coordinateFormat: (c) => (c ? `${c[0].toFixed(2)}, ${-c[1].toFixed(2)}` : ''),
                                className: 'absolute left-auto right-0 m-2 rounded-sm bg-white/75 px-1 py-0.5 text-xs font-medium',
                            }),
                            new OverviewMap({
                                collapsed: false,
                                layers: [new TileLayer({source: layer.getSource() ?? undefined})],
                            }),
                            new ScaleLine(),
                            new FullScreen(),
                            new Rotate(),
                            new ZoomSlider(),
                            new ZoomToExtent(),
                            new Zoom(),
                            new Attribution()
                        ]),
                    target: "ViewerID",
                    layers: [layer],
                    view: view,
                })

                mapRef.current.getControls().clear();
                mapRef.current.on('loadstart', () => setLoading(true));
                mapRef.current.on('loadend', () => setLoading(false));
                mapRef.current.getView().fit(extent, {size: mapRef.current.getSize()});


                // {annotations.map((annotation) => {
                //         computeAnnotationFeatures(annotation, resolutions)
                //             .then(({features0, annGroupName0}) => {
                //                 groupName.push(annGroupName0)
                //                 features0.map((feature) => {
                //                     const color1 = getRandomColor();
                //                     color.push(color1)
                //                     if (feature.length > 0) {
                //                         let fill;
                //                         if (annotation[0].graphicType === "POLYGON") {
                //                             fill = new Fill({
                //                                 color: lightenColor(color1)
                //                             });
                //                         }
                //
                //                         const style = new Style({
                //                             stroke: new Stroke({
                //                                 color: color1,
                //                                 width: 1
                //                             }),
                //                             fill: fill
                //                         });
                //
                //                         const source = new VectorSource({features: feature});
                //                         const newLayer = new VectorLayer({source, extent, style});
                //                         newLayer.setVisible(false);
                //                         mapRef.current.addLayer(newLayer);
                //                     } else {
                //                         return
                //                     }
                //                 })
                //                 onMessageChange(mapRef.current.getLayers());
                //                 setLayer(mapRef.current.getLayers());
                //
                //             })
                //             .catch((error) => {
                //                 setErrorMessage('Failed to load annotations.');
                //                 console.error(error);
                //             })
                //     })
                // }

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
        <div id="ViewerID" className={`relative w-full flex grow`}>
            {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-t-primary border-b-green-400 rounded-full animate-spin"/>
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

export default MicroscopyViewer;
