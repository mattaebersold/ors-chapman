import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import FAIcon from '../components/ui/FAIcon';
import GroupNav from '../components/groups/GroupNav';
import GroupHeading from '../components/groups/GroupHeading';
import Listing from '../components/Listing';

const GroupMarketplaceScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId, group } = route.params || {};
  const [activeTab, setActiveTab] = useState('listings');

  const handleTabPress = (tab) => {
    const screenMap = {
      Forum: 'GroupForum',
      Cars: 'GroupCars',
      Market: 'GroupMarketplace',
      Events: 'GroupEvents',
      News: 'GroupNews',
      Resources: 'GroupResources',
    };
    if (tab !== 'Market') {
      navigation.replace(screenMap[tab], { groupId, group });
    }
  };

  const tabs = [
    { key: 'listings', label: 'Listings' },
    { key: 'wantads', label: 'Want Ads' },
  ];

  const getConfig = () => {
    if (activeTab === 'listings') {
      return {
        type: 'listings',
        apiUrl: `/api/post?type=listing&group_id=${group?.internal_id}`,
      };
    }
    return {
      type: 'wantads',
      apiUrl: `/api/post?type=wantad&group_id=${group?.internal_id}`,
    };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FAIcon name="arrow-left" size={18} color={colors.WHITE} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{group?.title}</Text>
        <View style={{ width: 36 }} />
      </View>

      <GroupNav group={group} activeTab="Market" onTabPress={handleTabPress} />
      <GroupHeading group={group} pageTitle="Marketplace" />

      {/* Sub-tabs */}
      <View style={styles.subTabBar}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.subTab, activeTab === tab.key && styles.subTabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.subTabText, activeTab === tab.key && styles.subTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Listing
        key={activeTab}
        config={getConfig()}
        displayOptions={{ small: false }}
        numColumns={1}
      />
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
  subTabBar: {
    flexDirection: 'row', backgroundColor: colors.WHITE,
    borderBottomWidth: 1, borderBottomColor: colors.BORDER,
  },
  subTab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  subTabActive: { borderBottomWidth: 2, borderBottomColor: colors.BRG },
  subTabText: { fontSize: 14, color: colors.TEXT_SECONDARY },
  subTabTextActive: { color: colors.BRG, fontWeight: '700' },
});

export default GroupMarketplaceScreen;
