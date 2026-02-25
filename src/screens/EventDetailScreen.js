import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import Likes from '../components/Likes';
import Button from '../components/ui/Button';
import EventGalleryFormModal from '../components/modals/EventGalleryFormModal';
import EventGalleryDetailModal from '../components/modals/EventGalleryDetailModal';
import { useGetEventGalleriesQuery } from '../services/apiService';

const { width } = Dimensions.get('window');

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event, eventId } = route.params || {};
  const userInfo = useSelector((state) => state.auth.userInfo);

  const [galleryFormVisible, setGalleryFormVisible] = useState(false);
  const [galleryDetailVisible, setGalleryDetailVisible] = useState(false);
  const [selectedGallery, setSelectedGallery] = useState(null);

  // Fetch event galleries
  const {
    data: galleriesData,
    isLoading: galleriesLoading,
    refetch: refetchGalleries
  } = useGetEventGalleriesQuery(event?.internal_id || eventId, {
    skip: !event?.internal_id && !eventId
  });

  const eventGalleries = galleriesData?.entries || [];
  const isEventOwner = userInfo && event && userInfo.user_id === event.user_id;

  const handleGalleryClick = (gallery) => {
    setSelectedGallery(gallery);
    setGalleryDetailVisible(true);
  };

  const handleGalleryFormClose = () => {
    setGalleryFormVisible(false);
    refetchGalleries();
  };

  if (!event) {
    return (
      <View style={styles.errorContainer}>
        <FAIcon name="exclamation" size={48} color={colors.ERROR} />
        <Text style={styles.errorText}>Event not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getImageSource = () => {
    if (event?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${event.gallery[0].filename}` };
    }
    return null;
  };

  const formatEventDate = () => {
    if (event.event_type === 'recurring' && event.recurring_frequency) {
      return event.recurring_frequency;
    }
    if (event.event_date) {
      return new Date(event.event_date).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'Date TBD';
  };

  return (
    <>
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <FAIcon name="chevron-left" size={24} color={colors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Event Image */}
      <View style={styles.imageContainer}>
        {getImageSource() ? (
          <Image source={getImageSource()} style={styles.eventImage} />
        ) : (
          <View style={[styles.eventImage, styles.placeholderImage]}>
            <FAIcon name="calendar" size={64} color={colors.WHITE} />
          </View>
        )}
      </View>

      {/* Event Content */}
      <View style={styles.content}>
        {/* Event Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title || 'Untitled Event'}</Text>

          {/* Like Button */}
          <View style={styles.eventActionsContainer}>
            <Likes
              document_id={event._id || event.internal_id}
              document_type="event"
              variant="pill"
              size="medium"
            />
          </View>
        </View>

        {/* Event Date */}
        <View style={styles.detailRow}>
          <FAIcon name="calendar" size={20} color={colors.BRG} />
          <Text style={styles.detailText}>{formatEventDate()}</Text>
        </View>

        {/* Event Time */}
        {event.event_time && (
          <View style={styles.detailRow}>
            <FAIcon name="clock" size={20} color={colors.BRG} />
            <Text style={styles.detailText}>{event.event_time}</Text>
          </View>
        )}

        {/* Event Location */}
        {event.location && (
          <View style={styles.detailRow}>
            <FAIcon name="map-marker" size={20} color={colors.BRG} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        )}

        {/* Event Type */}
        {event.type && (
          <View style={styles.detailRow}>
            <FAIcon name="tag" size={20} color={colors.BRG} />
            <Text style={styles.detailText}>{event.type}</Text>
          </View>
        )}

        {/* Event Description */}
        {event.body && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.body}</Text>
          </View>
        )}

        {/* Event Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>
          
          {event.event_type && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>{event.event_type === 'recurring' ? 'Recurring Event' : 'Single Event'}</Text>
            </View>
          )}

          {event.category && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{event.category}</Text>
            </View>
          )}

          {event.attendee_limit && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Attendee Limit:</Text>
              <Text style={styles.detailValue}>{event.attendee_limit} people</Text>
            </View>
          )}
        </View>

        {/* Event Galleries Section */}
        <View style={styles.galleriesSection}>
          <View style={styles.galleriesSectionHeader}>
            <Text style={styles.sectionTitle}>Event Galleries</Text>
            {isEventOwner && (
              <TouchableOpacity
                onPress={() => setGalleryFormVisible(true)}
                style={styles.addGalleryButton}
              >
                <FAIcon name="plus" size={14} color={colors.WHITE} />
                <Text style={styles.addGalleryButtonText}>Add Gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {galleriesLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.BRG} />
            </View>
          )}

          {!galleriesLoading && eventGalleries.length === 0 && (
            <View style={styles.emptyGalleriesContainer}>
              <FAIcon name="images" size={32} color={colors.TEXT_SECONDARY} />
              <Text style={styles.emptyGalleriesText}>
                {isEventOwner
                  ? 'No galleries yet. Tap "Add Gallery" to create one!'
                  : 'No galleries available for this event'}
              </Text>
            </View>
          )}

          {!galleriesLoading && eventGalleries.length > 0 && (
            <FlatList
              data={eventGalleries}
              keyExtractor={(item) => item.internal_id || item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.galleriesList}
              renderItem={({ item: gallery }) => {
                // Determine thumbnail - first gallery image or first S3 bucket image
                let thumbnailSource = null;
                if (gallery.gallery && gallery.gallery.length > 0) {
                  thumbnailSource = {
                    uri: `https://d2481n2uw7a0p.cloudfront.net/${gallery.gallery[0].filename}`
                  };
                }

                return (
                  <TouchableOpacity
                    style={styles.galleryCard}
                    onPress={() => handleGalleryClick(gallery)}
                  >
                    {thumbnailSource ? (
                      <Image source={thumbnailSource} style={styles.galleryCardImage} />
                    ) : (
                      <View style={[styles.galleryCardImage, styles.galleryCardPlaceholder]}>
                        <FAIcon name="images" size={32} color={colors.WHITE} />
                      </View>
                    )}
                    <View style={styles.galleryCardContent}>
                      <Text style={styles.galleryCardTitle} numberOfLines={2}>
                        {gallery.title}
                      </Text>
                      {gallery.aws_bucket_id && (
                        <View style={styles.bucketBadge}>
                          <FAIcon name="folder" size={10} color={colors.BRG} />
                          <Text style={styles.bucketBadgeText}>S3 Bucket</Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </ScrollView>

    {/* Modals */}
    <EventGalleryFormModal
      visible={galleryFormVisible}
      onClose={handleGalleryFormClose}
      eventId={event?.internal_id || eventId}
      onSuccess={refetchGalleries}
    />

    <EventGalleryDetailModal
      visible={galleryDetailVisible}
      onClose={() => setGalleryDetailVisible(false)}
      gallery={selectedGallery}
    />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: 300,
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    lineHeight: 34,
    flex: 1,
    marginRight: 12,
  },
  eventActionsContainer: {
    marginTop: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    width: 120,
  },
  detailValue: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    flex: 1,
  },
  descriptionSection: {
    marginTop: 24,
    marginBottom: 24,
  },
  detailsSection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    lineHeight: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: colors.ERROR,
    marginTop: 16,
    marginBottom: 20,
  },
  backButtonText: {
    color: colors.BRG,
    fontSize: 16,
    fontWeight: '600',
  },
  galleriesSection: {
    marginTop: 24,
  },
  galleriesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addGalleryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  addGalleryButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyGalleriesContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: colors.CARD_BG,
    borderRadius: 12,
  },
  emptyGalleriesText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 20,
  },
  galleriesList: {
    paddingRight: 20,
  },
  galleryCard: {
    width: 200,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: colors.WHITE,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  galleryCardImage: {
    width: '100%',
    height: 120,
  },
  galleryCardPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryCardContent: {
    padding: 12,
  },
  galleryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  bucketBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG_LIGHT,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    gap: 4,
  },
  bucketBadgeText: {
    fontSize: 10,
    color: colors.BRG,
    fontWeight: '600',
  },
});

export default EventDetailScreen;