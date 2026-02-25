import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const GroupMemberRow = ({ member, isAdmin, onApprove, onReject, onRemove, onPromote, onDemote, onCancel, onPress }) => {
  const profileImage = member.user?.gallery?.[0]?.filename
    ? { uri: `https://d2481n2uw7a0p.cloudfront.net/${member.user.gallery[0].filename}` }
    : null;

  const getRoleBadge = () => {
    if (member.member_type === 'admin' || member.member_type === 'owner') {
      return <Text style={styles.adminBadge}>Admin</Text>;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (member.status === 'pending') {
      return <Text style={styles.pendingBadge}>Pending</Text>;
    }
    if (member.status === 'invited') {
      return <Text style={styles.invitedBadge}>Invited</Text>;
    }
    return null;
  };

  const confirmAction = (title, message, action) => {
    Alert.alert(title, message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Confirm', onPress: action, style: 'destructive' },
    ]);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} disabled={!onPress}>
      <View style={styles.userInfo}>
        {profileImage ? (
          <Image source={profileImage} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <FAIcon name="user" size={16} color={colors.WHITE} />
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.username}>{member.user?.username || member.username || 'Unknown'}</Text>
          <View style={styles.badges}>
            {getRoleBadge()}
            {getStatusBadge()}
          </View>
        </View>
      </View>

      {isAdmin && (
        <View style={styles.actions}>
          {member.status === 'pending' && (
            <>
              <TouchableOpacity style={styles.approveBtn} onPress={() => onApprove?.(member)}>
                <FAIcon name="check" size={14} color={colors.WHITE} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => onReject?.(member)}>
                <FAIcon name="times" size={14} color={colors.WHITE} />
              </TouchableOpacity>
            </>
          )}
          {member.status === 'invited' && (
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => onCancel?.(member)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
          {member.status === 'active' && member.member_type !== 'owner' && (
            <>
              {member.member_type === 'admin' ? (
                <TouchableOpacity
                  style={styles.demoteBtn}
                  onPress={() => confirmAction('Demote', 'Demote this admin to basic member?', () => onDemote?.(member))}
                >
                  <FAIcon name="arrow-down" size={12} color={colors.WHITE} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.promoteBtn}
                  onPress={() => onPromote?.(member)}
                >
                  <FAIcon name="arrow-up" size={12} color={colors.WHITE} />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => confirmAction('Remove Member', 'Remove this member from the group?', () => onRemove?.(member))}
              >
                <FAIcon name="trash" size={12} color={colors.WHITE} />
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  adminBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.WHITE,
    backgroundColor: colors.BRG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  pendingBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.WHITE,
    backgroundColor: colors.WARNING,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  invitedBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.WHITE,
    backgroundColor: colors.BLUE,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.SUCCESS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ERROR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.GRAY,
  },
  cancelBtnText: {
    color: colors.WHITE,
    fontSize: 12,
    fontWeight: '600',
  },
  promoteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.WARNING,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.ERROR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default GroupMemberRow;
