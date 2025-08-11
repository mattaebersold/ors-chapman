import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCreatePostMutation } from '../services/apiService';
import PostCreationModal from './PostCreationModal';
import { createFormData, preparePostData } from '../utils/formUtils';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const NewButtonFAB = () => {
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

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <FAIcon name="plus" size={24} color={colors.WHITE} />
      </TouchableOpacity>

      {/* Post Creation Modal */}
      <PostCreationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default NewButtonFAB;