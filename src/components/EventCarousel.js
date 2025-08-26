import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useModal } from '../contexts/ModalContext';
import FAIcon from './FAIcon';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.8;
const CARD_MARGIN = 10;

const EventCarousel = ({ events = [], displayOptions = {} }) => {
  const navigation = useNavigation();
  const { showPostModal } = useModal();
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = useRef(new Animated.Value(0)).current;
  const baseTranslateX = useRef(new Animated.Value(0)).current;

  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-10, 10])
    .onUpdate((event) => {
      const cardWidth = CARD_WIDTH + CARD_MARGIN * 2;
      const currentOffset = -currentIndex * cardWidth;
      const newValue = currentOffset + event.translationX;
      
      // Add some resistance at the boundaries
      const maxOffset = 0;
      const minOffset = -(events.length - 1) * cardWidth;
      
      let constrainedValue = newValue;
      if (newValue > maxOffset) {
        constrainedValue = maxOffset + (newValue - maxOffset) * 0.3;
      } else if (newValue < minOffset) {
        constrainedValue = minOffset + (newValue - minOffset) * 0.3;
      }
      
      translateX.setValue(constrainedValue);
    })
    .onEnd((event) => {
      const { translationX, velocityX } = event;
      const cardWidth = CARD_WIDTH + CARD_MARGIN * 2;
      
      let newIndex = currentIndex;
      
      // Determine swipe direction and threshold
      if (Math.abs(translationX) > cardWidth * 0.25 || Math.abs(velocityX) > 300) {
        if (translationX > 0 && currentIndex > 0) {
          newIndex = currentIndex - 1;
        } else if (translationX < 0 && currentIndex < events.length - 1) {
          newIndex = currentIndex + 1;
        }
      }
      
      // Clamp the new index to valid bounds (no infinite scrolling)
      newIndex = Math.max(0, Math.min(newIndex, events.length - 1));
      
      // Animate to the target position smoothly
      const targetX = -newIndex * cardWidth;
      
      Animated.timing(translateX, {
        toValue: targetX,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentIndex(newIndex);
      });
    });

  const getImageSource = (event) => {
    if (event?.gallery?.[0]?.filename) {
      return { uri: `https://partstash-ghia-images.s3.us-west-2.amazonaws.com/${event.gallery[0].filename}` };
    }
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const formatEventDate = (event) => {
    // For recurring events, show the recurring frequency
    if (event.event_type === 'recurring' && event.recurring_frequency) {
      return event.recurring_frequency;
    }
    // For single events, show the event date
    if (event.event_date) {
      return formatDate(event.event_date);
    }
    // Fallback to created date
    return formatDate(event.created_at);
  };

  const handleViewMore = (event) => {
    // Use the same modal system that Card components use
    // This will automatically use the PostDetailModal with our event handling
    if (showPostModal) {
      showPostModal(event);
    } else {
      console.warn('showPostModal not available');
    }
  };


  const renderEventCard = (event, index) => {
    const imageSource = getImageSource(event);

    return (
      <View
        key={event._id || event.internal_id || index}
        style={[
          styles.eventCard,
          index === currentIndex && styles.activeCard
        ]}
      >
        {/* Event Image */}
        <View style={styles.imageContainer}>
          {imageSource ? (
            <Image source={imageSource} style={styles.eventImage} />
          ) : (
            <View style={[styles.eventImage, styles.placeholderImage]}>
              <FAIcon name="calendar" size={48} color={colors.WHITE} />
            </View>
          )}
          
          {/* Date Badge */}
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{formatEventDate(event)}</Text>
          </View>
        </View>

        {/* Event Content */}
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.title || 'Untitled Event'}
          </Text>

          {/* Event Details */}
          <View style={styles.eventDetails}>
            {event.location && (
              <View style={styles.detailItem}>
                <FAIcon name="map-marker" size={12} color={colors.TEXT_SECONDARY} />
                <Text style={styles.detailText}>{event.location}</Text>
              </View>
            )}
            
            {event.type && (
              <View style={styles.detailItem}>
                <FAIcon name="tag" size={12} color={colors.TEXT_SECONDARY} />
                <Text style={styles.detailText}>{event.type}</Text>
              </View>
            )}

            {event.event_time && (
              <View style={styles.detailItem}>
                <FAIcon name="clock" size={12} color={colors.TEXT_SECONDARY} />
                <Text style={styles.detailText}>{event.event_time}</Text>
              </View>
            )}
          </View>

          {/* View More Button */}
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => handleViewMore(event)}
            activeOpacity={0.8}
          >
            <Text style={styles.viewMoreText}>View More</Text>
            <FAIcon name="chevron-right" size={14} color={colors.WHITE} />
          </TouchableOpacity>

          {/* Footer with user info if available */}
          {event.user && (
            <View style={styles.eventFooter}>
              <View style={styles.userInfo}>
                <View style={styles.userAvatar}>
                  <FAIcon name="user" size={16} color={colors.WHITE} />
                </View>
                <Text style={styles.userName}>
                  {event.user.username || 'Anonymous'}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (!events || events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <FAIcon name="calendar" size={48} color={colors.TEXT_SECONDARY} />
        <Text style={styles.emptyTitle}>No Events Found</Text>
        <Text style={styles.emptyText}>
          This user hasn't posted any events yet.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={styles.carouselWrapper}>
          <Animated.View 
            style={[
              styles.carouselContent,
              {
                transform: [{ translateX }],
                width: events.length * (CARD_WIDTH + CARD_MARGIN * 2),
              }
            ]}
          >
            {events && events.length > 0 ? (
              events.map((event, index) => renderEventCard(event, index))
            ) : (
              <View style={styles.emptyContainer}>
                <FAIcon name="calendar" size={32} color={colors.TEXT_SECONDARY} />
                <Text style={styles.emptyText}>No events to display</Text>
              </View>
            )}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      
      {/* Pagination Dots */}
      {events.length > 1 && (
        <View style={styles.pagination}>
          {events.map((_, index) => (
            <View
              key={index}
              style={[
                styles.paginationDot,
                index === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
  },
  carouselWrapper: {
    overflow: 'hidden',
    paddingBottom: 0,
  },
  carouselContent: {
    flexDirection: 'row',
    paddingHorizontal: screenWidth * 0.1, // This creates the peeking effect
    paddingVertical: 20,
  },
  eventCard: {
    width: CARD_WIDTH,
    marginHorizontal: CARD_MARGIN,
    backgroundColor: colors.WHITE,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  activeCard: {
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 9/16,
    overflow: 'hidden',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  eventImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.LIGHT_GRAY,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BRG,
  },
  dateBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dateText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
    lineHeight: 24,
  },
  eventDescription: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 12,
  },
  eventDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  eventFooter: {
    marginTop: 'auto',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.BORDER,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 12,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.GRAY,
  },
  activeDot: {
    backgroundColor: colors.BRG,
    width: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.WHITE,
  },
});

export default EventCarousel;