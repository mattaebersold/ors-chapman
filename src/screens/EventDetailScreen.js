import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from '../components/FAIcon';

const { width } = Dimensions.get('window');

const EventDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { event, eventId } = route.params || {};

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
        <Text style={styles.title}>{event.title || 'Untitled Event'}</Text>

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
      </View>
    </ScrollView>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 20,
    lineHeight: 34,
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
});

export default EventDetailScreen;