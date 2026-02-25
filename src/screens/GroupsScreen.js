import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { useGetGroupsQuery, useGetUserGroupsQuery } from '../services/apiService';
import GroupCard from '../components/groups/GroupCard';
import FAIcon from '../components/ui/FAIcon';
import Button from '../components/ui/Button';

const GroupsScreen = () => {
  const navigation = useNavigation();
  const { userInfo } = useSelector(state => state.auth);
  const [activeSection, setActiveSection] = useState('discover');
  const [page, setPage] = useState(0);

  const { data: discoverData, isLoading: discoverLoading, refetch: refetchDiscover } = useGetGroupsQuery(
    { page, limit: 24 },
    { skip: activeSection !== 'discover' }
  );

  const { data: myGroupsData, isLoading: myGroupsLoading, refetch: refetchMyGroups } = useGetUserGroupsQuery(
    { user_id: userInfo?.user_id, status: 'active' },
    { skip: !userInfo?.user_id || activeSection !== 'myGroups' }
  );

  const { data: adminGroupsData, isLoading: adminLoading, refetch: refetchAdmin } = useGetUserGroupsQuery(
    { user_id: userInfo?.user_id, status: 'active', member_type: 'admin' },
    { skip: !userInfo?.user_id || activeSection !== 'admin' }
  );

  const sections = [
    { key: 'discover', label: 'Discover' },
    { key: 'myGroups', label: 'My Groups' },
    { key: 'admin', label: 'Admin' },
  ];

  const getActiveData = () => {
    switch (activeSection) {
      case 'discover': return { data: discoverData?.entries || [], loading: discoverLoading, refetch: refetchDiscover };
      case 'myGroups': return { data: myGroupsData?.groups || [], loading: myGroupsLoading, refetch: refetchMyGroups };
      case 'admin': return { data: adminGroupsData?.groups || [], loading: adminLoading, refetch: refetchAdmin };
      default: return { data: [], loading: false, refetch: () => {} };
    }
  };

  const { data: groups, loading, refetch } = getActiveData();

  const renderItem = ({ item }) => {
    const group = item.group || item;
    return (
      <View style={styles.cardWrapper}>
        <GroupCard post={group} displayOptions={{ small: true }} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Section tabs */}
      <View style={styles.tabBar}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[styles.tab, activeSection === section.key && styles.activeTab]}
            onPress={() => setActiveSection(section.key)}
          >
            <Text style={[styles.tabText, activeSection === section.key && styles.activeTabText]}>
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

      {loading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={groups}
          renderItem={renderItem}
          keyExtractor={(item) => (item.group || item)?._id || (item.group || item)?.internal_id || Math.random().toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <FAIcon name="users" size={40} color={colors.GRAY} />
              <Text style={styles.emptyText}>No groups found</Text>
            </View>
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
  list: {
    padding: 8,
  },
  row: {
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
  },
});

export default GroupsScreen;
