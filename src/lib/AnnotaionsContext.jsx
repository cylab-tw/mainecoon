import React, { createContext, useState } from 'react';
import {useImmer} from "use-immer";

export const AnnotationsContext = createContext();

export const AnnotationsProvider = ({ children }) => {
    const [annotationList, setAnnotationList] = useState({});
    return (
        <AnnotationsContext.Provider value={[annotationList, setAnnotationList]}>
            {children}
        </AnnotationsContext.Provider>
    );
};
