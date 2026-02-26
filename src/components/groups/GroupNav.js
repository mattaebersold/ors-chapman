import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const navItems = [
  { key: 'Posts', label: 'Posts', icon: 'feed' },
  { key: 'Forum', label: 'Forum', icon: 'comments' },
  { key: 'Cars', label: 'Cars', icon: 'car' },
  { key: 'Market', label: 'Market', icon: 'money' },
  { key: 'Events', label: 'Events', icon: 'map' },
  { key: 'News', label: 'News', icon: 'bullhorn' },
  { key: 'Resources', label: 'Resources', icon: 'wrench' },
];

const GroupNav = ({ group, activeTab, onTabPress }) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => onTabPress(item.key)}
              activeOpacity={1}
            >
              <FAIcon name={item.icon} size={18} color={isActive ? colors.BLACK : colors.WHITE} />
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BRG,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    minWidth: 70,
  },
  navItemActive: {
    backgroundColor: colors.WHITE,
    borderColor: colors.WHITE,
  },
  navLabel: {
    color: colors.WHITE,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: colors.BLACK,
    fontWeight: '700',
  },
});

export default GroupNav;
