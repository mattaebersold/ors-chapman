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
  disabled = false,
  small = false
}) => {
  const truncateText = (text, maxLength = 8) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  return (
    <TouchableOpacity 
      style={[
        styles.badge, 
        small ? styles.badgeSmall : styles.badgeNormal,
        style
      ]} 
      onPress={onPress}
      activeOpacity={disabled ? 1 : 0.7}
      disabled={disabled}
    >
      <View style={styles.imageContainer}>
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
      </View>

      {displayName.length > 0 && (
        <Text style={styles.text} numberOfLines={1}>
          {truncateText(displayName, 8)}
        </Text>
      )}

    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    // Remove overflow: 'hidden' here
  },
  badgeNormal: {
    marginLeft: 4,
  },
  badgeSmall: {
    marginHorizontal: 3,
  },
  imageContainer: {
    // Shadow container - no overflow hidden
  },
  image: {
    width: 26,
    height: 26,
    borderRadius: 100,
    marginRight: 0,
    backgroundColor: colors.BLACK,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    // Shadow for Android
    elevation: 8,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: colors.WHITE,
    fontSize: 11,
    fontWeight: '600',
    paddingLeft: 3,
  },
});

export default BaseBadge;