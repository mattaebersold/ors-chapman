import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert, FlatList,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import {
  useGetGroupDetailQuery,
  useGetGroupMembersQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
} from '../services/apiService';
import GroupNav from '../components/groups/GroupNav';
import Comments from '../components/Comments';

const GroupDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState(null);

  const { data: groupData, isLoading, refetch } = useGetGroupDetailQuery(groupId, { skip: !groupId });
  const group = groupData?.entry || (groupData?.internal_id ? groupData : null);

  const { data: membersData } = useGetGroupMembersQuery(
    { group_id: group?.internal_id },
    { skip: !group?.internal_id }
  );

  const [joinGroup, { isLoading: isJoining }] = useJoinGroupMutation();
  const [leaveGroup, { isLoading: isLeaving }] = useLeaveGroupMutation();

  const members = membersData?.members || [];
  const currentMembership = members.find(m => m.user_id === userInfo?.user_id);
  const isMember = currentMembership?.status === 'active';
  const isAdmin = isMember && (currentMembership?.member_type === 'admin' || currentMembership?.member_type === 'owner');
  const isPending = currentMembership?.status === 'pending';
  const activeMembers = members.filter(m => m.status === 'active');

  const handleJoin = async () => {
    try {
      await joinGroup(group.internal_id).unwrap();
    } catch (err) {
      Alert.alert('Error', 'Failed to join group');
    }
  };

  const handleLeave = () => {
    Alert.alert('Leave Group', 'Are you sure you want to leave this group?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave', style: 'destructive', onPress: async () => {
          try { await leaveGroup(group.internal_id).unwrap(); }
          catch (err) { Alert.alert('Error', 'Failed to leave group'); }
        }
      },
    ]);
  };

  const handleTabPress = useCallback((tab) => {
    const screenMap = {
      Forum: 'GroupForum',
      Cars: 'GroupCars',
      Market: 'GroupMarketplace',
      Events: 'GroupEvents',
      News: 'GroupNews',
      Resources: 'GroupResources',
    };
    navigation.navigate(screenMap[tab], { groupId, group });
  }, [navigation, groupId, group]);

  const getBannerSource = () => {
    if (group?.banners?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${group.banners[0].filename}` };
    }
    if (group?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${group.gallery[0].filename}` };
    }
    return null;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.BRG} />
      </View>
    );
  }

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Group not found</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backLink}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const bannerSource = getBannerSource();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
      >
        {/* Header with back button */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
          </TouchableOpacity>
          {isAdmin && (
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => navigation.navigate('GroupMembers', { groupId, group })}
              >
                <FAIcon name="users" size={16} color={colors.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerBtn}
                onPress={() => navigation.navigate('GroupCreate', { groupId, group, edit: true })}
              >
                <FAIcon name="cog" size={16} color={colors.WHITE} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Banner */}
        {bannerSource ? (
          <Image source={bannerSource} style={styles.banner} resizeMode="cover" />
        ) : (
          <View style={[styles.banner, styles.bannerPlaceholder]}>
            <FAIcon name="users" size={40} color={colors.WHITE} />
          </View>
        )}

        {/* Group info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{group.title}</Text>
          {group.subtitle && <Text style={styles.subtitle}>{group.subtitle}</Text>}

          {group.group_make && (
            <View style={styles.makeModelRow}>
              <FAIcon name="car" size={12} color={colors.BRG} />
              <Text style={styles.makeModelText}>
                {group.group_make}{group.group_model ? ` ${group.group_model}` : ''}
              </Text>
            </View>
          )}

          {/* Tags */}
          {group.tags?.length > 0 && (
            <View style={styles.tagsRow}>
              {group.tags.map((tag, i) => (
                <Text key={i} style={styles.tag}>{tag}</Text>
              ))}
            </View>
          )}

          {/* Member count */}
          <Text style={styles.memberCount}>{activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}</Text>

          {/* Member action */}
          {!isMember && !isPending && (
            <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} disabled={isJoining}>
              <Text style={styles.joinBtnText}>{isJoining ? 'Joining...' : 'Join Group'}</Text>
            </TouchableOpacity>
          )}
          {isPending && (
            <View style={styles.pendingBanner}>
              <Text style={styles.pendingText}>Your request is pending approval</Text>
            </View>
          )}
          {isMember && !isAdmin && (
            <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave} disabled={isLeaving}>
              <Text style={styles.leaveBtnText}>{isLeaving ? 'Leaving...' : 'Leave Group'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Navigation tabs */}
        {isMember && (
          <GroupNav group={group} activeTab={activeTab} onTabPress={handleTabPress} />
        )}

        {/* Body */}
        {group.body && (
          <View style={styles.bodySection}>
            <Text style={styles.bodyText}>{group.body.replace(/<[^>]*>/g, '')}</Text>
          </View>
        )}

        {/* Admin panel */}
        {isAdmin && (
          <View style={styles.adminPanel}>
            <Text style={styles.adminTitle}>Admin Panel</Text>
            <View style={styles.adminStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeMembers.length}</Text>
                <Text style={styles.statLabel}>Members</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{activeMembers.filter(m => m.member_type === 'admin' || m.member_type === 'owner').length}</Text>
                <Text style={styles.statLabel}>Admins</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{members.filter(m => m.status === 'pending').length}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
            </View>
          </View>
        )}

        {/* Member preview avatars */}
        {activeMembers.length > 0 && (
          <View style={styles.memberPreview}>
            <Text style={styles.sectionTitle}>Members</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarRow}>
              {activeMembers.slice(0, 10).map((member, i) => {
                const img = member.user?.gallery?.[0]?.filename;
                return img ? (
                  <Image
                    key={i}
                    source={{ uri: `https://d2481n2uw7a0p.cloudfront.net/${img}` }}
                    style={styles.memberAvatar}
                  />
                ) : (
                  <View key={i} style={[styles.memberAvatar, styles.memberAvatarPlaceholder]}>
                    <FAIcon name="user" size={12} color={colors.WHITE} />
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.BACKGROUND },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: colors.TEXT_SECONDARY },
  backLink: { fontSize: 16, color: colors.BRG, marginTop: 12, fontWeight: '600' },
  headerBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center',
  },
  banner: { width: '100%', height: 200 },
  bannerPlaceholder: { backgroundColor: colors.BRG, justifyContent: 'center', alignItems: 'center' },
  infoSection: { padding: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.TEXT_PRIMARY },
  subtitle: { fontSize: 15, color: colors.TEXT_SECONDARY, marginTop: 4 },
  makeModelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  makeModelText: { fontSize: 14, fontWeight: '600', color: colors.BRG },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  tag: {
    fontSize: 12, color: colors.BRG, backgroundColor: 'rgba(28,55,56,0.1)',
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden',
  },
  memberCount: { fontSize: 13, color: colors.TEXT_SECONDARY, marginTop: 10 },
  joinBtn: {
    backgroundColor: colors.BRG, paddingVertical: 12, borderRadius: 8,
    alignItems: 'center', marginTop: 12,
  },
  joinBtnText: { color: colors.WHITE, fontWeight: '700', fontSize: 16 },
  pendingBanner: {
    backgroundColor: colors.WARNING_BACKGROUND, padding: 12, borderRadius: 8, marginTop: 12,
  },
  pendingText: { color: colors.TEXT_PRIMARY, textAlign: 'center', fontWeight: '600' },
  leaveBtn: {
    borderWidth: 1, borderColor: colors.ERROR, paddingVertical: 10, borderRadius: 8,
    alignItems: 'center', marginTop: 12,
  },
  leaveBtnText: { color: colors.ERROR, fontWeight: '600' },
  bodySection: { paddingHorizontal: 16, paddingBottom: 16 },
  bodyText: { fontSize: 15, color: colors.TEXT_PRIMARY, lineHeight: 22 },
  adminPanel: {
    margin: 16, padding: 16, backgroundColor: colors.WHITE, borderRadius: 12,
    borderWidth: 1, borderColor: colors.BORDER,
  },
  adminTitle: { fontSize: 18, fontWeight: '700', color: colors.TEXT_PRIMARY, marginBottom: 12 },
  adminStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: colors.BRG },
  statLabel: { fontSize: 12, color: colors.TEXT_SECONDARY, marginTop: 2 },
  memberPreview: { paddingHorizontal: 16, paddingBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.TEXT_PRIMARY, marginBottom: 12 },
  avatarRow: { gap: 8 },
  memberAvatar: { width: 44, height: 44, borderRadius: 22 },
  memberAvatarPlaceholder: { backgroundColor: colors.BRG, justifyContent: 'center', alignItems: 'center' },
});

export default GroupDetailScreen;
