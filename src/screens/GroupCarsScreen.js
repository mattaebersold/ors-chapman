import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import GroupNav from '../components/groups/GroupNav';
import GroupHeading from '../components/groups/GroupHeading';
import CarCard from '../components/cards/CarCard';
import { useGetGroupCarsQuery } from '../services/apiService';

const GroupCarsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group } = route.params || {};

  const gid = group?.internal_id || groupId;

  const { data: carsData, isLoading, refetch } = useGetGroupCarsQuery(
    { group_id: gid },
    { skip: !gid }
  );

  const cars = carsData?.entries || [];

  const handleTabPress = (tab) => {
    if (tab === 'Posts') { navigation.navigate('GroupDetail', { groupId }); return; }
    if (tab === 'Cars') return;
    const screenMap = {
      Forum: 'GroupForum',
      Market: 'GroupMarketplace',
      Events: 'GroupEvents',
      News: 'GroupNews',
      Resources: 'GroupResources',
    };
    navigation.replace(screenMap[tab], { groupId, group });
  };

  const getFilterDescription = () => {
    if (group?.group_make && group?.group_model) {
      return `Showing cars associated with this group and member ${group.group_make} ${group.group_model} cars`;
    } else if (group?.group_make) {
      return `Showing cars associated with this group and member ${group.group_make} cars`;
    }
    return null;
  };

  const renderItem = ({ item }) => (
    <View style={styles.cardWrapper}>
      <CarCard post={item} displayOptions={{ small: true }} />
    </View>
  );

  const filterDescription = getFilterDescription();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group?.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <GroupNav group={group} activeTab="Cars" onTabPress={handleTabPress} />
      <GroupHeading group={group} pageTitle="Member Cars" />

      {filterDescription && (
        <Text style={styles.filterDesc}>{filterDescription}</Text>
      )}

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.BRG} style={styles.loader} />
      ) : (
        <FlatList
          data={cars}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.internal_id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No cars yet</Text>}
        />
      )}
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
  filterDesc: { paddingHorizontal: 16, paddingVertical: 8, color: colors.TEXT_SECONDARY, fontSize: 13 },
  loader: { marginTop: 40 },
  list: { padding: 8 },
  row: { justifyContent: 'space-between' },
  cardWrapper: { width: '49%' },
  emptyText: { textAlign: 'center', color: colors.TEXT_SECONDARY, marginTop: 40 },
});

export default GroupCarsScreen;
