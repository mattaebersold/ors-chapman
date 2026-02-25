import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import { useGetEventGalleryBucketImagesQuery } from '../../services/apiService';
import ImageGalleryModal from './ImageGalleryModal';

const { width } = Dimensions.get('window');

const EventGalleryDetailModal = ({ visible, onClose, gallery }) => {
  const [fullscreenGalleryOpen, setFullscreenGalleryOpen] = useState(false);
  const [fullscreenInitialIndex, setFullscreenInitialIndex] = useState(0);
  const [fullscreenImages, setFullscreenImages] = useState([]);

  // Fetch S3 bucket images if aws_bucket_id exists
  const { data: bucketData, isLoading: bucketLoading, error: bucketError } = useGetEventGalleryBucketImagesQuery(
    gallery?.aws_bucket_id,
    { skip: !gallery?.aws_bucket_id || !visible }
  );

  if (!gallery) return null;

  const bucketImages = bucketData?.images || [];

  const handleImageClick = (images, index) => {
    setFullscreenImages(images);
    setFullscreenInitialIndex(index);
    setFullscreenGalleryOpen(true);
  };

  const handleGalleryImageClick = (index) => {
    // Use gallery images
    const images = gallery.gallery.map(img => img.filename);
    handleImageClick(images, index);
  };

  const handleBucketImageClick = (index) => {
    // Use bucket image URLs
    const images = bucketImages.map(img => img.url);
    handleImageClick(images, index);
  };

  const renderGalleryImage = ({ item, index }) => {
    const imageSource = { uri: `https://d2481n2uw7a0p.cloudfront.net/${item.filename}` };

    return (
      <TouchableOpacity
        style={styles.galleryImageContainer}
        onPress={() => handleGalleryImageClick(index)}
      >
        <Image source={imageSource} style={styles.galleryImage} />
        <View style={styles.expandIconContainer}>
          <FAIcon name="expand" size={16} color={colors.WHITE} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderBucketImage = ({ item, index }) => {
    const imageSource = { uri: item.url };

    return (
      <TouchableOpacity
        style={styles.galleryImageContainer}
        onPress={() => handleBucketImageClick(index)}
      >
        <Image source={imageSource} style={styles.galleryImage} />
        <View style={styles.expandIconContainer}>
          <FAIcon name="expand" size={16} color={colors.WHITE} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FAIcon name="times" size={20} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.title}>{gallery.title}</Text>
            </View>

            <View style={styles.headerRight} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Gallery Description */}
            {gallery.body && (
              <View style={styles.section}>
                <Text style={styles.description}>{gallery.body}</Text>
              </View>
            )}

            {/* Gallery created date */}
            {gallery.created_at && (
              <View style={styles.section}>
                <Text style={styles.metaText}>
                  Created: {new Date(gallery.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            )}

            {/* Uploaded Gallery Images */}
            {gallery.gallery && gallery.gallery.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Uploaded Photos ({gallery.gallery.length})
                </Text>
                <FlatList
                  data={gallery.gallery}
                  renderItem={renderGalleryImage}
                  keyExtractor={(item, index) => `gallery-${index}`}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.columnWrapper}
                />
              </View>
            )}

            {/* S3 Bucket Images */}
            {gallery.aws_bucket_id && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Gallery {bucketImages.length > 0 && `(${bucketImages.length})`}
                </Text>

                {bucketLoading && (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.BRG} />
                    <Text style={styles.loadingText}>Loading images...</Text>
                  </View>
                )}

                {bucketError && (
                  <View style={styles.errorContainer}>
                    <FAIcon name="exclamation-circle" size={32} color={colors.ERROR} />
                    <Text style={styles.errorText}>Error loading bucket images</Text>
                  </View>
                )}

                {!bucketLoading && !bucketError && bucketImages.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <FAIcon name="image" size={32} color={colors.TEXT_SECONDARY} />
                    <Text style={styles.emptyText}>No images found in this bucket</Text>
                  </View>
                )}

                {!bucketLoading && !bucketError && bucketImages.length > 0 && (
                  <FlatList
                    data={bucketImages}
                    renderItem={renderBucketImage}
                    keyExtractor={(item, index) => `bucket-${index}`}
                    numColumns={2}
                    scrollEnabled={false}
                    columnWrapperStyle={styles.columnWrapper}
                  />
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Fullscreen Image Gallery */}
      {fullscreenGalleryOpen && fullscreenImages.length > 0 && (
        <ImageGalleryModal
          visible={fullscreenGalleryOpen}
          images={fullscreenImages}
          initialIndex={fullscreenInitialIndex}
          onClose={() => setFullscreenGalleryOpen(false)}
          title={gallery.title}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  closeButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  headerRight: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    lineHeight: 24,
  },
  metaText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  galleryImageContainer: {
    width: (width - 64) / 2, // Account for margins and padding
    height: (width - 64) / 2,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  expandIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.ERROR,
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
  },
});

export default EventGalleryDetailModal;
