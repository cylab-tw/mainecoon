import React, { useState, useEffect } from 'react';
import {useLocation, useParams} from 'react-router-dom';
import MicroscopyViewer from './MicroscopyViewer'; // 引入 MicroscopyViewer 組件
import { getAnnotations, getImagingInfo, getSeriesInfo } from '../../../lib/dicom-webs/series';
import { DICOMWEB_URLS } from '../../../lib/dicom-webs';

import { getDicomwebUrl } from '../../../lib/dicom-webs/server';

import Header from '../../../lib/Header';

const ViewerPage = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    // const searchParams = useParams();
    const server = searchParams.get('server') || DICOMWEB_URLS[0].name;
    const studyUid = searchParams.get('studyUid');
    const seriesUid = searchParams.get('seriesUid');

    const [baseUrl, setBaseUrl] = useState('');
    const [images, setImages] = useState([]);
    const [annotations, setAnnotations] = useState([]);
    const [smSeriesUid, setSmSeriesUid] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            console.log('ViewerPage test')
            // if (!studyUid || !seriesUid) return;
            if (!studyUid || !seriesUid) {
                console.log('studyUid:', studyUid);
                console.log('seriesUid:', seriesUid);
                // return;
            }
            const baseUrl = getDicomwebUrl(server);
            setBaseUrl(baseUrl);


            const series = await getSeriesInfo(baseUrl, studyUid, seriesUid);
            const smSeriesUid = series?.modality === 'SM' ? seriesUid : series?.referencedSeriesUid;
            setSmSeriesUid(smSeriesUid);
            console.log('smSeriesUid',smSeriesUid)
            const imagingInfo = await getImagingInfo(baseUrl, studyUid, smSeriesUid);
            setImages(imagingInfo);
            console.log('imagingInfo:', imagingInfo);


            if (series?.modality === 'ANN') {
                const annotations = await getAnnotations(baseUrl, studyUid, seriesUid);
                setAnnotations(annotations);
            }
        };

        fetchData();
    }, [server, studyUid, seriesUid]);

    if (images.length === 0 || !smSeriesUid) {
        return (
            <div className="flex h-full w-full justify-center items-center">
                <h1>Loading...</h1>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col">
            <Header />
            <MicroscopyViewer
                baseUrl={baseUrl}
                studyUid={studyUid}
                seriesUid={smSeriesUid}
                images={images}
                annotations={annotations}
                className="grow"
            />
        </div>
    );
};


export default ViewerPage;
