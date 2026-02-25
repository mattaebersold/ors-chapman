import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import GroupMemberRow from '../components/groups/GroupMemberRow';
import UsernameSearch from '../components/UsernameSearch';
import {
  useGetGroupMembersQuery,
  useApproveMemberMutation,
  useRejectMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberTypeMutation,
  useInviteMemberMutation,
  useCancelInvitationMutation,
} from '../services/apiService';

const GroupMembersScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);
  const [activeSection, setActiveSection] = useState('active');
  const [showInviteModal, setShowInviteModal] = useState(false);

  const { data: membersData, isLoading, refetch } = useGetGroupMembersQuery(
    { group_id: group?.internal_id },
    { skip: !group?.internal_id }
  );

  const [approveMember] = useApproveMemberMutation();
  const [rejectMember] = useRejectMemberMutation();
  const [removeMember] = useRemoveMemberMutation();
  const [updateMemberType] = useUpdateMemberTypeMutation();
  const [inviteMember, { isLoading: isInviting }] = useInviteMemberMutation();
  const [cancelInvitation] = useCancelInvitationMutation();

  const allMembers = membersData?.members || [];
  const currentMembership = allMembers.find(m => m.user_id === userInfo?.user_id);
  const isAdmin = currentMembership?.status === 'active' &&
    (currentMembership?.member_type === 'admin' || currentMembership?.member_type === 'owner');

  const activeMembers = allMembers.filter(m => m.status === 'active');
  const pendingMembers = allMembers.filter(m => m.status === 'pending');
  const invitedMembers = allMembers.filter(m => m.status === 'invited');

  const sections = [
    { key: 'active', label: `Active (${activeMembers.length})` },
    { key: 'pending', label: `Pending (${pendingMembers.length})` },
    { key: 'invited', label: `Invited (${invitedMembers.length})` },
  ];

  const getCurrentMembers = () => {
    switch (activeSection) {
      case 'active': return activeMembers;
      case 'pending': return pendingMembers;
      case 'invited': return invitedMembers;
      default: return [];
    }
  };

  const handleApprove = async (member) => {
    try {
      await approveMember({ group_id: group.internal_id, user_id: member.user_id }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to approve member');
    }
  };

  const handleReject = async (member) => {
    try {
      await rejectMember({ group_id: group.internal_id, user_id: member.user_id }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to reject member');
    }
  };

  const handleRemove = async (member) => {
    try {
      await removeMember({ group_id: group.internal_id, user_id: member.user_id }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to remove member');
    }
  };

  const handlePromote = async (member) => {
    try {
      await updateMemberType({ group_id: group.internal_id, user_id: member.user_id, member_type: 'admin' }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to promote member');
    }
  };

  const handleDemote = async (member) => {
    try {
      await updateMemberType({ group_id: group.internal_id, user_id: member.user_id, member_type: 'member' }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to demote member');
    }
  };

  const handleCancel = async (member) => {
    try {
      await cancelInvitation({ group_id: group.internal_id, user_id: member.user_id }).unwrap();
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to cancel invitation');
    }
  };

  const handleInviteUser = async (user) => {
    try {
      await inviteMember({ group_id: group.internal_id, user_id: user.user_id || user.internal_id }).unwrap();
      setShowInviteModal(false);
      refetch();
      Alert.alert('Success', 'Invitation sent');
    } catch (err) {
      Alert.alert('Error', err?.data?.message || 'Failed to invite user');
    }
  };

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Members</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.noAccess}>
          <Text style={styles.noAccessText}>Admin access required</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <GroupMemberRow
      member={item}
      isAdmin={isAdmin}
      onApprove={handleApprove}
      onReject={handleReject}
      onRemove={handleRemove}
      onPromote={handlePromote}
      onDemote={handleDemote}
      onCancel={handleCancel}
      onPress={() => navigation.navigate('UserDetail', { userId: item.user_id })}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Members</Text>
        <TouchableOpacity onPress={() => setShowInviteModal(true)} style={styles.inviteBtn}>
          <FAIcon name="user-plus" size={16} color={colors.WHITE} />
        </TouchableOpacity>
      </View>

      {/* Section tabs */}
      <View style={styles.tabBar}>
        {sections.map(section => (
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

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={getCurrentMembers()}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.user_id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No members in this category</Text>}
        />
      )}

      {/* Invite Modal */}
      <Modal visible={showInviteModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowInviteModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Invite Member</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inviteInstructions}>Search for a user to invite to this group</Text>
            <UsernameSearch
              onSelectUser={handleInviteUser}
              placeholder="Search by username..."
            />
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.BACKGROUND },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.BRG, paddingHorizontal: 16, paddingVertical: 12,
  },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: colors.WHITE, fontSize: 17, fontWeight: '700' },
  inviteBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  tabBar: {
    flexDirection: 'row', backgroundColor: colors.WHITE,
    borderBottomWidth: 1, borderBottomColor: colors.BORDER,
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: colors.BRG },
  tabText: { fontSize: 13, color: colors.TEXT_SECONDARY },
  activeTabText: { color: colors.BRG, fontWeight: '700' },
  loader: { marginTop: 40 },
  list: { paddingVertical: 8 },
  emptyText: { textAlign: 'center', color: colors.TEXT_SECONDARY, marginTop: 40 },
  noAccess: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  noAccessText: { fontSize: 16, color: colors.TEXT_SECONDARY },
  modalContainer: { flex: 1, backgroundColor: colors.BACKGROUND },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.BORDER,
  },
  modalCancel: { color: colors.BRG, fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalContent: { padding: 16 },
  inviteInstructions: { fontSize: 14, color: colors.TEXT_SECONDARY, marginBottom: 16 },
});

export default GroupMembersScreen;
