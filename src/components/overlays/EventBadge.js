import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useGetEventQuery } from '../../services/apiService';
import BaseBadge from './BaseBadge';

const EventBadge = ({ eventId, style = {}, name = true, small = false }) => {
  // Safely get navigation - might not be available in modals
  let navigation;
  try {
    navigation = useNavigation();
  } catch (error) {
    // Navigation not available (e.g., in modal context)
    navigation = null;
  }

  const { data: event, isLoading, error } = useGetEventQuery(eventId, {
    skip: !eventId
  });

  if (!eventId || isLoading || error || !event) return null;

  const getEventImageSource = () => {
    if (event?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${event.gallery[0].filename}` };
    }
    return null;
  };

  const getDisplayName = () => {
    if (small) { return ''; }
    if (!name) { return ''; }
    if (event.title) return event.title;
    if (event.name) return event.name;
    return 'Event';
  };

  const handlePress = () => {
    if (navigation && eventId) {
      navigation.navigate('PostDetail', {
        post: event // Events can be viewed in PostDetail
      });
    }
    // If navigation is not available (e.g., in modal), do nothing
  };

  return (
    <BaseBadge
      imageSource={getEventImageSource()}
      displayName={getDisplayName()}
      iconName="calendar"
      onPress={handlePress}
      style={style}
      disabled={!navigation}
      small={small}
    />
  );
};

export default EventBadge;
