import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const navItems = [
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
        {navItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.navItem, activeTab === item.key && styles.navItemActive]}
            onPress={() => onTabPress(item.key)}
          >
            <FAIcon name={item.icon} size={18} color={colors.WHITE} />
            <Text style={styles.navLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
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
  },
  navLabel: {
    color: colors.WHITE,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});

// Override text color when active
GroupNav.navItemActiveText = { color: colors.BLACK };

export default GroupNav;
