import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';

const GradientPlaceholder = ({
  width = '100%',
  height = 200,
  icon = 'camera',
  iconSize = 40,
  text = null,
  gradientColors = ['#6b7280', '#4b5563', '#6b7280'],
  style,
}) => {
  return (
    <View style={[{ width, height }, style]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <FAIcon name={icon} size={iconSize} color="#e5e7eb" />
          {text && (
            <Text style={styles.text}>{text}</Text>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    color: '#e5e7eb',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default GradientPlaceholder;