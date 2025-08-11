import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreatePostMutation } from '../services/apiService';
import PostCreationModal from './PostCreationModal';
import { createFormData, preparePostData } from '../utils/formUtils';

const NewButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [createPost] = useCreatePostMutation();
  const navigation = useNavigation();

  const handleCreatePost = async (formData) => {
    try {
      console.log('Creating post:', formData);
      
      // Prepare post data using Murray's pattern
      const postData = preparePostData(formData);
      
      // Create FormData using the utility function
      const form = createFormData(postData);

      // Make API call
      await createPost(form).unwrap();
      
      // Close modal and navigate back to Feed tab
      setModalVisible(false);
      navigation.navigate('Feed');
      
      Alert.alert('Success', 'Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      
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

  // This component triggers the modal when the tab is pressed
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      // Prevent the default navigation behavior
      e.preventDefault();
      
      // Open the modal instead
      setModalVisible(true);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <View>
      <PostCreationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  );
};

export default NewButton;