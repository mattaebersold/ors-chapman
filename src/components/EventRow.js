import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';
import { useGetEventQuery } from '../services/apiService';

const EventRow = ({ eventId, onPress }) => {
  const navigation = useNavigation();

  const { data: event, isLoading, error } = useGetEventQuery(eventId, {
    skip: !eventId
  });

  if (!eventId || isLoading || error || !event) return null;

  const handleEventPress = () => {
    if (onPress) {
      onPress(event);
    } else {
      navigation.navigate('PostDetail', {
        post: event
      });
    }
  };

  const getImageSource = () => {
    if (event?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${event.gallery[0].filename}` };
    }
    return null;
  };

  const getEventTitle = () => {
    if (event.title) return event.title;
    if (event.name) return event.name;
    return 'Event';
  };

  const formatEventDate = () => {
    if (!event.event_date) return null;
    const date = new Date(event.event_date);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handleEventPress}>
      <View style={styles.content}>
        {/* Event Picture */}
        <View style={styles.imageContainer}>
          {getImageSource() ? (
            <Image
              source={getImageSource()}
              style={styles.image}
            />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <FAIcon name="calendar" size={24} color={colors.WHITE} />
            </View>
          )}
        </View>

        {/* Event Info */}
        <View style={styles.eventInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {getEventTitle()}
          </Text>
          {formatEventDate() && (
            <View style={styles.dateRow}>
              <FAIcon name="calendar" size={12} color={colors.TEXT_SECONDARY} style={styles.dateIcon} />
              <Text style={styles.subtitle} numberOfLines={1}>
                {formatEventDate()}
              </Text>
            </View>
          )}
          {event.location && (
            <View style={styles.locationRow}>
              <FAIcon name="map-marker" size={12} color={colors.TEXT_SECONDARY} style={styles.locationIcon} />
              <Text style={styles.detail} numberOfLines={1}>
                {event.location}
              </Text>
            </View>
          )}
        </View>

        {/* Arrow Icon */}
        <FAIcon name="chevron-right" size={16} color={colors.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  imageContainer: {
    marginRight: 12,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
  },
  imagePlaceholder: {
    backgroundColor: colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventInfo: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dateIcon: {
    marginRight: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    marginRight: 4,
  },
  detail: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
  },
});

export default EventRow;
