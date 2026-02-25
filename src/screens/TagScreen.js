import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../constants/colors';
import { useGetTagsByPostQuery, useGetRecentTagsQuery, useDeleteTagMutation, useGetUserQuery, useGetCarQuery, useGetEventQuery } from '../services/apiService';
import FAIcon from '../components/ui/FAIcon';
import UserBadge from '../components/overlays/UserBadge';
import LoadingIndicator from '../components/ui/LoadingIndicator';
import UserSearchModal from '../components/modals/UserSearchModal';
import CarSearchModal from '../components/modals/CarSearchModal';
import EventSearchModal from '../components/modals/EventSearchModal';

const TagScreen = ({ postId, onClose }) => {
  const [userSearchVisible, setUserSearchVisible] = useState(false);
  const [carSearchVisible, setCarSearchVisible] = useState(false);
  const [eventSearchVisible, setEventSearchVisible] = useState(false);

  // Fetch tags for this post
  const { data: tagsData, isLoading: tagsLoading } = useGetTagsByPostQuery(postId, {
    skip: !postId
  });

  // Fetch recent tags
  const { data: recentTagsData, isLoading: recentLoading } = useGetRecentTagsQuery({ limit: 20 });

  // Delete tag mutation
  const [deleteTag] = useDeleteTagMutation();

  // Separate tags by type
  const taggedUsers = useMemo(() => {
    if (!tagsData?.tags) return [];
    return tagsData.tags.filter(tag => tag.tag_entry_type === 'user');
  }, [tagsData]);

  const taggedCars = useMemo(() => {
    if (!tagsData?.tags) return [];
    return tagsData.tags.filter(tag => tag.tag_entry_type === 'garagecar');
  }, [tagsData]);

  const taggedEvents = useMemo(() => {
    if (!tagsData?.tags) return [];
    return tagsData.tags.filter(tag => tag.tag_entry_type === 'event');
  }, [tagsData]);

  // De-duplicate recent tags
  const recentTagsDeduped = useMemo(() => {
    if (!recentTagsData?.tags) return [];
    const seen = new Set();
    return recentTagsData.tags.filter(tag => {
      const key = `${tag.tag_entry_type}-${tag.tag_internal_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [recentTagsData]);

  const handleDeleteTag = async (tagId) => {
    Alert.alert(
      'Remove Tag',
      'Are you sure you want to remove this tag?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTag(tagId).unwrap();
            } catch (error) {
              console.error('Error deleting tag:', error);
              Alert.alert('Error', 'Failed to remove tag');
            }
          }
        }
      ]
    );
  };

  const TaggedUserItem = ({ tag }) => {
    const { data: user, isLoading } = useGetUserQuery(tag.tag_internal_id);

    if (isLoading) return <LoadingIndicator size="small" />;
    if (!user) return null;

    return (
      <View style={styles.tagItem}>
        <UserBadge userId={user.user_id} name={true} />
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleDeleteTag(tag._id)}
        >
          <FAIcon name="times" size={16} color={colors.ERROR} />
        </TouchableOpacity>
      </View>
    );
  };

  const TaggedCarItem = ({ tag }) => {
    const { data: car, isLoading } = useGetCarQuery(tag.tag_internal_id);

    if (isLoading) return <LoadingIndicator size="small" />;
    if (!car) return null;

    return (
      <View style={styles.tagItem}>
        <View style={styles.carBadge}>
          <FAIcon name="car" size={16} color={colors.BRG} />
          <Text style={styles.carBadgeText}>
            {car.year} {car.make} {car.model}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleDeleteTag(tag._id)}
        >
          <FAIcon name="times" size={16} color={colors.ERROR} />
        </TouchableOpacity>
      </View>
    );
  };

  const TaggedEventItem = ({ tag }) => {
    const { data: event, isLoading } = useGetEventQuery(tag.tag_internal_id);

    if (isLoading) return <LoadingIndicator size="small" />;
    if (!event?.entry) return null;

    const formatDate = () => {
      if (event.entry.event_type === 'recurring' && event.entry.recurring_frequency) {
        return event.entry.recurring_frequency;
      }
      if (event.entry.event_date) {
        const d = new Date(event.entry.event_date);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return '';
    };

    return (
      <View style={styles.tagItem}>
        <View style={styles.carBadge}>
          <FAIcon name="calendar" size={16} color={colors.BRG} />
          <View>
            <Text style={styles.carBadgeText}>{event.entry.title}</Text>
            <Text style={styles.eventDateText}>{formatDate()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleDeleteTag(tag._id)}
        >
          <FAIcon name="times" size={16} color={colors.ERROR} />
        </TouchableOpacity>
      </View>
    );
  };

  const RecentTagItem = ({ tag }) => {
    if (tag.tag_entry_type === 'user') {
      return <TaggedUserItem tag={tag} />;
    } else if (tag.tag_entry_type === 'garagecar') {
      return <TaggedCarItem tag={tag} />;
    } else if (tag.tag_entry_type === 'event') {
      return <TaggedEventItem tag={tag} />;
    }
    return null;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <FAIcon name="times" size={24} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tag Users & Cars</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tagged Users Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Users Tagged on This Post</Text>
          {tagsLoading ? (
            <LoadingIndicator />
          ) : taggedUsers.length > 0 ? (
            <View style={styles.tagsList}>
              {taggedUsers.map(tag => (
                <TaggedUserItem key={tag._id} tag={tag} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No users tagged yet</Text>
          )}
        </View>

        {/* Tagged Cars Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cars Tagged on This Post</Text>
          {tagsLoading ? (
            <LoadingIndicator />
          ) : taggedCars.length > 0 ? (
            <View style={styles.tagsList}>
              {taggedCars.map(tag => (
                <TaggedCarItem key={tag._id} tag={tag} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No cars tagged yet</Text>
          )}
        </View>

        {/* Tagged Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Events Tagged on This Post</Text>
          {tagsLoading ? (
            <LoadingIndicator />
          ) : taggedEvents.length > 0 ? (
            <View style={styles.tagsList}>
              {taggedEvents.map(tag => (
                <TaggedEventItem key={tag._id} tag={tag} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No events tagged yet</Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            key="search-users-button"
            style={styles.actionButton}
            onPress={() => setUserSearchVisible(true)}
          >
            <FAIcon name="user-plus" size={20} color={colors.WHITE} />
            <Text style={styles.actionButtonText}>Search Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            key="search-cars-button"
            style={styles.actionButton}
            onPress={() => setCarSearchVisible(true)}
          >
            <FAIcon name="car" size={20} color={colors.WHITE} />
            <Text style={styles.actionButtonText}>Search Cars</Text>
          </TouchableOpacity>

          <TouchableOpacity
            key="search-events-button"
            style={styles.actionButton}
            onPress={() => setEventSearchVisible(true)}
          >
            <FAIcon name="calendar" size={20} color={colors.WHITE} />
            <Text style={styles.actionButtonText}>Search Events</Text>
          </TouchableOpacity>
        </View>

        {/* Recently Tagged Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recently Tagged</Text>
          {recentLoading ? (
            <LoadingIndicator />
          ) : recentTagsDeduped.length > 0 ? (
            <View style={styles.tagsList}>
              {recentTagsDeduped.map(tag => (
                <RecentTagItem key={`${tag.tag_entry_type}-${tag.tag_internal_id}`} tag={tag} />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No recent tags</Text>
          )}
        </View>
      </ScrollView>

      {/* User Search Modal */}
      <UserSearchModal
        visible={userSearchVisible}
        onClose={() => setUserSearchVisible(false)}
        postId={postId}
      />

      {/* Car Search Modal */}
      <CarSearchModal
        visible={carSearchVisible}
        onClose={() => setCarSearchVisible(false)}
        postId={postId}
      />

      {/* Event Search Modal */}
      <EventSearchModal
        visible={eventSearchVisible}
        onClose={() => setEventSearchVisible(false)}
        postId={postId}
      />
    </View>
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
  },
  section: {
    backgroundColor: colors.WHITE,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  tagsList: {
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  removeButton: {
    padding: 8,
  },
  carBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  eventDateText: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.LIGHT_BRG ? colors.LIGHT_BRG + '20' : colors.BACKGROUND,
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    lineHeight: 20,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  actionButton: {
    backgroundColor: colors.BRG,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 12,
  },
  actionButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TagScreen;
