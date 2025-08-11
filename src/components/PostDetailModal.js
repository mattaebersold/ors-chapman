import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  Platform,
  Share,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';
import Badge from './Badge';
import UserBadge from './UserBadge';
import CarBadge from './CarBadge';
import Likes from './Likes';
import Comments from './Comments';

const { width, height } = Dimensions.get('window');

const PostDetailModal = ({ visible, post, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!post) return null;

  // Detect if this is an event and adapt the data structure
  const isEvent = post.event_type || post.event_date || post.recurring_frequency;
  
  // Create a normalized data structure for both posts and events
  const normalizedData = {
    title: post.title || 'Untitled',
    body: post.body || post.description || '',
    type: isEvent ? (post.event_type === 'recurring' ? 'Recurring Event' : 'Event') : (post.type || 'Post'),
    category: post.category || '',
    gallery: post.gallery || [],
    created_at: post.created_at,
    user_id: post.user_id,
    car_id: post.car_id,
    internal_id: post.internal_id,
    // Event-specific fields
    event_date: post.event_date,
    event_time: post.event_time,
    location: post.location,
    recurring_frequency: post.recurring_frequency,
    event_type: post.event_type,
  };



  // Handle share functionality
  const handleShare = async () => {
    try {
      // Check if sharing is available
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
        return;
      }

      const message = `${normalizedData.title || 'Check out this post'}\n\n${normalizedData.body ? normalizedData.body.replace(/<[^>]*>/g, '').substring(0, 200) + '...' : 'From Open Road Society'}`;

      // If there are images, download and share with text
      if (imageUrls.length > 0) {
        try {
          const imageUrl = imageUrls[0];
          const filename = `shared_image_${Date.now()}.jpg`;
          const fileUri = FileSystem.documentDirectory + filename;
          
          // Download the image
          const downloadResult = await FileSystem.downloadAsync(imageUrl, fileUri);
          
          if (downloadResult.status === 200) {
            // Try platform-specific approaches for sharing image with text
            if (Platform.OS === 'ios') {
              // iOS: Use React Native Share with both image and text
              try {
                await Share.share({
                  message: message,
                  title: post.title || 'Check out this post',
                  url: downloadResult.uri, // iOS can handle local file URLs
                }, {
                  dialogTitle: post.title || 'Share this post',
                  subject: post.title || 'Check out this post',
                });
              } catch (iosShareError) {
                console.log('iOS share failed, trying Expo sharing:', iosShareError);
                // Fallback to Expo sharing
                await Sharing.shareAsync(downloadResult.uri, {
                  dialogTitle: post.title || 'Share this post',
                  UTI: 'public.jpeg',
                });
              }
            } else {
              // Android: Use a different approach
              try {
                // First try React Native Share with image URL
                await Share.share({
                  message: message,
                  title: post.title || 'Check out this post',
                  url: `file://${downloadResult.uri}`,
                }, {
                  dialogTitle: post.title || 'Share this post',
                  subject: post.title || 'Check out this post',
                });
              } catch (androidShareError) {
                console.log('Android share failed, trying sequential approach:', androidShareError);
                // Sequential approach: Share image first, then text
                await Sharing.shareAsync(downloadResult.uri, {
                  dialogTitle: post.title || 'Share this post',
                  UTI: 'public.jpeg',
                });
                
                // Give user time to complete image share, then offer text
                setTimeout(async () => {
                  try {
                    Alert.alert(
                      'Share Text',
                      'Would you like to also share the post text?',
                      [
                        { text: 'No', style: 'cancel' },
                        {
                          text: 'Yes',
                          onPress: async () => {
                            await Share.share({
                              message: message,
                              title: post.title || 'Check out this post',
                            });
                          }
                        }
                      ]
                    );
                  } catch (textShareError) {
                    console.log('Text share failed:', textShareError);
                  }
                }, 1000);
              }
            }
            
            // Clean up the downloaded file after sharing
            setTimeout(async () => {
              try {
                await FileSystem.deleteAsync(downloadResult.uri, { idempotent: true });
              } catch (cleanupError) {
                console.log('Cleanup failed:', cleanupError);
              }
            }, 5000); // Increased delay to ensure sharing is complete
            
          } else {
            throw new Error('Failed to download image');
          }
        } catch (imageError) {
          console.log('Image sharing failed, falling back to text only:', imageError);
          // Fallback to text-only sharing
          await Share.share({
            message: message,
            title: post.title || 'Check out this post',
          }, {
            dialogTitle: 'Share this post',
            subject: post.title || 'Check out this post',
          });
        }
      } else {
        // No images, share text only
        await Share.share({
          message: message,
          title: post.title || 'Check out this post',
        }, {
          dialogTitle: 'Share this post',
          subject: post.title || 'Check out this post',
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Share Failed', 'Unable to share this post. Please try again.');
    }
  };

  // Create image URLs for gallery
  const imageUrls = normalizedData.gallery 
    ? normalizedData.gallery.map(img => `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${img.filename}`)
    : [];

  const renderImageCarousel = () => {
    if (imageUrls.length === 0) return null;

    const renderImage = ({ item, index }) => (
      <Image 
        source={{ uri: item }} 
        style={styles.carouselImage}
        resizeMode="cover"
        onError={(error) => console.log('Image load error:', error.nativeEvent.error)}
      />
    );

    const handleScroll = (event) => {
      const scrollPosition = event.nativeEvent.contentOffset.x;
      const index = Math.round(scrollPosition / width);
      setCurrentImageIndex(index);
    };

    return (
      <View style={styles.carouselContainer}>
        <FlatList
          data={imageUrls}
          renderItem={renderImage}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyExtractor={(item, index) => index.toString()}
        />
        
        {imageUrls.length > 1 && (
          <View style={styles.pagination}>
            {imageUrls.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentImageIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
        
        {imageUrls.length > 1 && (
          <View style={styles.imageCounter}>
            <Text style={styles.imageCounterText}>
              {currentImageIndex + 1} / {imageUrls.length}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Close</Text>
          </TouchableOpacity>
          <Text style={styles.title}>{normalizedData.type || 'Post'}</Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <FAIcon name="share" size={20} color={colors.WHITE} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Image Carousel */}
            {renderImageCarousel()}

            {/* Post Info */}
            <View style={styles.postInfo}>
              <Badge type={normalizedData.type} category={normalizedData.category} style="inline" />
              <Text style={styles.postTitle}>{normalizedData.title}</Text>
              
              <View style={styles.metaRow}>
                <View style={styles.badgeRow}>
                  {normalizedData.user_id && <UserBadge userId={normalizedData.user_id} />}
                  {normalizedData.car_id && <CarBadge carId={normalizedData.car_id} />}
                </View>
                <Text style={styles.date}>
                  {new Date(normalizedData.created_at).toLocaleDateString()}
                </Text>
              </View>

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

              {/* Additional Details */}
              <View style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Details</Text>
                
                {normalizedData.type && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Type:</Text>
                    <Text style={styles.detailValue}>{normalizedData.type}</Text>
                  </View>
                )}

                {normalizedData.user_id && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Author:</Text>
                    <Text style={styles.detailValue}>{normalizedData.user_id}</Text>
                  </View>
                )}

                {normalizedData.gallery && normalizedData.gallery.length > 1 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Images:</Text>
                    <Text style={styles.detailValue}>{normalizedData.gallery.length} photos</Text>
                  </View>
                )}
              </View>
            </View>
          </ScrollView>
      </View>
    </Modal>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_GRAY,
  },
  cancelButton: {
    color: colors.WHITE,
    fontSize: 16,
  },
  title: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  shareButton: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
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
    padding: 20,
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
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.LIGHT_GRAY,
    paddingTop: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.BACKGROUND,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
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
});

export default PostDetailModal;