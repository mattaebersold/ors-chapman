import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import Tags from '../components/overlays/Tags';
import UserBadge from '../components/overlays/UserBadge';
import CarBadge from '../components/overlays/CarBadge';
import Likes from '../components/Likes';
import Comments from '../components/Comments';
import ImageGalleryModal from '../components/modals/ImageGalleryModal';
import GradientPlaceholder from '../components/ui/GradientPlaceholder';
import { useModal } from '../contexts/ModalContext';
import { useBanner } from '../contexts/BannerContext';
import { useDeletePostMutation, useGetUserDetailsQuery, useGetArticleQuery } from '../services/apiService';
import { WebView } from 'react-native-webview';

const { width, height } = Dimensions.get('window');

const ArticleDetailScreen = ({ route, navigation }) => {
  const { article, articleId } = route.params || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [imageGalleryModalVisible, setImageGalleryModalVisible] = useState(false);
  const [imageGalleryStartIndex, setImageGalleryStartIndex] = useState(0);
  const { userInfo } = useSelector(state => state.auth);
  const { data: currentUser } = useGetUserDetailsQuery();
  const { showEditPostModal } = useModal();

  // Fetch article if we only have the ID
  const { data: fetchedArticle, isLoading, error } = useGetArticleQuery(articleId, {
    skip: !!article || !articleId
  });

  // Use provided article or fetched article - handle nested response
  const articleData = article || fetchedArticle?.entry || fetchedArticle;

  // Try to use banner context, fallback to Alert if not available
  let showSuccess, showError;
  try {
    const banner = useBanner();
    showSuccess = banner.showSuccess;
    showError = banner.showError;
  } catch (error) {
    // Fallback to Alert if BannerProvider is not available
    showSuccess = (message) => Alert.alert('Success', message);
    showError = (message) => Alert.alert('Error', message);
  }
  const [deletePost] = useDeletePostMutation();

  if (!articleData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <FAIcon name="times" size={16} color={colors.WHITE} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Article not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if current user owns this article
  const isOwner = currentUser && articleData && (
    currentUser.user_id === articleData.user_id
  );

  const handleClose = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setShowActions(false);
    handleClose();
    showEditPostModal(articleData);
  };

  const handleDelete = () => {
    setShowActions(false);
    Alert.alert(
      'Delete Article',
      'Are you sure you want to delete this article? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(articleData.internal_id || articleData._id).unwrap();
              handleClose();
              showSuccess('Article deleted successfully');
            } catch (error) {
              console.error('Delete article error:', error);
              showError('Failed to delete article. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this article: ${articleData.title}\n\nhttps://opensociety.app/article/${articleData.internal_id || articleData._id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Render image carousel
  const renderImageCarousel = () => {
    const gallery = articleData.gallery || [];
    const banners = articleData.banners || [];
    const images = [...banners, ...gallery];

    if (images.length === 0) {
      return <GradientPlaceholder width={width} height={300} icon="image" text="No images" />;
    }

    const renderCarouselItem = ({ item, index }) => {
      const filename = item.filename || item;
      return (
        <TouchableOpacity
          onPress={() => {
            setImageGalleryStartIndex(index);
            setImageGalleryModalVisible(true);
          }}
        >
          <Image
            source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${filename}` }}
            style={styles.carouselImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      );
    };

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={images}
          renderItem={renderCarouselItem}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setCurrentImageIndex(index);
          }}
          scrollEventThrottle={16}
        />

        {/* Image counter */}
        <View style={styles.imageCounter}>
          <Text style={styles.imageCounterText}>
            {currentImageIndex + 1} / {images.length}
          </Text>
        </View>

        {/* Pagination dots */}
        {images.length > 1 && (
          <View style={styles.pagination}>
            {images.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  };

  // Strip HTML tags and process shortcodes for display
  const processArticleBody = (htmlBody) => {
    if (!htmlBody) return '';

    // Simple HTML tag removal
    let text = htmlBody.replace(/<[^>]*>/g, ' ');

    // Remove shortcodes [img:...] since we can't render them inline easily in React Native
    text = text.replace(/\[img:[^\]]+\]/g, '');

    // Clean up multiple spaces
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <FAIcon name="times" size={16} color={colors.WHITE} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <FAIcon name="share" size={12} color={colors.WHITE} />
            <Text style={styles.shareText}>SHARE</Text>
          </TouchableOpacity>

          {isOwner && (
            <View style={styles.ownerActionsContainer}>
              <TouchableOpacity
                onPress={() => setShowActions(!showActions)}
                style={styles.ownerActionsButton}
              >
                <FAIcon name="ellipsis-v" size={12} color={colors.WHITE} />
              </TouchableOpacity>

              {showActions && (
                <View style={styles.actionsMenu}>
                  <TouchableOpacity onPress={handleEdit} style={styles.actionItem}>
                    <FAIcon name="edit" size={14} color={colors.TEXT_PRIMARY} />
                    <Text style={styles.actionText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleDelete} style={[styles.actionItem, styles.deleteAction]}>
                    <FAIcon name="trash" size={14} color={colors.ERROR} />
                    <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        {renderImageCarousel()}

        {/* Article info */}
        <View style={styles.articleInfo}>
          {/* Type & Category Badges */}
          <Tags entryType="article" type={articleData.type} category={articleData.category} style="inline" />

          {/* Title */}
          <Text style={styles.articleTitle}>{articleData.title}</Text>

          {/* Posted By */}
          {articleData.user_id && (
            <View style={styles.postedByContainer}>
              <Text style={styles.sectionLabel}>By</Text>
              <UserBadge userId={articleData.user_id} />
              <Text style={styles.date}>
                {new Date(articleData.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}

          {/* Associated Car */}
          {articleData.car_id && (
            <View style={styles.associationContainer}>
              <Text style={styles.sectionLabel}>Featured Car</Text>
              <CarBadge carId={articleData.car_id} />
            </View>
          )}

          {/* Article Body */}
          {articleData.body && (
            <View style={styles.bodyContainer}>
              <Text style={styles.bodyText}>
                {processArticleBody(articleData.body)}
              </Text>
            </View>
          )}

          {/* Likes and Comments */}
          <View style={styles.socialContainer}>
            <Likes document_id={articleData.internal_id || articleData._id} document_type="article" />
            <Comments document_id={articleData.internal_id || articleData._id} document_type="article" />
          </View>
        </View>
      </ScrollView>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={imageGalleryModalVisible}
        images={[...(articleData.banners || []), ...(articleData.gallery || [])]}
        onClose={() => setImageGalleryModalVisible(false)}
        title={articleData.title || 'Article Images'}
        initialIndex={imageGalleryStartIndex}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_GRAY,
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
  },
  shareText: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 6,
  },
  ownerActionsContainer: {
    position: 'relative',
  },
  ownerActionsButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12
  },
  actionsMenu: {
    position: 'absolute',
    top: 45,
    right: 0,
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  deleteAction: {
    borderBottomWidth: 0,
  },
  actionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  deleteText: {
    color: colors.ERROR,
  },
  content: {
    flex: 1,
    backgroundColor: colors.WHITE,
  },
  carouselContainer: {
    position: 'relative',
    backgroundColor: colors.BLACK,
  },
  carouselImage: {
    width: width,
    height: 300,
  },
  pagination: {
    position: 'absolute',
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: '#fff',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  imageCounter: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  articleInfo: {
    padding: 12,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  postedByContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  associationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
  },
  date: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  bodyContainer: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: colors.BACKGROUND,
    borderRadius: 8,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.TEXT_PRIMARY,
  },
  socialContainer: {
    marginBottom: 20,
    gap: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
  },
});

export default ArticleDetailScreen;
