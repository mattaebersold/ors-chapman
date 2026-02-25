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
import GroupNewsCard from '../components/groups/GroupNewsCard';
import Comments from '../components/Comments';
import {
  useGetGroupNewsQuery,
  useGetGroupMembersQuery,
  useCreateGroupNewsMutation,
} from '../services/apiService';

const GroupNewsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group } = route.params || {};
  const { userInfo } = useSelector(state => state.auth);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const { data: newsData, isLoading, refetch } = useGetGroupNewsQuery(
    { group_id: group?.internal_id },
    { skip: !group?.internal_id }
  );

  const { data: membersData } = useGetGroupMembersQuery(
    { group_id: group?.internal_id },
    { skip: !group?.internal_id }
  );

  const [createNews, { isLoading: isCreating }] = useCreateGroupNewsMutation();

  const news = newsData?.entries || [];
  const members = membersData?.members || [];
  const currentMembership = members.find(m => m.user_id === userInfo?.user_id);
  const isAdmin = currentMembership?.status === 'active' &&
    (currentMembership?.member_type === 'admin' || currentMembership?.member_type === 'owner');

  const handleCreate = async () => {
    if (!newTitle.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }
    try {
      await createNews({
        group_id: group.internal_id,
        title: newTitle,
        body: newBody,
        url: newUrl,
      }).unwrap();
      setShowCreateModal(false);
      setNewTitle('');
      setNewBody('');
      setNewUrl('');
      refetch();
    } catch (err) {
      Alert.alert('Error', 'Failed to create news');
    }
  };

  const handleTabPress = (tab) => {
    const screenMap = {
      Forum: 'GroupForum',
      Cars: 'GroupCars',
      Market: 'GroupMarketplace',
      Events: 'GroupEvents',
      News: 'GroupNews',
      Resources: 'GroupResources',
    };
    if (tab !== 'News') {
      navigation.replace(screenMap[tab], { groupId, group });
    }
  };

  const renderItem = ({ item }) => (
    <GroupNewsCard
      item={item}
      onPress={() => { setSelectedItem(item); setShowDetailModal(true); }}
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

      <GroupNav group={group} activeTab="News" onTabPress={handleTabPress} />
      <GroupHeading group={group} pageTitle="News" />

      {isAdmin && (
        <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
          <FAIcon name="plus" size={14} color={colors.WHITE} />
          <Text style={styles.createBtnText}>Add News</Text>
        </TouchableOpacity>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={news}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.internal_id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No news yet</Text>}
        />
      )}

      {/* Create Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add News</Text>
            <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
              <Text style={styles.modalSave}>{isCreating ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Title</Text>
            <TextInput style={styles.input} value={newTitle} onChangeText={setNewTitle} placeholder="News title..." />
            <Text style={styles.inputLabel}>External URL (optional)</Text>
            <TextInput style={styles.input} value={newUrl} onChangeText={setNewUrl} placeholder="https://..." />
            <Text style={styles.inputLabel}>Body</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newBody}
              onChangeText={setNewBody}
              placeholder="Write news content..."
              multiline
              numberOfLines={8}
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
            <Text style={styles.modalTitle}>News</Text>
            <View style={{ width: 50 }} />
          </View>
          <ScrollView style={styles.modalContent}>
            {selectedItem && (
              <>
                <Text style={styles.detailTitle}>{selectedItem.title}</Text>
                <Text style={styles.detailAuthor}>by {selectedItem.user?.username}</Text>
                {selectedItem.url && (
                  <Text style={styles.detailLink}>{selectedItem.url}</Text>
                )}
                <Text style={styles.detailBody}>{selectedItem.body?.replace(/<[^>]*>/g, '')}</Text>
                <View style={styles.commentsSection}>
                  <Comments document_id={selectedItem.internal_id} document_type="groupnews" />
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
  textArea: { minHeight: 150, textAlignVertical: 'top' },
  detailTitle: { fontSize: 22, fontWeight: '800', color: colors.TEXT_PRIMARY },
  detailAuthor: { fontSize: 14, color: colors.TEXT_SECONDARY, marginTop: 6 },
  detailLink: { fontSize: 14, color: colors.BLUE, marginTop: 8 },
  detailBody: { fontSize: 15, color: colors.TEXT_PRIMARY, lineHeight: 22, marginTop: 16 },
  commentsSection: { marginTop: 24 },
});

export default GroupNewsScreen;
