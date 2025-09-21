import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';
import BaseModal from './BaseModal';
import FAIcon from '../ui/FAIcon';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * MediaModal - A specialized modal for displaying images and media
 * Provides gallery-like functionality with navigation
 */
const MediaModal = ({
  visible,
  onClose,
  images = [],
  initialIndex = 0,
  title,
  showCounter = true,
  showDownload = false,
  onDownload,
  onShare,
  showShare = false,
  ...baseModalProps
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  if (!images.length) {
    return null;
  }

  const currentImage = images[currentIndex];

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const renderHeaderRightButton = () => (
    <View style={styles.headerActions}>
      {showShare && onShare && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onShare(currentImage)}
        >
          <FAIcon name="share" size={20} color={colors.WHITE} />
        </TouchableOpacity>
      )}

      {showDownload && onDownload && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDownload(currentImage)}
        >
          <FAIcon name="download" size={20} color={colors.WHITE} />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderCounter = () => {
    if (!showCounter || images.length <= 1) return null;

    return (
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {currentIndex + 1} of {images.length}
        </Text>
      </View>
    );
  };

  const getImageSource = (image) => {
    if (typeof image === 'string') {
      return { uri: image };
    }
    if (image?.uri || image?.url) {
      return { uri: image.uri || image.url };
    }
    if (image?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${image.filename}` };
    }
    return image;
  };

  const renderImage = () => (
    <View style={styles.imageContainer}>
      <Image
        source={getImageSource(currentImage)}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Navigation Controls */}
      {images.length > 1 && (
        <>
          {currentIndex > 0 && (
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <FAIcon name="chevron-left" size={24} color={colors.WHITE} />
            </TouchableOpacity>
          )}

          {currentIndex < images.length - 1 && (
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <FAIcon name="chevron-right" size={24} color={colors.WHITE} />
            </TouchableOpacity>
          )}
        </>
      )}

      {renderCounter()}
    </View>
  );

  const renderThumbnails = () => {
    if (images.length <= 1) return null;

    return (
      <View style={styles.thumbnailContainer}>
        <FlatList
          data={images}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.thumbnailList}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.thumbnail,
                index === currentIndex && styles.activeThumbnail
              ]}
              onPress={() => setCurrentIndex(index)}
            >
              <Image
                source={getImageSource(item)}
                style={styles.thumbnailImage}
                resizeMode="cover"
              />
            </TouchableOpacity>
          )}
        />
      </View>
    );
  };

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={title}
      headerRightButton={renderHeaderRightButton()}
      scrollable={false}
      keyboardAvoiding={false}
      contentStyle={styles.content}
      {...baseModalProps}
    >
      {renderImage()}
      {renderThumbnails()}
    </BaseModal>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.BLACK,
    padding: 0,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    padding: spacing.sm,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  image: {
    width: screenWidth,
    height: screenHeight * 0.7,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    marginTop: -24,
    padding: spacing.lg,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 24,
  },
  prevButton: {
    left: spacing.lg,
  },
  nextButton: {
    right: spacing.lg,
  },
  counterContainer: {
    position: 'absolute',
    bottom: spacing.lg,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  counterText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  thumbnailContainer: {
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: spacing.sm,
  },
  thumbnailList: {
    paddingHorizontal: spacing.lg,
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: spacing.sm,
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
});

export default MediaModal;