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
        <div className={`fixed inset-0 flex items-center justify-center w-full z-50 transition-opacity duration-500 ${modalState}`}>
            <div className="absolute inset-0 bg-gray-600/20 bg-opacity-50" onClick={onClose}></div>
            <div
                className="bg-white p-8 rounded-lg relative z-10"
                style={{
                    maxHeight: '80vh',
                    overflowY: 'auto',
                    maxWidth: '80vw',
                }}
            >
                {children}
                <button className="absolute top-2 right-2 text-lg" onClick={onClose}>
                    ✕
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


