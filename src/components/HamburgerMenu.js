import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const HamburgerMenu = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleMenu = () => {
    setIsVisible(!isVisible);
  };

  const navigateToPage = (pageName) => {
    setIsVisible(false);
    navigation.navigate(pageName);
  };

  const menuItems = [
    { title: 'About', page: 'About', icon: 'user' },
    { title: 'Features', page: 'Features', icon: 'plus' },
    { title: 'Changelog', page: 'Changelog', icon: 'new' },
    { title: 'Roadmap', page: 'Roadmap', icon: 'home' },
    { title: 'Support', page: 'Support', icon: 'comment' },
  ];

  return (
    <>
      <TouchableOpacity style={styles.hamburgerButton} onPress={toggleMenu}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsVisible(false)}
        presentationStyle="fullScreen"
      >
        <View style={styles.menuContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Open Road Society</Text>
              <TouchableOpacity onPress={toggleMenu} style={styles.closeButton}>
                <FAIcon name="times" size={24} color={colors.WHITE} />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContent}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => navigateToPage(item.page)}
                >
                  <FAIcon name={item.icon} size={20} color={colors.WHITE} />
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <FAIcon name="chevron-right" size={16} color={colors.WHITE} />
                </TouchableOpacity>
              ))}

              {/* Divider */}
              <View style={styles.divider} />

              {/* Additional Info */}
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>Open Road Society</Text>
                <Text style={styles.infoSubtext}>Car enthusiast community</Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  hamburgerButton: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
    marginLeft: 16,
  },
  hamburgerLine: {
    width: '100%',
    height: 2,
    backgroundColor: colors.WHITE,
    borderRadius: 1,
  },
  menuContainer: {
    flex: 1,
    backgroundColor: colors.BRG,
    width: '100%',
  },
  safeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_BRG,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.WHITE,
  },
  closeButton: {
    padding: 4,
  },
  menuContent: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.LIGHT_BRG,
  },
  menuItemText: {
    fontSize: 16,
    color: colors.WHITE,
    marginLeft: 16,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.LIGHT_BRG,
    marginHorizontal: 20,
    marginVertical: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  infoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.WHITE,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.LIGHT_GRAY,
  },
});

export default HamburgerMenu;