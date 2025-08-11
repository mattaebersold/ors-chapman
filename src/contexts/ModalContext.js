import React, { createContext, useContext, useState, useCallback } from 'react';
import PostDetailModal from '../components/PostDetailModal';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    visible: false,
    type: null,
    data: null,
  });

  const showModal = useCallback((type, data) => {
    setModalState({
      visible: true,
      type,
      data,
    });
  }, []);

  const hideModal = useCallback(() => {
    setModalState({
      visible: false,
      type: null,
      data: null,
    });
  }, []);

  const showPostModal = useCallback((post) => {
    showModal('post', post);
  }, [showModal]);

  const renderModal = () => {
    if (!modalState.visible) return null;

    switch (modalState.type) {
      case 'post':
        return (
          <PostDetailModal
            visible={modalState.visible}
            post={modalState.data}
            onClose={hideModal}
          />
        );
      default:
        return null;
    }
  };

  const value = {
    showModal,
    hideModal,
    showPostModal,
    modalState,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );
};