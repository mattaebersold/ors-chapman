import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const BaseBadge = ({ 
  imageSource, 
  displayName, 
  iconName, 
  onPress, 
  style = {},
  disabled = false 
}) => {
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
        {displayName}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BLACK,
    borderRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  image: {
    width: 20,
    height: 20,
    borderRadius: 0, // Square image, no border radius
    marginRight: 8,
  },
  placeholder: {
    backgroundColor: colors.BLACK,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '800',
    paddingRight: 8, // Only right padding for text
  },
});

export default BaseBadge;