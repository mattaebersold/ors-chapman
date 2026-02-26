import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl, Modal, TextInput, Alert, ScrollView,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import GroupNav from '../components/groups/GroupNav';
import GroupHeading from '../components/groups/GroupHeading';
import GroupResourceCard from '../components/groups/GroupResourceCard';
import Comments from '../components/Comments';
import {
  useGetGroupResourcesQuery,
  useGetGroupMembersQuery,
  useCreateGroupResourceMutation,
  useUpvoteResourceMutation,
  useDownvoteResourceMutation,
} from '../services/apiService';

const categories = [
  { key: 'general', label: 'General' },
  { key: 'exterior', label: 'Exterior' },
  { key: 'interior', label: 'Interior' },
  { key: 'engine', label: 'Engine' },
  { key: 'electrical', label: 'Electrical' },
  { key: 'performance', label: 'Performance' },
  { key: 'visual', label: 'Visual' },
  { key: 'mechanics', label: 'Mechanics' },
];

const GroupResourcesScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState('general');

  const gid = group?.internal_id || groupId;

  const { data: resourcesData, isLoading, refetch } = useGetGroupResourcesQuery(
    { group_id: gid, category: selectedCategory },
    { skip: !gid }
  );

  const { data: membersData } = useGetGroupMembersQuery(
    { group_id: gid },
    { skip: !gid }
  );

  const [createResource, { isLoading: isCreating }] = useCreateGroupResourceMutation();
  const [upvote] = useUpvoteResourceMutation();
  const [downvote] = useDownvoteResourceMutation();

  const resources = resourcesData?.entries || [];
  const members = membersData?.members || [];
  const currentMembership = members.find(m => m.user_id === userInfo?.user_id);
  const isMember = currentMembership?.status === 'active';

  const handleVote = async (item, type) => {
    try {
      if (type === 'up') {
        await upvote({ internal_id: item.internal_id }).unwrap();
      } else {
        await downvote({ internal_id: item.internal_id }).unwrap();
      }
      refetch();
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      await createResource({
        group_id: group.internal_id,
        title: newTitle,
        body: newBody,
        url: newUrl,
        category: newCategory,
      }).unwrap();
      setShowCreateModal(false);
      setNewTitle('');
      setNewBody('');
      setNewUrl('');
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to create resource');
    }
  };

  const handleTabPress = (tab) => {
    if (tab === 'Posts') { navigation.navigate('GroupDetail', { groupId }); return; }
    if (tab === 'Resources') return;
    const screenMap = {
      Forum: 'GroupForum',
      Cars: 'GroupCars',
      Market: 'GroupMarketplace',
      Events: 'GroupEvents',
      News: 'GroupNews',
    };
    navigation.replace(screenMap[tab], { groupId, group });
  };

  const renderItem = ({ item }) => (
    <GroupResourceCard
      item={item}
      onPress={() => { setSelectedItem(item); setShowDetailModal(true); }}
      netVotes={(item.upvotes || 0) - (item.downvotes || 0)}
      onVote={handleVote}
    />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group?.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <GroupNav group={group} activeTab="Resources" onTabPress={handleTabPress} />
      <GroupHeading group={group} pageTitle="Resources" />

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryContent}>
        <TouchableOpacity
          style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>All</Text>
        </TouchableOpacity>
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat.key)}
          >
            <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>{cat.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isMember && (
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <FAIcon name="plus" size={14} color={colors.WHITE} />
          <Text style={styles.createBtnText}>Add Resource</Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={resources}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.internal_id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No resources yet</Text>}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Resource</Text>
            <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
              <Text style={styles.modalSave}>{isCreating ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
              {categories.map(cat => (
                <TouchableOpacity
                  key={cat.key}
                  style={[styles.pickerItem, newCategory === cat.key && styles.pickerItemActive]}
                  onPress={() => setNewCategory(cat.key)}
                >
                  <Text style={[styles.pickerText, newCategory === cat.key && styles.pickerTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="Resource title..." />
            <Text style={styles.inputLabel}>URL (optional)</Text>
            <TextInput style={styles.input} value={newUrl} onChangeText={setNewUrl} placeholder="https://..." />
            <Text style={styles.inputLabel}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Describe the resource..."
              multiline
              numberOfLines={6}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Detail Modal */}
      <Modal visible={showDetailModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDetailModal(false)}>
              <Text style={styles.modalCancel}>Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Resource</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.detailCategory}>{selectedItem.category}</Text>
                <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                <Text style={styles.detailAuthor}>by {selectedItem.user?.username}</Text>
                {selectedItem.url && (
                  <Text style={styles.detailLink}>{selectedItem.url}</Text>
                )}
                <Text style={styles.detailBody}>{selectedItem.body?.replace(/<[^>]*>/g, '')}</Text>
                <View style={styles.commentsSection}>
                  <Comments document_id={selectedItem.internal_id} document_type="groupresource" />
                </View>
              </>
            )}
          </ScrollView>
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
  categoryBar: { backgroundColor: colors.WHITE },
  categoryContent: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  categoryChip: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16,
    backgroundColor: colors.LIGHT_GRAY, marginRight: 8,
  },
  categoryChipActive: { backgroundColor: colors.BRG },
  categoryText: { fontSize: 13, color: colors.TEXT_PRIMARY },
  categoryTextActive: { color: colors.WHITE, fontWeight: '600' },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: colors.BRG, marginHorizontal: 16, marginVertical: 8,
    paddingVertical: 10, borderRadius: 8,
  },
  createBtnText: { color: colors.WHITE, fontWeight: '700' },
  loader: { marginTop: 40 },
  list: { padding: 16 },
  emptyText: { textAlign: 'center', color: colors.TEXT_SECONDARY, marginTop: 40 },
  modalContainer: { flex: 1, backgroundColor: colors.BACKGROUND },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.BORDER,
  },
  modalCancel: { color: colors.BRG, fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '700' },
  modalSave: { color: colors.BRG, fontSize: 16, fontWeight: '700' },
  modalContent: { padding: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.TEXT_PRIMARY, marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: colors.WHITE, borderRadius: 8, borderWidth: 1, borderColor: colors.BORDER,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  pickerScroll: { marginBottom: 8 },
  pickerItem: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY, marginRight: 8,
  },
  pickerItemActive: { backgroundColor: colors.BRG },
  pickerText: { fontSize: 13, color: colors.TEXT_PRIMARY },
  pickerTextActive: { color: colors.WHITE, fontWeight: '600' },
  detailCategory: {
    fontSize: 12, fontWeight: '700', color: colors.BRG, backgroundColor: 'rgba(28,55,56,0.1)',
    alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6,
    overflow: 'hidden', textTransform: 'uppercase',
  },
  detailTitle: { fontSize: 22, fontWeight: '800', color: colors.TEXT_PRIMARY, marginTop: 12 },
  detailAuthor: { fontSize: 14, color: colors.TEXT_SECONDARY, marginTop: 6 },
  detailLink: { fontSize: 14, color: colors.BLUE, marginTop: 8 },
  detailBody: { fontSize: 15, color: colors.TEXT_PRIMARY, lineHeight: 22, marginTop: 16 },
  commentsSection: { marginTop: 24 },
});

export default GroupResourcesScreen;
