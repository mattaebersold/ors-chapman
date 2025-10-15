import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
// import { truncateText } from '../../utils/styleUtils';

const BaseBadge = ({ 
  imageSource, 
  displayName, 
  iconName, 
  onPress, 
  style = {},
  disabled = false 
}) => {
  const truncateText = (text, maxLength = 8) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  return (
    <TouchableOpacity 
      style={[styles.badge, style]} 
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.image, styles.placeholder]}>
          <FAIcon name={iconName} size={12} color={colors.WHITE} />
        </View>
      )}
      <Text style={styles.text} numberOfLines={1}>
        {truncateText(displayName, 8)}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    overflow: 'hidden',
    marginRight: 2,
    marginLeft: 2,
  },
  image: {
    width: 26,
    height: 26,
    borderRadius: 100,
    marginRight: 8,
    backgroundColor: colors.BLACK
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    paddingRight: 8,
  },
});

export default BaseBadge;