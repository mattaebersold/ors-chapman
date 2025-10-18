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
  Platform,
  Share,
  Alert,
  SafeAreaView,
} from 'react-native';
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
import { useDeletePostMutation, useGetUserDetailsQuery } from '../services/apiService';

const { width, height } = Dimensions.get('window');

const PostDetailScreen = ({ route, navigation }) => {
  const { post } = route.params || {};
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showActions, setShowActions] = useState(false);
  const [imageGalleryModalVisible, setImageGalleryModalVisible] = useState(false);
  const [imageGalleryStartIndex, setImageGalleryStartIndex] = useState(0);
  const { userInfo } = useSelector(state => state.auth);
  const { data: currentUser } = useGetUserDetailsQuery();
  const { showEditPostModal } = useModal();

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

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <FAIcon name="times" size={16} color={colors.WHITE} />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Check if current user owns this post
  const isOwner = currentUser && post && (
    currentUser.user_id === post.user_id
  );

  // Detect if this is an event and adapt the data structure
  const isEvent = post.event_type || post.event_date || post.recurring_frequency;

  const handleClose = () => {
    navigation.goBack();
  };

  const handleEdit = () => {
    setShowActions(false);
    handleClose(); // Close the detail screen first
    showEditPostModal(post);
  };

  const handleDelete = () => {
    setShowActions(false);
    Alert.alert(
      'Delete Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
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
              await deletePost(post.internal_id || post._id).unwrap();
              handleClose(); // Close screen after successful deletion
              showSuccess('Post deleted successfully');
            } catch (error) {
              console.error('Delete post error:', error);
              showError('Failed to delete post. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Create a normalized data structure for both posts and events
  const normalizedData = {
    internal_id: post.internal_id || post._id,
    title: post.title || post.name,
    body: post.body || post.description,
    gallery: post.gallery || [],
    user_id: post.user_id,
    username: post.username,
    user: post.user,
    created_at: post.created_at,
    updated_at: post.updated_at,
    type: post.type,
    category: post.category,
    price: post.price,
    previous_price: post.previous_price,
    condition: post.condition,
    make: post.make,
    model: post.model,
    year: post.year,
    event_date: post.event_date,
    event_time: post.event_time,
    location: post.location,
    recurring_frequency: post.recurring_frequency,
    event_type: post.event_type,
  };

  // Handle share functionality
  const handleShare = async () => {
    try {
      if (Platform.OS === 'ios') {
        await Share.share({
          message: `Check out this ${isEvent ? 'event' : 'post'}: ${normalizedData.title}`,
          url: `https://opensociety.app/post/${normalizedData.internal_id}`, // You'll need to replace with your actual domain
        });
      } else {
        await Share.share({
          message: `Check out this ${isEvent ? 'event' : 'post'}: ${normalizedData.title}\n\nhttps://opensociety.app/post/${normalizedData.internal_id}`,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Render image carousel
  const renderImageCarousel = () => {
    if (!normalizedData.gallery || normalizedData.gallery.length === 0) {
      return <GradientPlaceholder width={width} height={300} icon="image" text="No images" />;
    }

    const renderCarouselItem = ({ item, index }) => (
      <TouchableOpacity
        onPress={() => {
          setImageGalleryStartIndex(index);
          setImageGalleryModalVisible(true);
        }}
      >
        <Image
          source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${item.filename || item}` }}
          style={styles.carouselImage}
          resizeMode="cover"
        />
      </TouchableOpacity>
    );

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={normalizedData.gallery}
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
            {currentImageIndex + 1} / {normalizedData.gallery.length}
          </Text>
        </View>

        {/* Pagination dots */}
        {normalizedData.gallery.length > 1 && (
          <View style={styles.pagination}>
            {normalizedData.gallery.map((_, index) => (
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

        {/* Post info */}
        <View style={styles.postInfo}>
          {/* Title */}
          <Text style={styles.postTitle}>{normalizedData.title}</Text>

          {/* Meta info */}
          <View style={styles.metaRow}>
            <View style={styles.badgeRow}>
              <UserBadge user={normalizedData.user || { username: normalizedData.username }} />
              {normalizedData.make && (
                <CarBadge make={normalizedData.make} model={normalizedData.model} year={normalizedData.year} />
              )}
              {normalizedData.type && <Tags text={normalizedData.type} color={colors.BRG} />}
              {normalizedData.category && <Tags text={normalizedData.category} color={colors.GRAY} />}
            </View>
            <Text style={styles.date}>
              {new Date(normalizedData.created_at).toLocaleDateString()}
            </Text>
          </View>

          {/* Listing details for marketplace items */}
          {(normalizedData.price || normalizedData.condition) && (
            <View style={styles.listingDetailsContainer}>
              <Text style={styles.listingDetailsTitle}>Listing Details</Text>
              {normalizedData.price && (
                <View style={styles.listingDetailRow}>
                  <Text style={styles.listingDetailLabel}>Price:</Text>
                  <View style={styles.priceContainer}>
                    {normalizedData.previous_price && (
                      <Text style={styles.previousPrice}>
                        {normalizedData.previous_price.startsWith('$') ? normalizedData.previous_price : `$${normalizedData.previous_price}`}
                      </Text>
                    )}
                    <Text style={styles.listingDetailPrice}>
                      {normalizedData.price.startsWith('$') ? normalizedData.price : `$${normalizedData.price}`}
                    </Text>
                  </View>
                </View>
              )}
              {normalizedData.condition && (
                <View style={styles.listingDetailRow}>
                  <Text style={styles.listingDetailLabel}>Condition:</Text>
                  <Text style={styles.listingDetailValue}>{normalizedData.condition}</Text>
                </View>
              )}
            </View>
          )}

          {/* Body */}
          {normalizedData.body && (
            <View style={styles.bodyContainer}>
              <Text style={styles.bodyText}>
                {normalizedData.body.replace(/<[^>]*>/g, '')} {/* Strip HTML tags */}
              </Text>
            </View>
          )}

          {/* Event-specific details */}
          {isEvent && (
            <View style={styles.eventDetailsContainer}>
              {normalizedData.event_date && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailLabel}>Date:</Text>
                  <Text style={styles.eventDetailValue}>
                    {new Date(normalizedData.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </View>
              )}

              {normalizedData.event_time && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailLabel}>Time:</Text>
                  <Text style={styles.eventDetailValue}>{normalizedData.event_time}</Text>
                </View>
              )}

              {normalizedData.location && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailLabel}>Location:</Text>
                  <Text style={styles.eventDetailValue}>{normalizedData.location}</Text>
                </View>
              )}

              {normalizedData.recurring_frequency && (
                <View style={styles.eventDetailRow}>
                  <Text style={styles.eventDetailLabel}>Frequency:</Text>
                  <Text style={styles.eventDetailValue}>{normalizedData.recurring_frequency}</Text>
                </View>
              )}
            </View>
          )}

          {/* Likes and Comments */}
          <View style={styles.socialContainer}>
            <Likes document_id={normalizedData.internal_id} document_type={isEvent ? "event" : "post"} />
            <Comments document_id={normalizedData.internal_id} document_type={isEvent ? "event" : "post"} />
          </View>
        </View>
      </ScrollView>

      {/* Image Gallery Modal */}
      <ImageGalleryModal
        visible={imageGalleryModalVisible}
        images={normalizedData.gallery || []}
        onClose={() => setImageGalleryModalVisible(false)}
        title={normalizedData.title || 'Post Images'}
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
  postInfo: {
    padding: 12,
  },
  postTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  date: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  bodyContainer: {
    marginBottom: 20,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.TEXT_PRIMARY,
  },
  socialContainer: {
    marginBottom: 20,
    gap: 8,
  },
  eventDetailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.BACKGROUND,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.LIGHT_GRAY,
  },
  eventDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    width: 80,
  },
  eventDetailValue: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    flex: 1,
    textAlign: 'right',
  },
  // Listing details styles
  listingDetailsContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.WARNING_BACKGROUND, // Light yellow background
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E68C',
  },
  listingDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  listingDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  listingDetailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  listingDetailPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22', // Forest green
  },
  previousPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: '#888',
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  listingDetailValue: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
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

export default PostDetailScreen;