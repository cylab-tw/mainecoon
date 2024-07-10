import React, { createContext, useState } from 'react';
import dicomWebServerConfig from "../config/DICOMWebServer.config.js";

export const ServerContext = createContext();

const publicServers = dicomWebServerConfig
const key = Object.keys(publicServers)

export const ServerProvider = ({ children }) => {
    const [server,setServer] = useState(key[0])
    return (
        <ServerContext.Provider value={[server,setServer]}>
            {children}
        </ServerContext.Provider>
    );
};
