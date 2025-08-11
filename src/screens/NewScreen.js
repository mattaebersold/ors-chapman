import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { useCreatePostMutation } from '../services/apiService';
import PostCreationModal from '../components/PostCreationModal';
import { createFormData, preparePostData } from '../utils/formUtils';

const NewScreen = () => {
  const { userInfo } = useSelector(state => state.auth);
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

  // Auto-open modal when this screen is focused
  React.useEffect(() => {
    // Open modal immediately when screen loads
    setModalVisible(true);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.message}>Post creation happens via the modal</Text>
      
      <PostCreationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreatePost}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingLeft: 16,
    paddingRight: 16,
  },
  message: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});

export default NewScreen;