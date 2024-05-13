import React, {useEffect, useState} from 'react';
import 'ol/ol.css';
import {defaults as defaultControls, OverviewMap,ScaleLine,FullScreen,Rotate,ZoomSlider,ZoomToExtent,Zoom,Attribution} from 'ol/control';
import {Map} from 'ol';
import MousePosition from 'ol/control/MousePosition.js';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import {computeAnnotationFeatures} from '../../../lib/microscopy-viewers/annotation';
import {computePyramidInfo} from '../../../lib/microscopy-viewers/pyramid';
import PropTypes from 'prop-types';

const MicroscopyViewer = ({baseUrl, studyUid, seriesUid, images, annotations}) => {
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(undefined);

    useEffect(() => {
        const fetchData = async () => {
            console.log('MicroscopyViewertest')
            if (images.length === 0) {
                setLoading(false);
                setErrorMessage('No images found.');
                return;
            }
            const ViewerID = "ViewerID";
            try {
                const {extent, layer, resolutions, view} =
                    computePyramidInfo(baseUrl, studyUid, seriesUid, images);

                document.getElementById(ViewerID).innerHTML = '';

                let map = new Map({
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
                                    source: layer.getSource() ?? undefined  // 確保使用相同的圖層源，或者提供一個替代方案
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
                    layers: [layer],
                    view,
                });

                console.log('annotations:', annotations);


                computeAnnotationFeatures(annotations, resolutions)
                    .then((features) => {
                        console.log('features:', features);
                        if (features.length > 0) {
                            const source = new VectorSource({features});
                            map.addLayer(new VectorLayer({source, extent}));
                        }
                    })
                    .catch((error) => {
                        setErrorMessage('Failed to load annotations.');
                        console.error(error);
                    })
                    .finally(() => setLoading(false));

                map.getView().fit(extent, {size: map.getSize()});
            } catch (error) {
                setErrorMessage('Unexpected error occurred.');
                setLoading(false);
                console.error('error:', error);
            }
        };
        //     fetchData();
        // }, [baseUrl, studyUid, seriesUid, images, annotations]);
        if (images) fetchData();
        console.log('images:', images);
    }, [images, annotations]);

    return (
        <div className={`relative w-full grow ${loading ? 'loading' : ''}`}>
            <div id="ViewerID" className="h-full w-full" />
            <div
                className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!loading ? 'hidden' : ''}`}>
                <span className="loader border-green-500"/>
            </div>
            <div
                className={`absolute inset-0 z-10 flex items-center justify-center bg-black/40 ${!errorMessage ? 'hidden' : ''}`}>
                <p>{errorMessage}</p>
            </div>
        </div>
    );
};

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
