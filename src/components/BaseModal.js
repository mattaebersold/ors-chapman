import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const BaseModal = ({
  visible,
  onClose,
  title,
  subtitle,
  children,
  headerStyle,
  contentStyle,
  presentationStyle = 'pageSheet',
  animationType = 'slide',
  showHeader = true,
  showCloseButton = true,
  headerLeftButton,
  headerRightButton,
  scrollable = true,
  keyboardAvoiding = true,
}) => {
  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={[styles.header, headerStyle]}>
        <View style={styles.headerLeft}>
          {headerLeftButton || (showCloseButton && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.headerCenter}>
          {title && <Text style={styles.headerTitle}>{title}</Text>}
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        
        <View style={styles.headerRight}>
          {headerRightButton}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    const content = scrollable ? (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    ) : (
      <View style={[styles.content, contentStyle]}>
        {children}
      </View>
    );

    if (keyboardAvoiding) {
      return (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
        >
          {content}
        </KeyboardAvoidingView>
      );
    }

    return content;
  };

  return (
    <Modal
      visible={visible}
      animationType={animationType}
      presentationStyle={presentationStyle}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.LIGHT_GRAY,
    minHeight: 56,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.WHITE,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.WHITE,
    opacity: 0.8,
    textAlign: 'center',
    marginTop: 2,
  },
  closeButton: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.WHITE,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  keyboardAvoid: {
    flex: 1,
  },
});

export default BaseModal;