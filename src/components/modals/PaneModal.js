import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const { width, height } = Dimensions.get('window');

const PaneModal = ({ visible, onClose, title, children }) => {
  const slideAnim = React.useRef(new Animated.Value(width)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.pane,
                {
                  transform: [{ translateX: slideAnim }],
                },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.title}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <FAIcon name="times" size={24} color={colors.TEXT_PRIMARY} />
                </TouchableOpacity>
              </View>

              {/* Content */}
              <View style={styles.content}>
                {children}
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  pane: {
    width: width * 0.93,
    maxWidth: 900,
    height: height,
    backgroundColor: colors.WHITE,
    shadowColor: '#000',
    shadowOffset: {
      width: -2,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
});

export default PaneModal;
