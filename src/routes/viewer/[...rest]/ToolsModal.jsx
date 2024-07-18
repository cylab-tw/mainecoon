import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';

function Modal({isOpen, onClose, children}) {
    //isOpen:打開編輯，pop-up編輯視窗
    //onClose:X按鈕
    const [modalState, setModalState] = useState('opacity-0');

    useEffect(() => {
        if (isOpen) {
            setModalState('opacity-0');
            setTimeout(() => setModalState('opacity-100'), 10);
        } else {
            setModalState('opacity-0');
        }
    }, [isOpen]);

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className={`fixed top-16 mt-1.5 left-1/2 transform -translate-x-1/2 flex items-center rounded-lg shadow-2xl w-fit h-fit transition-opacity duration-500 ${modalState}`}
            style={{zIndex: 1000}}>

            <div className="bg-green-600 pl-4 pr-4 rounded-lg"
                style={{
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 50px)',
                    overflowY: 'auto',
                }}
            >
                {children}
            </div>
        </div>


    );
}


export default Modal;


