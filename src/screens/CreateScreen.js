import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import PostCreationModal from '../components/PostCreationModal';
import { useCreatePostMutation } from '../services/apiService';
import { createFormData, preparePostData } from '../utils/formUtils';
import { Alert } from 'react-native';

const CreateScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [createPost] = useCreatePostMutation();
  const navigation = useNavigation();

  // Show modal when this screen becomes focused
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setModalVisible(true);
    });

    return unsubscribe;
  }, [navigation]);

  const handleCreatePost = async (formData) => {
    try {
      // Prepare post data using Murray's pattern
      const postData = preparePostData(formData);
      
      // Create FormData using the utility function
      const form = createFormData(postData);

      // Create new post
      await createPost(form).unwrap();
      Alert.alert('Success', 'Post created successfully!');
      
      // Close modal and navigate to feed
      setModalVisible(false);
      navigation.navigate('Feed');
      
    } catch (error) {
      console.error('Error saving post:', error);
      
      // Better error handling for server issues
      let errorMessage = 'Failed to create post';
      if (error.originalStatus === 502) {
        errorMessage = 'Server is currently unavailable. Please try again later.';
      } else if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.status) {
        errorMessage = `Server error (${error.status}). Please try again.`;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    // Navigate to feed when closing
    navigation.navigate('Feed');
  };

  return (
    <View style={{ flex: 1 }}>
      <PostCreationModal
        visible={modalVisible}
        onClose={handleClose}
        onSubmit={handleCreatePost}
        editMode={false}
      />
    </View>
  );
};

export default CreateScreen;