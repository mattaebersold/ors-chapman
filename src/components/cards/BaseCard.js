import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/colors';
import { spacing } from '../../constants/layout';


const BaseCard = ({
  // Image props
  imageSource,
  // placeholderIcon = 'camera',
  // placeholderText = 'No Image',
  
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

  small

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
        <Image
          source={require('../../../assets/placeholder.jpg')}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      {/* Gradient overlay */}
      <LinearGradient
        colors={['rgba(0, 0, 0, .6)', 'rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, .8)']}
        locations={[0, 0.5, 1]}
        style={styles.gradient}
      />
      

    </View>
  );

  const renderContent = () => (
    <View style={styles.content}>

      {topLeft && (
        <View style={small ? styles.topLeftSmall : styles.topLeft}>{topLeft}</View>
      )}

      {topRight && (
        <View style={small ? styles.topRightSmall : styles.topRight}>{topRight}</View>
      )}

      {bottomLeft && (
        <View style={small ? styles.bottomLeftSmall : styles.bottomLeft}>{bottomLeft}</View>
      )}

      {bottomRight && (
        <View style={small ? styles.bottomRightSmall : styles.bottomRight}>{bottomRight}</View>
      )}

      {topCenter && (
        <View style={small ? styles.topCenterSmall : styles.topCenter}>{topCenter}</View>
      )}

      {bottomCenter && (
        <View style={small ? styles.bottomCenterSmall : styles.bottomCenter}>{bottomCenter}</View>
      )}

    </View>
  );

  const CardContainer = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <CardContainer style={small ? styles.cardMultiColumn : styles.card} {...containerProps}>
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
  cardMultiColumn: {
    aspectRatio: 1/1,
    width: '100%',
    marginBottom: 8,
    borderRadius: 13,
    overflow: 'hidden',
    backgroundColor: colors.CARD_DARK,
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
    width: '50%'
  },
  topRight: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: '50%',
    alignItems: 'flex-end'
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    width: '80%',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 12,
    width: '20%',
    alignItems: 'flex-end'
  },
  bottomCenter: {
    position: 'absolute',
    bottom: 16,
    width: '75%',
    alignItems: 'center',
    alignSelf: 'center'
  },
  topCenter: {
    position: 'absolute',
    top: 16,
    width: '70%',
    alignItems: 'center',
    alignSelf: 'center'
  },
  topLeftSmall: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: '60%'
  },
  topRightSmall: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: '40%',
  },
  bottomLeftSmall: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: '75%',
  },
  bottomRightSmall: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: '25%',
    alignItems: 'flex-end'
  },
  bottomCenterSmall: {
    position: 'absolute',
    bottom: 8,
    width: '50%',
    alignItems: 'center',
    alignSelf: 'center'
  },
  topCenterSmall: {
    position: 'absolute',
    top: 10,
    width: '50%',
    alignItems: 'center',
    alignSelf: 'center'
  },
});

export default BaseCard;