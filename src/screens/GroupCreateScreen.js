import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Alert, ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import {
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetAllBrandsQuery,
  useGetBrandModelsQuery,
} from '../services/apiService';

const groupTypes = [
  { key: 'club', label: 'Club' },
  { key: 'community', label: 'Community' },
  { key: 'business', label: 'Business' },
];

const groupCategories = [
  { key: 'general', label: 'General' },
  { key: 'brand', label: 'Brand Specific' },
  { key: 'regional', label: 'Regional' },
  { key: 'style', label: 'Style/Build Type' },
];

const GroupCreateScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group, edit } = route.params || {};

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [body, setBody] = useState('');
  const [type, setType] = useState('club');
  const [category, setCategory] = useState('general');
  const [groupMake, setGroupMake] = useState('');
  const [groupModel, setGroupModel] = useState('');
  const [tags, setTags] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const { data: brandsData } = useGetAllBrandsQuery();
  const { data: modelsData } = useGetBrandModelsQuery(groupMake, { skip: !groupMake });

  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [updateGroup, { isLoading: isUpdating }] = useUpdateGroupMutation();
  const [deleteGroup, { isLoading: isDeleting }] = useDeleteGroupMutation();

  const brands = brandsData?.brands || [];
  const models = modelsData?.models || [];

  useEffect(() => {
    if (edit && group) {
      setTitle(group.title || '');
      setSubtitle(group.subtitle || '');
      setBody(group.body?.replace(/<[^>]*>/g, '') || '');
      setType(group.type || 'club');
      setCategory(group.category || 'general');
      setGroupMake(group.group_make || '');
      setGroupModel(group.group_model || '');
      setTags(group.tags?.join(', ') || '');
      setIsPrivate(group.private || false);
    }
  }, [edit, group]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('body', body);
    formData.append('type', type);
    formData.append('category', category);
    formData.append('private', isPrivate);
    if (groupMake) formData.append('group_make', groupMake);
    if (groupModel) formData.append('group_model', groupModel);
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
      formData.append('tags', JSON.stringify(tagArray));
    }
    if (edit) formData.append('internal_id', group.internal_id);

    try {
      if (edit) {
        await updateGroup(formData).unwrap();
        Alert.alert('Success', 'Group updated', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await createGroup(formData).unwrap();
        Alert.alert('Success', 'Group created', [
          { text: 'OK', onPress: () => navigation.navigate('GroupsList') }
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err?.data?.message || 'Failed to save group');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Group',
      'Are you sure you want to delete this group? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGroup({ internal_id: group.internal_id }).unwrap();
              navigation.navigate('GroupsList');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete group');
            }
          }
        }
      ]
    );
  };

  const isSaving = isCreating || isUpdating;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{edit ? 'Edit Group' : 'Create Group'}</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={isSaving} style={styles.saveBtn}>
          {isSaving ? (
            <ActivityIndicator size="small" color={colors.WHITE} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Type */}
        <Text style={styles.label}>Type</Text>
        <View style={styles.chipRow}>
          {groupTypes.map(t => (
            <TouchableOpacity
              key={t.key}
              style={[styles.chip, type === t.key && styles.chipActive]}
              onPress={() => setType(t.key)}
            >
              <Text style={[styles.chipText, type === t.key && styles.chipTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <View style={styles.chipRow}>
          {groupCategories.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[styles.chip, category === c.key && styles.chipActive]}
              onPress={() => setCategory(c.key)}
            >
              <Text style={[styles.chipText, category === c.key && styles.chipTextActive]}>{c.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Private toggle */}
        <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPrivate(!isPrivate)}>
          <Text style={styles.label}>Private Group</Text>
          <View style={[styles.toggle, isPrivate && styles.toggleActive]}>
            <View style={[styles.toggleDot, isPrivate && styles.toggleDotActive]} />
          </View>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Group name..."
        />

        {/* Subtitle */}
        <Text style={styles.label}>Subtitle</Text>
        <TextInput
          style={styles.input}
          value={subtitle}
          onChangeText={setSubtitle}
          placeholder="Short description..."
        />

        {/* Make/Model */}
        <Text style={styles.label}>Associated Make (optional)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.makeScroll}>
          <TouchableOpacity
            style={[styles.makeChip, !groupMake && styles.makeChipActive]}
            onPress={() => { setGroupMake(''); setGroupModel(''); }}
          >
            <Text style={[styles.makeChipText, !groupMake && styles.makeChipTextActive]}>None</Text>
          </TouchableOpacity>
          {brands.map(brand => (
            <TouchableOpacity
              key={brand}
              style={[styles.makeChip, groupMake === brand && styles.makeChipActive]}
              onPress={() => { setGroupMake(brand); setGroupModel(''); }}
            >
              <Text style={[styles.makeChipText, groupMake === brand && styles.makeChipTextActive]}>{brand}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {groupMake && models.length > 0 && (
          <>
            <Text style={styles.label}>Associated Model (optional)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.makeScroll}>
              <TouchableOpacity
                style={[styles.makeChip, !groupModel && styles.makeChipActive]}
                onPress={() => setGroupModel('')}
              >
                <Text style={[styles.makeChipText, !groupModel && styles.makeChipTextActive]}>All {groupMake}</Text>
              </TouchableOpacity>
              {models.map(model => (
                <TouchableOpacity
                  key={model}
                  style={[styles.makeChip, groupModel === model && styles.makeChipActive]}
                  onPress={() => setGroupModel(model)}
                >
                  <Text style={[styles.makeChipText, groupModel === model && styles.makeChipTextActive]}>{model}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        {/* Tags */}
        <Text style={styles.label}>Tags (comma separated)</Text>
        <TextInput
          style={styles.input}
          value={tags}
          onChangeText={setTags}
          placeholder="e.g. porsche, 911, track"
        />

        {/* Body */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={body}
          onChangeText={setBody}
          placeholder="Describe your group..."
          multiline
          numberOfLines={6}
        />

        {/* Delete button (edit mode only) */}
        {edit && (
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={isDeleting}>
            <FAIcon name="trash" size={16} color={colors.ERROR} />
            <Text style={styles.deleteBtnText}>{isDeleting ? 'Deleting...' : 'Delete Group'}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  saveBtn: { paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { color: colors.WHITE, fontSize: 16, fontWeight: '700' },
  content: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  label: { fontSize: 14, fontWeight: '600', color: colors.TEXT_PRIMARY, marginTop: 16, marginBottom: 8 },
  input: {
    backgroundColor: colors.WHITE, borderRadius: 8, borderWidth: 1, borderColor: colors.BORDER,
    paddingHorizontal: 12, paddingVertical: 12, fontSize: 15,
  },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY,
  },
  chipActive: { backgroundColor: colors.BRG },
  chipText: { fontSize: 14, color: colors.TEXT_PRIMARY },
  chipTextActive: { color: colors.WHITE, fontWeight: '600' },
  toggleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: 16,
  },
  toggle: {
    width: 50, height: 28, borderRadius: 14, backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center', paddingHorizontal: 2,
  },
  toggleActive: { backgroundColor: colors.BRG },
  toggleDot: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: colors.WHITE,
  },
  toggleDotActive: { alignSelf: 'flex-end' },
  makeScroll: { marginBottom: 8 },
  makeChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8,
    backgroundColor: colors.LIGHT_GRAY, marginRight: 8,
  },
  makeChipActive: { backgroundColor: colors.BRG },
  makeChipText: { fontSize: 13, color: colors.TEXT_PRIMARY },
  makeChipTextActive: { color: colors.WHITE, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 32, paddingVertical: 14, borderWidth: 1, borderColor: colors.ERROR, borderRadius: 8,
  },
  deleteBtnText: { color: colors.ERROR, fontSize: 16, fontWeight: '600' },
});

export default GroupCreateScreen;
