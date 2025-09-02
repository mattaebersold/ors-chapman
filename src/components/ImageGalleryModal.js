import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const ImageGalleryModal = ({ visible, images, onClose, title = "Gallery" }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when modal becomes visible
  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
    }
  }, [visible]);

  if (!images || images.length === 0) {
    return null;
  }

  const getImageSource = (image) => {
    if (typeof image === 'string') {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${image}` };
    }
    if (image?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${image.filename}` };
    }
    return null;
  };

  const renderMainImage = () => {
    const imageSource = getImageSource(images[currentIndex]);
    if (!imageSource) return null;

    return (
      <View style={styles.mainImageContainer}>
        <Image
          source={imageSource}
          style={styles.mainImage}
          resizeMode="contain"
        />
        {images.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentIndex + 1} of {images.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderThumbnail = ({ item, index }) => {
    const imageSource = getImageSource(item);
    if (!imageSource) return null;

    return (
      <TouchableOpacity
        style={[
          styles.thumbnail,
          currentIndex === index && styles.activeThumbnail
        ]}
        onPress={() => setCurrentIndex(index)}
      >
        <Image
          source={imageSource}
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Main Image */}
        {renderMainImage()}

        {/* Thumbnails */}
        {images.length > 1 && (
          <View style={styles.thumbnailsContainer}>
            <FlatList
              data={images}
              renderItem={renderThumbnail}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsList}
            />
          </View>
        )}

        {/* Navigation Arrows for single image view */}
        {images.length > 1 && (
          <>
            {currentIndex > 0 && (
              <TouchableOpacity
                style={[styles.navButton, styles.prevButton]}
                onPress={() => setCurrentIndex(currentIndex - 1)}
              >
                <FAIcon name="chevron-left" size={24} color={colors.WHITE} />
              </TouchableOpacity>
            )}
            {currentIndex < images.length - 1 && (
              <TouchableOpacity
                style={[styles.navButton, styles.nextButton]}
                onPress={() => setCurrentIndex(currentIndex + 1)}
              >
                <FAIcon name="chevron-right" size={24} color={colors.WHITE} />
              </TouchableOpacity>
            )}
          </>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.WHITE,
  },
  closeButton: {
    padding: 8,
  },
  mainImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mainImage: {
    width: screenWidth - 40,
    height: screenHeight * 0.6,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageCounterText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '500',
  },
  thumbnailsContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 15,
  },
  thumbnailsList: {
    paddingHorizontal: 20,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeThumbnail: {
    borderColor: colors.BRG,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -24 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
});

export default ImageGalleryModal;