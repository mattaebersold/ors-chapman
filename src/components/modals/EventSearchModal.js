import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import { useGetEventsQuery, useCreateTagMutation } from '../../services/apiService';

const EventSearchModal = ({ visible, onClose, postId }) => {
  const [searchText, setSearchText] = useState('');
  const [createTag, { isLoading: isTagging }] = useCreateTagMutation();

  const { data: eventsData, isLoading } = useGetEventsQuery(
    { page: 1, limit: 20, search: searchText },
    { skip: !visible || searchText.length < 2 }
  );

  const events = eventsData?.entries || [];

  const handleSelectEvent = async (event) => {
    if (!event || !postId) {
      Alert.alert('Error', 'Please select an event to tag');
      return;
    }

    try {
      await createTag({
        post_id: postId,
        tag_entry_type: 'event',
        tag_internal_id: event.internal_id || event._id,
      }).unwrap();

      Alert.alert('Success', 'Event tagged successfully');
      setSearchText('');
      onClose();
    } catch (error) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', error?.data?.message || 'Failed to tag event. It may already be tagged.');
    }
  };

  const formatEventDate = (event) => {
    if (event.event_type === 'recurring' && event.recurring_frequency) {
      return event.recurring_frequency;
    }
    if (event.event_date) {
      const d = new Date(event.event_date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return '';
  };

  const renderEventItem = ({ item }) => (
    <TouchableOpacity
      style={styles.eventItem}
      onPress={() => handleSelectEvent(item)}
      disabled={isTagging}
    >
      <View style={styles.eventInfo}>
        <FAIcon name="calendar" size={16} color={colors.BRG} />
        <View style={styles.eventText}>
          <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.eventDate}>{formatEventDate(item)}</Text>
        </View>
      </View>
      <FAIcon name="plus" size={16} color={colors.BRG} />
    </TouchableOpacity>
  );

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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Events</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.instructions}>
            Search for an event to tag on this post
          </Text>

          <View style={styles.searchContainer}>
            <FAIcon name="search" size={16} color={colors.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search events..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              autoCapitalize="none"
            />
            {searchText.length > 0 && (
              <TouchableOpacity onPress={() => setSearchText('')}>
                <FAIcon name="times-circle" size={16} color={colors.TEXT_SECONDARY} />
              </TouchableOpacity>
            )}
          </View>

          {isLoading && (
            <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
          )}

          {!isLoading && searchText.length >= 2 && (
            <FlatList
              data={events}
              renderItem={renderEventItem}
              keyExtractor={item => item._id || item.internal_id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No events found</Text>
              }
            />
          )}

          {searchText.length < 2 && !isLoading && (
            <Text style={styles.hintText}>Type at least 2 characters to search</Text>
          )}
        </View>
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
    backgroundColor: colors.BRG,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  loader: {
    marginTop: 40,
  },
  list: {
    paddingTop: 16,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.WHITE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  eventInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  eventText: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  eventDate: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.TEXT_SECONDARY,
    paddingVertical: 40,
  },
  hintText: {
    textAlign: 'center',
    color: colors.TEXT_SECONDARY,
    paddingVertical: 40,
    fontStyle: 'italic',
  },
});

export default EventSearchModal;
