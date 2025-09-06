import React from 'react';
import {
  View,
  Text,
  Switch,
  StyleSheet,
} from 'react-native';
import { colors } from '../constants/colors';

const FormSwitch = ({
  label,
  description,
  value,
  onValueChange,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>{label}</Text>
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ 
            false: colors.LIGHT_GRAY, 
            true: colors.BRG + '50' 
          }}
          thumbColor={value ? colors.BRG : colors.WHITE}
          ios_backgroundColor={colors.LIGHT_GRAY}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  description: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginTop: 4,
    lineHeight: 18,
  },
});

export default FormSwitch;