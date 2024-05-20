import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

function L_Modal({ isOpen, children }) {
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
      <div className="absolute inset-0 bg-gray-600/20 bg-opacity-50"></div>
      <div
        className="bg-white p-8 rounded-lg relative z-10 flex flex-col items-center justify-center"
        style={{
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div> {/* loading圖標 */}
        {children}
      </div>
    </div>
  );
}

L_Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default L_Modal;
