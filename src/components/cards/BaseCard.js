import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import GradientPlaceholder from '../ui/GradientPlaceholder';

const BaseCard = ({
  // Image props
  imageSource,
  imageHeight = 200,
  placeholderIcon = 'camera',
  placeholderText = 'No Image',
  
  // Content props
  title,
  subtitle,
  description,
  
  // Action props
  onPress,
  
  // Style props
  cardStyle,
  imageContainerStyle,
  contentStyle,
  
  // Layout props
  children,
  headerComponent,
  footerComponent,
  overlayComponent,
}) => {
  
  const getImageSource = () => {
    if (typeof imageSource === 'string') {
      return { uri: imageSource };
    }
    return imageSource;
  };

  const renderImageContainer = () => (
    <View style={[styles.imageContainer, { height: imageHeight }, imageContainerStyle]}>
      {imageSource ? (
        <Image 
          source={getImageSource()} 
          style={[styles.image, { height: imageHeight }]}
          resizeMode="cover"
        />
      ) : (
        <GradientPlaceholder
          height={imageHeight}
          icon={placeholderIcon}
          text={placeholderText}
        />
      )}
      
      {/* Overlay component (badges, buttons, etc.) */}
      {overlayComponent}
    </View>
  );

  const renderContent = () => (
    <View style={[styles.content, contentStyle]}>
      {/* Header component (custom header content) */}
      {headerComponent}
      
      {/* Default content */}
      {title && (
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
      )}
      
      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
      
      {description && (
        <Text style={styles.description} numberOfLines={2}>
          {description}
        </Text>
      )}
      
      {/* Custom children content */}
      {children}
      
      {/* Footer component (badges, stats, actions, etc.) */}
      {footerComponent}
    </View>
  );

  const CardContainer = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  return (
    <CardContainer style={[styles.card, cardStyle]} {...containerProps}>
      {renderImageContainer()}
      {renderContent()}
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.WHITE,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
  },
  image: {
    width: '100%',
  },
  placeholderContainer: {
    width: '100%',
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 12,
    color: colors.GRAY,
    marginTop: 8,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
});

export default BaseCard;