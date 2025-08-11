import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { colors } from '../constants/colors';
import EventCarousel from './EventCarousel';
import Listing from './Listing';
import Card from './Card';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import EmptyState from './EmptyState';
import { useGetEventsQuery } from '../services/apiService';

const EventsList = () => {
  // Fetch recurring events for carousel (don't use time_filter for recurring events)
  const { data: recurringEvents, isLoading: recurringLoading, error: recurringError } = useGetEventsQuery({
    page: 1,
    limit: 10,
    event_type: 'recurring'
  });

  // Fetch past events for list
  const { data: pastEvents, isLoading: pastLoading, error: pastError } = useGetEventsQuery({
    page: 1,
    limit: 20,
    time_filter: 'past'
  });

  console.log('EventsList - recurringEvents:', recurringEvents);
  console.log('EventsList - recurringLoading:', recurringLoading);
  console.log('EventsList - recurringError:', recurringError);
  // Memoize the events arrays to prevent infinite re-renders
  const memoizedRecurringEvents = useMemo(() => recurringEvents?.entries || [], [recurringEvents?.entries]);
  const memoizedPastEvents = useMemo(() => pastEvents?.entries || [], [pastEvents?.entries]);

  console.log('EventsList - pastEvents:', pastEvents);
  console.log('EventsList - pastLoading:', pastLoading);
  console.log('EventsList - pastError:', pastError);
  console.log('EventsList - memoizedPastEvents length:', memoizedPastEvents?.length);
  console.log('EventsList - memoizedPastEvents sample:', memoizedPastEvents?.[0]);
  
  // Memoize the config objects to prevent infinite re-renders
  const listingConfig = useMemo(() => ({
    type: 'events',
    heading: 'Past Events'
  }), []);
  
  const listingDisplayOptions = useMemo(() => ({
    badgeProfile: false,
    badgeCar: false
  }), []);

  const renderRecurringSection = () => {
    if (recurringLoading) {
      return (
        <LoadingIndicator 
          text="Loading recurring events..." 
          size="large"
          variant="spinner"
        />
      );
    }

    if (recurringError) {
      console.error('Recurring events error:', recurringError);
      return (
        <ErrorMessage 
          message="Error loading recurring events"
          icon="exclamation"
        />
      );
    }

    if (memoizedRecurringEvents.length === 0) {
      return (
        <EmptyState
          title="No Recurring Events"
          message="No recurring events found"
          icon="calendar"
          iconSize={32}
        />
      );
    }

    return (
      <View>
        <Text style={styles.sectionTitle}>Recurring Events</Text>
        <EventCarousel events={memoizedRecurringEvents} displayOptions={{}} />
      </View>
    );
  };


  const renderPastEventItem = ({ item }) => {
    console.log('Rendering past event item:', item.title || item._id);
    return (
      <Card 
        post={item} 
        displayOptions={listingDisplayOptions}
      />
    );
  };

  const renderHeader = () => (
    <View>
      {/* Recurring Events Section */}
      <View style={styles.recurringSection}>
        {renderRecurringSection()}
      </View>
      
      {/* Past Events Title */}
      {memoizedPastEvents.length > 0 && (
        <Text style={styles.sectionTitle}>Past Events</Text>
      )}
    </View>
  );

  const renderFooter = () => {
    if (pastLoading) {
      return (
        <LoadingIndicator 
          text="Loading past events..." 
          variant="spinner"
        />
      );
    }
    
    if (pastError) {
      return (
        <ErrorMessage 
          message="Error loading past events"
          icon="exclamation"
        />
      );
    }
    
    if (memoizedPastEvents.length === 0) {
      return (
        <EmptyState
          title="No Past Events"
          message="No past events found"
          icon="history"
          iconSize={24}
        />
      );
    }
    
    return null;
  };

  return (
    <FlatList
      style={styles.container}
      data={memoizedPastEvents}
      renderItem={renderPastEventItem}
      keyExtractor={(item, index) => item._id || item.internal_id || `past-event-${index}`}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  listContainer: {
    paddingBottom: 20,
  },
  recurringSection: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});

export default EventsList;