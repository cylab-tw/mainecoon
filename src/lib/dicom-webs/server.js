import { useState, useEffect } from 'react';

const parseDicomwebUrls = (urls) => {
    return urls.split(',').map(url => {
        const [name, urlValue] = url.split('=');
        return { name, url: urlValue || name };
    });
};


// const PUBLIC_DICOMWEB_URLS = 'J4Care=https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs,Google=https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb';
const PUBLIC_DICOMWEB_URLS = 'NTUNHS=https://ditto.dicom.tw/dicom-web,J4Care=https://development.j4care.com:11443/dcm4chee-arc/aets/DCM4CHEE/rs,GOOGLE=https://dicomwebproxy-bqmq3usc3a-uc.a.run.app/dicomWeb';

const DICOMWEB_URLS = parseDicomwebUrls(PUBLIC_DICOMWEB_URLS);



// Function to get the DICOM web URL directly without setting state
export const getDicomwebUrl = (name) => {
    console.log("name",name)
    const serverIndex = DICOMWEB_URLS.findIndex(server => server.name === name);
    return DICOMWEB_URLS[serverIndex === -1 ? 0 : serverIndex].url;
};

export function useDicomWebServer() {
    const [dicomWebServer, setDicomWebServer] = useState('');
    const [currentUrl, setCurrentUrl] = useState(DICOMWEB_URLS[0].url);

    // This effect updates the DICOM web URL whenever the server changes
    useEffect(() => {
        const server = DICOMWEB_URLS.find(url => url.name === dicomWebServer);
        setCurrentUrl(server ? server.url : DICOMWEB_URLS[0].url);
    }, [dicomWebServer]);

    // Function to set the DICOM web server
    const setServer = (serverName) => {
        setDicomWebServer(serverName);
    };

    return { currentUrl, setServer };
}
