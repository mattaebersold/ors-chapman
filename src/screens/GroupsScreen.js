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

  // My Groups — always fetch so we can filter Discover
  const {
    data: myGroupsData,
    isLoading: myGroupsLoading,
    refetch: refetchMyGroups,
  } = useGetUserGroupsQuery(
    { user_id: userInfo?.user_id, status: 'active' },
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

  // Build flat list data for My Groups with section headers + 2-col rows
  const myGroupsListData = useMemo(() => {
    const result = [];

    if (adminGroups.length > 0) {
      result.push({ type: 'header', id: 'admin-header', title: 'Groups I Manage' });
      for (let i = 0; i < adminGroups.length; i += 2) {
        result.push({
          type: 'row',
          id: `admin-row-${i}`,
          items: adminGroups.slice(i, i + 2),
        });
      }
    }

    if (memberGroups.length > 0) {
      result.push({ type: 'header', id: 'member-header', title: "Groups I'm In" });
      for (let i = 0; i < memberGroups.length; i += 2) {
        result.push({
          type: 'row',
          id: `member-row-${i}`,
          items: memberGroups.slice(i, i + 2),
        });
      }
    }

    return result;
  }, [adminGroups, memberGroups]);

  // Build set of IDs the user has joined, to filter Discover
  const userGroupIds = useMemo(() => {
    const ids = new Set();
    (myGroupsData?.groups || []).forEach(item => {
      const g = item.group || item;
      const id = g.internal_id || (g._id ? String(g._id) : null);
      if (id) ids.add(id);
    });
    return ids;
  }, [myGroupsData]);

  // Filter discover: exclude joined groups + apply search
  const filteredDiscoverEntries = useMemo(() => {
    const entries = discoverData?.entries || [];
    return entries.filter(entry => {
      const id = entry.internal_id || (entry._id ? String(entry._id) : null);
      if (id && userGroupIds.has(id)) return false;
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

  // Build flat list data for Discover with 2-col rows
  const discoverListData = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredDiscoverEntries.length; i += 2) {
      result.push({
        type: 'row',
        id: `discover-row-${i}`,
        items: filteredDiscoverEntries.slice(i, i + 2),
      });
    }
    return result;
  }, [filteredDiscoverEntries]);

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

    // type === 'row': render up to 2 group cards side by side
    return (
      <View style={styles.row}>
        {item.items.map((groupItem, index) => {
          const group = groupItem.group || groupItem;
          return (
            <View
              key={`${item.id}-${index}`}
              style={styles.cardWrapper}
            >
              <GroupCard post={group} displayOptions={{ small: true }} />
            </View>
          );
        })}
        {/* Fill empty slot so odd-count rows stay left-aligned */}
        {item.items.length === 1 && <View style={styles.cardWrapper} />}
      </View>
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
    backgroundColor: colors.CARD_BACKGROUND || '#1e3a3b',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardWrapper: {
    width: '49%',
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
