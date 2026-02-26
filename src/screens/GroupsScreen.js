import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useGetGroupsQuery, useGetUserGroupsQuery } from '../services/apiService';
import GroupCard from '../components/groups/GroupCard';
import FAIcon from '../components/ui/FAIcon';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useSelector(state => state.auth);
  const [activeSection, setActiveSection] = useState('myGroups');
  const [searchQuery, setSearchQuery] = useState('');

  // Active memberships — for My Groups display and Discover filtering
  const {
    data: myGroupsData,
    isLoading: myGroupsLoading,
    refetch: refetchMyGroups,
  } = useGetUserGroupsQuery(
    { user_id: userInfo?.user_id, status: 'active' },
    { skip: !userInfo?.user_id }
  );

  // Pending memberships — to label groups in Discover with "Pending"
  const { data: pendingGroupsData } = useGetUserGroupsQuery(
    { user_id: userInfo?.user_id, status: 'pending' },
    { skip: !userInfo?.user_id }
  );

  // Discover — all public groups
  const {
    data: discoverData,
    isLoading: discoverLoading,
    refetch: refetchDiscover,
  } = useGetGroupsQuery(
    { page: 0, omit: 'none', limit: 48 },
    { skip: activeSection !== 'discover' }
  );

  const sections = [
    { key: 'myGroups', label: 'My Groups' },
    { key: 'discover', label: 'Discover' },
  ];

  // Split My Groups into admin-managed vs member groups
  const { adminGroups, memberGroups } = useMemo(() => {
    const all = myGroupsData?.groups || [];
    const admin = [];
    const member = [];
    all.forEach(item => {
      const memberType = item.membership?.member_type;
      if (memberType === 'admin') {
        admin.push(item);
      } else {
        member.push(item);
      }
    });
    return { adminGroups: admin, memberGroups: member };
  }, [myGroupsData]);

  // Build flat list for My Groups — individual full-width items with section headers
  const myGroupsListData = useMemo(() => {
    const result = [];

    if (adminGroups.length > 0) {
      result.push({ type: 'header', id: 'admin-header', title: 'Groups I Manage' });
      adminGroups.forEach((item, i) =>
        result.push({ type: 'item', id: `admin-${i}`, groupItem: item, membershipStatus: 'active' })
      );
    }

    if (memberGroups.length > 0) {
      result.push({ type: 'header', id: 'member-header', title: "Groups I'm In" });
      memberGroups.forEach((item, i) =>
        result.push({ type: 'item', id: `member-${i}`, groupItem: item, membershipStatus: 'active' })
      );
    }

    return result;
  }, [adminGroups, memberGroups]);

  // Set of active member group IDs — used to filter Discover
  const userGroupIds = useMemo(() => {
    const ids = new Set();
    (myGroupsData?.groups || []).forEach(item => {
      const g = item.group || item;
      if (g.internal_id) ids.add(String(g.internal_id));
      if (g._id) ids.add(String(g._id));
    });
    return ids;
  }, [myGroupsData]);

  // Set of pending group IDs — shown in Discover with "Pending" label
  const pendingGroupIds = useMemo(() => {
    const ids = new Set();
    (pendingGroupsData?.groups || []).forEach(item => {
      const g = item.group || item;
      if (g.internal_id) ids.add(String(g.internal_id));
      if (g._id) ids.add(String(g._id));
    });
    return ids;
  }, [pendingGroupsData]);

  // Filter discover: exclude joined groups + apply search
  const filteredDiscoverEntries = useMemo(() => {
    const entries = discoverData?.entries || [];
    return entries.filter(entry => {
      if (userGroupIds.has(String(entry.internal_id || '')) ||
          userGroupIds.has(String(entry._id || ''))) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          entry.title?.toLowerCase().includes(q) ||
          entry.body?.toLowerCase().includes(q) ||
          entry.category?.toLowerCase().includes(q) ||
          (entry.tags || []).some(t => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [discoverData, userGroupIds, searchQuery]);

  // Build flat list for Discover — individual items with membership status
  const discoverListData = useMemo(() => {
    return filteredDiscoverEntries.map((entry, i) => {
      const entryId = String(entry.internal_id || entry._id || '');
      const membershipStatus = pendingGroupIds.has(entryId) ? 'pending' : null;
      return { type: 'item', id: `discover-${i}`, groupItem: entry, membershipStatus };
    });
  }, [filteredDiscoverEntries, pendingGroupIds]);

  const isLoading = activeSection === 'myGroups' ? myGroupsLoading : discoverLoading;
  const refetch = activeSection === 'myGroups' ? refetchMyGroups : refetchDiscover;
  const listData = activeSection === 'myGroups' ? myGroupsListData : discoverListData;

  const isEmpty =
    !isLoading &&
    (activeSection === 'myGroups'
      ? (myGroupsData?.groups || []).length === 0
      : filteredDiscoverEntries.length === 0);

  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <Text style={styles.sectionHeader}>{item.title}</Text>;
    }

    const group = item.groupItem.group || item.groupItem;
    return (
      <GroupCard
        post={group}
        membershipStatus={item.membershipStatus}
      />
    );
  };

  return (
    <View style={styles.container}>
      {/* Section tabs */}
      <View style={styles.tabBar}>
        {sections.map(section => (
          <TouchableOpacity
            key={section.key}
            style={[styles.tab, activeSection === section.key && styles.activeTab]}
            onPress={() => { setActiveSection(section.key); setSearchQuery(''); }}
          >
            <Text
              style={[
                styles.tabText,
                activeSection === section.key && styles.activeTabText,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Create group button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('GroupCreate')}
      >
        <FAIcon name="plus" size={14} color={colors.WHITE} />
        <Text style={styles.createButtonText}>Create Group</Text>
      </TouchableOpacity>

      {/* Discover search */}
      {activeSection === 'discover' && (
        <View style={styles.searchRow}>
          <FAIcon name="search" size={14} color={colors.TEXT_SECONDARY} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search groups..."
            placeholderTextColor={colors.TEXT_SECONDARY}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <FAIcon name="times" size={14} color={colors.TEXT_SECONDARY} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={listData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            isEmpty ? (
              <View style={styles.empty}>
                <FAIcon name="users" size={40} color={colors.GRAY} />
                <Text style={styles.emptyText}>
                  {activeSection === 'myGroups'
                    ? "You haven't joined any groups yet"
                    : 'No groups found'}
                </Text>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.SPEED,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.SPEED,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.WHITE,
  },
  activeTabText: {
    color: colors.SPEED,
    fontWeight: '700',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.BRG,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createButtonText: {
    color: colors.WHITE,
    fontWeight: '700',
    fontSize: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    padding: 0,
  },
  list: {
    padding: 8,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.TEXT_SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingTop: 12,
    paddingBottom: 8,
  },
  loader: {
    marginTop: 40,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default GroupsScreen;
