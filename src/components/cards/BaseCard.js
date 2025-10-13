import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // or 'react-native-linear-gradient'
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';


const BaseCard = ({
  // Image props
  imageSource,
  // placeholderIcon = 'camera',
  // placeholderText = 'No Image',
  
  // Content props
  title,
  // subtitle,
  // description,
  
  // Action props
  onPress,
    
  // Layout props
  headerComponent,
  footerComponent,
  badges,

  topRight,
  topLeft,
  bottomRight,
  bottomLeft,
  topCenter,
  bottomCenter,

}) => {
  
  const getImageSource = () => {
    if (typeof imageSource === 'string') {
      return { uri: imageSource };
    }
    return imageSource;
  };

  const renderImageContainer = () => (
    <View style={styles.imageContainer}>
      {imageSource ? (
        <Image 
          source={getImageSource()} 
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <></>
      )}
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .5)']}
        style={styles.gradient}
      />
      

    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>

      {topLeft && (
        <View style={styles.topLeft}>{topLeft}</View>
      )}

      {topRight && (
        <View style={styles.topRight}>{topRight}</View>
      )}

      {bottomLeft && (
        <View style={styles.bottomLeft}>{bottomLeft}</View>
      )}

      {bottomRight && (
        <View style={styles.bottomRight}>{bottomRight}</View>
      )}

      {topCenter && (
        <View style={styles.topCenter}>{topCenter}</View>
      )}

      {bottomCenter && (
        <View style={styles.bottomCenter}>{bottomCenter}</View>
      )}

    </View>
  );

  const CardContainer = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <CardContainer style={styles.card} {...containerProps}>
      {renderImageContainer()}
      {renderContent()}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    aspectRatio: 85/60,
    width: '100%',
    elevation: 3,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: colors.CARD_DARK,
    borderRadius: 24,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  imageContainer: {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
  },
  image: {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  placeholderContainer: {
    width: '100%',
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },

  topLeft: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  topRight: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 12,
    left: 12,
  },
  bottomRight: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },
});

export default BaseCard;