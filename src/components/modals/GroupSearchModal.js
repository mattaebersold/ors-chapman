import React, { useState, useEffect } from 'react';
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
import {
  useSearchQuery,
  useGetGroupsQuery,
  useCreateTagMutation,
  useGetRecentTagsQuery,
  useGetGroupDetailQuery,
} from '../../services/apiService';

const RecentGroupItem = ({ tag, onSelect }) => {
  const { data: group, isLoading } = useGetGroupDetailQuery(tag.tag_internal_id);
  if (isLoading || !group) return null;

  return (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => onSelect(group)}
    >
      <View style={styles.groupInfo}>
        <FAIcon name="clock-o" size={14} color={colors.TEXT_SECONDARY} />
        <FAIcon name="users" size={16} color={colors.BRG} />
        <Text style={styles.groupName} numberOfLines={1}>{group.title || group.name}</Text>
      </View>
      <FAIcon name="plus" size={16} color={colors.BRG} />
    </TouchableOpacity>
  );
};

const GroupSearchModal = ({ visible, onClose, postId, onSelect }) => {
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [createTag, { isLoading: isTagging }] = useCreateTagMutation();

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchText), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const { data: searchData, isLoading: searchLoading } = useSearchQuery(debouncedSearch, {
    skip: !visible || debouncedSearch.length < 2,
  });

  const { data: groupsData, isLoading: groupsLoading } = useGetGroupsQuery(
    { page: 0, omit: 'none', limit: 20 },
    { skip: !visible || debouncedSearch.length >= 2 }
  );

  const { data: recentTagsData } = useGetRecentTagsQuery(
    { limit: 20 },
    { skip: !visible }
  );

  const searchGroups = searchData?.groups || [];
  const browseGroups = groupsData?.entries || [];
  const recentGroupTags = (recentTagsData?.tags || [])
    .filter(t => t.tag_entry_type === 'group')
    .slice(0, 8);

  const isLoading = debouncedSearch.length >= 2 ? searchLoading : groupsLoading;

  const handleClose = () => {
    setSearchText('');
    onClose();
  };

  const handleSelectGroup = async (group) => {
    if (!group) return;

    const groupId = group.internal_id || group._id;
    const groupName = group.title || group.name;

    if (onSelect) {
      onSelect({
        id: groupId,
        label: groupName,
        type: 'group',
      });
      setSearchText('');
      onClose();
      return;
    }

    if (!postId) return;

    try {
      await createTag({
        post_id: postId,
        tag_entry_type: 'group',
        tag_internal_id: groupId,
      }).unwrap();
      Alert.alert('Success', 'Group tagged successfully');
      setSearchText('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to tag group. It may already be tagged.');
    }
  };

  const renderGroupItem = ({ item }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => handleSelectGroup(item)}
      disabled={isTagging}
    >
      <View style={styles.groupInfo}>
        <FAIcon name="users" size={16} color={colors.BRG} />
        <Text style={styles.groupName} numberOfLines={1}>{item.title || item.name}</Text>
      </View>
      <FAIcon name="plus" size={16} color={colors.BRG} />
    </TouchableOpacity>
  );

  const groupsToShow = debouncedSearch.length >= 2 ? searchGroups : browseGroups;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tag a Group</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.searchContainer}>
            <FAIcon name="search" size={16} color={colors.TEXT_SECONDARY} />
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search groups..."
              placeholderTextColor={colors.TEXT_SECONDARY}
              autoCapitalize="none"
              autoFocus
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

          {!isLoading && recentGroupTags.length > 0 && debouncedSearch.length < 2 && (
            <View>
              <Text style={styles.sectionLabel}>Recently Tagged</Text>
              {recentGroupTags.map(tag => (
                <RecentGroupItem
                  key={`${tag.tag_entry_type}-${tag.tag_internal_id}`}
                  tag={tag}
                  onSelect={handleSelectGroup}
                />
              ))}
              {browseGroups.length > 0 && (
                <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>All Groups</Text>
              )}
            </View>
          )}

          {!isLoading && (
            <FlatList
              data={groupsToShow}
              renderItem={renderGroupItem}
              keyExtractor={item => item._id || item.internal_id}
              contentContainerStyle={styles.list}
              ListEmptyComponent={
                debouncedSearch.length >= 2 ? (
                  <Text style={styles.emptyText}>No groups found</Text>
                ) : null
              }
            />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 8,
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
    paddingTop: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    marginTop: 8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionLabelSpaced: {
    marginTop: 16,
  },
  groupItem: {
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
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  groupName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.TEXT_SECONDARY,
    paddingVertical: 40,
  },
});

export default GroupSearchModal;
