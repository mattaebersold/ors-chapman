import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const ImageUploader = ({ images = [], onImagesChange, maxImages = 10 }) => {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload images.'
      );
      return false;
    }
    return true;
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      Alert.alert('Limit Reached', `You can only upload ${maxImages} images.`);
      return;
    }

    try {
      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets) {
        const selectedImages = result.assets.slice(0, remainingSlots);
        const newImages = selectedImages.map((asset, index) => ({
          id: `${Date.now()}_${index}`,
          uri: asset.uri,
          filename: asset.fileName || `image_${Date.now()}_${index}.jpg`,
          type: asset.type || 'image/jpeg',
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          isNew: true,
        }));

        // Validate image sizes
        const validImages = newImages.filter(image => {
          if (image.fileSize && image.fileSize > 10 * 1024 * 1024) { // 10MB limit
            Alert.alert('File Too Large', `${image.filename} is too large. Please choose images under 10MB.`);
            return false;
          }
          return true;
        });

        if (validImages.length > 0) {
          const updatedImages = [...images, ...validImages];
          onImagesChange(updatedImages);
        }
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    // Request camera permissions
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    if (cameraPermission.status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take photos.'
      );
      return;
    }

    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only upload ${maxImages} images.`);
      return;
    }

    try {
      setUploading(true);
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newImage = {
          id: `${Date.now()}`,
          uri: asset.uri,
          filename: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          width: asset.width,
          height: asset.height,
          fileSize: asset.fileSize,
          isNew: true,
        };

        // Validate image size
        if (newImage.fileSize && newImage.fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Photo is too large. Please try again.');
          return;
        }

        const updatedImages = [...images, newImage];
        onImagesChange(updatedImages);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (imageId) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onImagesChange(updatedImages);
  };

  const moveImage = (fromIndex, toIndex) => {
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onImagesChange(updatedImages);
  };

  const showActionSheet = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: takePhoto },
        { text: 'Photo Library', onPress: pickImages },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Image Grid */}
      {images.length > 0 && (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.imageScrollView}
          contentContainerStyle={styles.imageScrollContent}
        >
          {images.map((image, index) => (
            <View key={image.id} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              
              {/* Remove button */}
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(image.id)}
              >
                <FAIcon name="times" size={12} color={colors.WHITE} />
              </TouchableOpacity>

              {/* Order indicator */}
              {images.length > 1 && (
                <View style={styles.orderIndicator}>
                  <Text style={styles.orderText}>{index + 1}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* Add Photos Button */}
      <TouchableOpacity
        style={[
          styles.addButton,
          images.length >= maxImages && styles.addButtonDisabled,
          uploading && styles.addButtonDisabled
        ]}
        onPress={showActionSheet}
        disabled={images.length >= maxImages || uploading}
      >
        {uploading ? (
          <ActivityIndicator size="small" color={colors.BRG} />
        ) : (
          <View style={styles.addButtonContent}>
            <FAIcon name="plus" size={20} color={colors.BRG} />
            <Text style={styles.addButtonText}>
              {images.length === 0 ? 'Add Photos' : `Add More (${images.length}/${maxImages})`}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Help Text */}
      <Text style={styles.helpText}>
        Tap to add photos from your camera or photo library. You can add up to {maxImages} images.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  imageScrollView: {
    marginBottom: 16,
  },
  imageScrollContent: {
    paddingRight: 16,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.ERROR,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  orderIndicator: {
    position: 'absolute',
    bottom: -8,
    left: -8,
    backgroundColor: colors.BRG,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  orderText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: colors.WHITE,
    borderWidth: 2,
    borderColor: colors.BRG,
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonContent: {
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.BRG,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  helpText: {
    fontSize: 12,
    color: colors.GRAY,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
});

export default ImageUploader;