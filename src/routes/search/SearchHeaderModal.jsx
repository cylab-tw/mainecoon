import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function Modal({ isOpen, onClose, children }) {
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
        <div className={`fixed flex top-16 w-fit h-fit z-50 transition-opacity duration-500 ${modalState}`}>
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50"></div>
            <div
                className="bg-green-400 pl-4 pr-6 rounded-b-lg z-10"
                style={{
                    height: 'fit-content',
                    maxHeight: 'calc(100vh - 40px)',
                    overflowY: 'auto',
                }}
                onMouseLeave={onClose}
            >
                {children}
                <button className="absolute top-2 right-2 text-lg" onMouseLeave={onClose}>
                </button>
            </div>
        </div>


    );
}

Modal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default Modal;


