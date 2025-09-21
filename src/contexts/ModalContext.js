import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useUpdatePostMutation } from '../services/apiService';
import { createFormData, preparePostData } from '../utils/formUtils';

// Lazy load components to avoid circular dependencies
const PostCreationModal = React.lazy(() => import('../components/modals/PostCreationModal'));

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
  
  const [updatePost] = useUpdatePostMutation();

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


  const showEditPostModal = useCallback((post) => {
    showModal('editPost', post);
  }, [showModal]);

  const handleUpdatePost = useCallback(async (formData) => {
    try {
      const postData = preparePostData({
        ...formData,
        internal_id: modalState.data.internal_id || modalState.data._id
      });
      const form = createFormData(postData);

      await updatePost({ 
        postId: modalState.data.internal_id || modalState.data._id, 
        formData: form 
      }).unwrap();
      
      hideModal();
    } catch (error) {
      console.error('Error updating post:', error);
      
      let errorMessage = 'Failed to update post';
      if (error.originalStatus === 502) {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status) {
        errorMessage = `Server error (${error.status}). Please try again.`;
      }
      
      throw new Error(errorMessage);
    }
  }, [updatePost, modalState.data, hideModal]);

  const renderModal = () => {
    if (!modalState.visible) return null;

    switch (modalState.type) {
      case 'editPost':
        return (
          <React.Suspense fallback={null}>
            <PostCreationModal
              visible={modalState.visible}
              onClose={hideModal}
              onSubmit={handleUpdatePost}
              editMode={true}
              existingPost={modalState.data}
            />
          </React.Suspense>
        );
      default:
        return null;
    }
  };

  const value = {
    showModal,
    hideModal,
    showEditPostModal,
    modalState,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      {renderModal()}
    </ModalContext.Provider>
  );
};