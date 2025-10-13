import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../constants/colors';
import BaseCard from './BaseCard';
import UserBadge from '../overlays/UserBadge';

const EventCard = ({ event, displayOptions = {} }) => {
  const navigation = useNavigation();
  if (!event) return null;


  const getEventImageSource = () => {
    if (event?.gallery?.[0]?.filename) {
      return `https://d2481n2uw7a0p.cloudfront.net/${event.gallery[0].filename}`;
    }
    return null;
  };

  const formatEventDate = () => {
    if (!event.event_date) return '';
    try {
      const date = new Date(event.event_date);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  const renderHeader = () => {
    const eventDate = formatEventDate();
    if (eventDate) {
      return (
        <View style={styles.headerContainer}>
          <Text style={styles.eventDate}>{eventDate}</Text>
        </View>
      );
    }
    return null;
  };

  const renderFooter = () => {
    const components = [];
    
    if (event.location) {
      components.push(
        <Text key="location" style={styles.locationText} numberOfLines={1}>
          📍 {event.location}
        </Text>
      );
    }

    if (event.user_id && !displayOptions.hideUserBadge) {
      components.push(
        <View key="user" style={styles.userBadgeContainer}>
          <UserBadge userId={event.user_id} />
        </View>
      );
    }

    if (components.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        {components}
      </View>
    );
  };

  return (
    <BaseCard
      imageSource={getEventImageSource()}
      imageHeight={200}
      placeholderIcon="calendar"
      placeholderText=""
      title={event.title}
      description={event.body || event.description}
      onPress={handlePress}
      headerComponent={renderHeader()}
      footerComponent={renderFooter()}
    />
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 8,
  },
  eventDate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.BRG,
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  footerContainer: {
    marginTop: 8,
    gap: 8,
  },
  locationText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
  },
  userBadgeContainer: {
    alignSelf: 'flex-start',
  },
});

export default EventCard;