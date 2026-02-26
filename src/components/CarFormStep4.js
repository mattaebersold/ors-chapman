import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './ui/FAIcon';

const CarFormStep4 = ({ taggedUsers = [], taggedEvents = [], onAddUser, onAddEvent, onRemoveUser, onRemoveEvent }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Tag Users */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FAIcon name="user" size={16} color={colors.BRG} />
            <Text style={styles.sectionTitle}>People</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddUser}>
            <FAIcon name="plus" size={14} color={colors.WHITE} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Tag people who built, own, or are associated with this car.
        </Text>

        {taggedUsers.length > 0 ? (
          <View style={styles.tagList}>
            {taggedUsers.map(user => (
              <View key={user.id} style={styles.tagItem}>
                <FAIcon name="user" size={14} color={colors.BRG} />
                <Text style={styles.tagItemText}>{user.label}</Text>
                <TouchableOpacity onPress={() => onRemoveUser(user.id)} style={styles.removeButton}>
                  <FAIcon name="times" size={14} color={colors.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No people tagged yet</Text>
        )}
      </View>

      {/* Tag Events */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <FAIcon name="calendar" size={16} color={colors.BRG} />
            <Text style={styles.sectionTitle}>Events</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
            <FAIcon name="plus" size={14} color={colors.WHITE} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDescription}>
          Tag events this car has attended or will attend.
        </Text>

        {taggedEvents.length > 0 ? (
          <View style={styles.tagList}>
            {taggedEvents.map(event => (
              <View key={event.id} style={styles.tagItem}>
                <FAIcon name="calendar" size={14} color={colors.BRG} />
                <Text style={styles.tagItemText}>{event.label}</Text>
                <TouchableOpacity onPress={() => onRemoveEvent(event.id)} style={styles.removeButton}>
                  <FAIcon name="times" size={14} color={colors.ERROR} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No events tagged yet</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    backgroundColor: colors.WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
  },
  sectionDescription: {
    fontSize: 13,
    color: colors.TEXT_SECONDARY,
    marginBottom: 16,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  addButtonText: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '600',
  },
  tagList: {
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.BACKGROUND,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  tagItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.TEXT_PRIMARY,
  },
  removeButton: {
    padding: 4,
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
});

export default CarFormStep4;
