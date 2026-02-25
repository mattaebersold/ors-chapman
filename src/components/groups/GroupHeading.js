import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

const GroupHeading = ({ group, pageTitle }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{group?.title} {pageTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.TEXT_PRIMARY,
  },
});

export default GroupHeading;
