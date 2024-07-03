import React, { createContext, useState } from 'react';

export const ServerContext = createContext();

export const ServerProvider = ({ children }) => {
    const [server,setServer] = useState('NTUNHS')
    return (
        <ServerContext.Provider value={[server,setServer]}>
            {children}
        </ServerContext.Provider>
    );
};
