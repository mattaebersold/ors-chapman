import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  ScrollView,
  Animated,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';

const MENU_WIDTH = 300;

const HamburgerMenu = ({ navigation }) => {
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const openMenu = () => {
    setIsVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -MENU_WIDTH,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  };

  const navigateToPage = (page, params) => {
    closeMenu();
    setTimeout(() => navigation.navigate(page, params), 220);
  };

  const menuItems = [
    { title: 'Main Feed', page: 'Home', params: { screen: 'Feed' }, icon: 'feed' },
    { title: 'Groups', page: 'GroupsList', icon: 'users' },
    { title: 'Messages', page: 'Messages', icon: 'envelope' },
    { title: 'About', page: 'About', icon: 'user' },
    { title: 'Features', page: 'Features', icon: 'plus' },
    { title: 'Changelog', page: 'Changelog', icon: 'new' },
    { title: 'Roadmap', page: 'Roadmap', icon: 'home' },
    { title: 'Support', page: 'Support', icon: 'comment' },
  ];

  return (
    <>
      <TouchableOpacity style={styles.hamburgerButton} onPress={openMenu}>
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
        <View style={styles.hamburgerLine} />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeMenu}
        presentationStyle="overFullScreen"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.overlayBackground, { opacity: fadeAnim }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={closeMenu} />
          </Animated.View>
          <Animated.View style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <TouchableOpacity onPress={closeMenu} style={styles.closeButton}>
                <FAIcon name="times" size={24} color={colors.WHITE} />
              </TouchableOpacity>
              <Text style={styles.menuTitle}>Open Road Society</Text>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContent}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={() => navigateToPage(item.page, item.params)}
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
          </Animated.View>
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
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  overlayBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: MENU_WIDTH,
    backgroundColor: colors.BRG,
  },
  safeArea: {
    flex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_BRG,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.WHITE,
    marginLeft: 16,
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