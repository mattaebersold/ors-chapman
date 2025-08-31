import React, { createContext, useContext, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import PostDetailModal from '../components/PostDetailModal';
import PostCreationModal from '../components/PostCreationModal';
import { useUpdatePostMutation } from '../services/apiService';
import { createFormData, preparePostData } from '../utils/formUtils';

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

  const showPostModal = useCallback((post) => {
    showModal('post', post);
  }, [showModal]);

  const showEditPostModal = useCallback((post) => {
    showModal('editPost', post);
  }, [showModal]);

  const handleUpdatePost = useCallback(async (formData) => {
    try {
      const postData = preparePostData(formData);
      const form = createFormData(postData);

      await updatePost({ 
        postId: modalState.data.internal_id || modalState.data._id, 
        formData: form 
      }).unwrap();
      
      hideModal();
      Alert.alert('Success', 'Post updated successfully!');
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
      case 'post':
        return (
          <PostDetailModal
            visible={modalState.visible}
            post={modalState.data}
            onClose={hideModal}
          />
        );
      case 'editPost':
        return (
          <PostCreationModal
            visible={modalState.visible}
            onClose={hideModal}
            onSubmit={handleUpdatePost}
            editMode={true}
            existingPost={modalState.data}
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