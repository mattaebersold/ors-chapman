import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import { colors } from '../constants/colors';
import { 
  useGetCommentsQuery, 
  useCreateCommentMutation, 
  useUpdateCommentMutation, 
  useDeleteCommentMutation,
  useGetUserDetailsQuery
} from '../services/apiService';
import UserBadge from './overlays/UserBadge';
import LoadingIndicator from './ui/LoadingIndicator';
import ErrorMessage from './ui/ErrorMessage';
import FAIcon from './ui/FAIcon';

const Comments = ({ document_id, document_type = 'post' }) => {
  const { userInfo } = useSelector(state => state.auth);
  const { data: currentUser } = useGetUserDetailsQuery();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');
  
  const { 
    data: commentsData, 
    isLoading, 
    error,
    refetch
  } = useGetCommentsQuery({
    document_id,
    document_type,
    page: 0,
    limit: 20
  }, {
    skip: !document_id
  });

  const [createComment, { isLoading: creating }] = useCreateCommentMutation();
  const [updateComment, { isLoading: updating }] = useUpdateCommentMutation();
  const [deleteComment, { isLoading: deleting }] = useDeleteCommentMutation();

  if (!document_id) return null;

  const comments = commentsData?.entries || [];
  const commentCount = commentsData?.total || 0;


  const handleCreateComment = async () => {
    if (!newComment.trim() || !currentUser) return;

    try {
      await createComment({
        document_id,
        document_type,
        body: newComment.trim()
      }).unwrap();
      setNewComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
      Alert.alert('Error', 'Failed to create comment. Please try again.');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment.internal_id);
    setEditText(comment.body);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim() || !editingComment) return;

    try {
      await updateComment({
        internal_id: editingComment,
        body: editText.trim()
      }).unwrap();
      setEditingComment(null);
      setEditText('');
      refetch();
    } catch (error) {
      console.error('Error updating comment:', error);
      Alert.alert('Error', 'Failed to update comment. Please try again.');
    }
  };

  const handleDeleteComment = (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteComment({ internal_id: commentId }).unwrap();
              refetch();
            } catch (error) {
              console.error('Error deleting comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderComment = ({ item: comment }) => {
    const isUserComment = currentUser && comment.user_id === currentUser.user_id;
    const isEditing = editingComment === comment.internal_id;

    return (
      <View style={styles.commentItem}>
        <View style={styles.commentHeader}>
          <View style={styles.commentHeaderLeft}>
            <UserBadge userId={comment.user_id} small={true} />
            <Text style={styles.username}>{comment.username || 'User'}</Text>
            {isUserComment && (
              <View style={styles.yourCommentBadge}>
                <Text style={styles.yourCommentText}>You</Text>
              </View>
            )}
          </View>
          <Text style={styles.commentDate}>
            {new Date(comment.created_at).toLocaleDateString()}
          </Text>
        </View>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              style={styles.editInput}
              value={editText}
              onChangeText={setEditText}
              multiline
              placeholder="Edit your comment..."
            />
            <View style={styles.editActions}>
              <TouchableOpacity 
                style={styles.cancelEditButton}
                onPress={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
              >
                <Text style={styles.cancelEditText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveEditButton, updating && styles.disabledButton]}
                onPress={handleUpdateComment}
                disabled={updating}
              >
                <Text style={styles.saveEditText}>
                  {updating ? 'Saving...' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.commentContent}>
            <Text style={styles.commentText}>{comment.body}</Text>
            {isUserComment && (
              <View style={styles.commentActions}>
                <TouchableOpacity 
                  style={styles.editActionButton}
                  onPress={() => handleEditComment(comment)}
                >
                  <FAIcon name="edit" size={10} color={colors.WHITE} />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.deleteActionButton}
                  onPress={() => handleDeleteComment(comment.internal_id)}
                >
                  <FAIcon name="trash" size={10} color={colors.WHITE} />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Comments Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FAIcon name="comment" size={16} color={colors.WHITE} />
          <Text style={styles.headerTitle}>
            Comments {commentCount > 0 && `(${commentCount})`}
          </Text>
        </View>
      </View>

      {/* Comments Content */}
      <View style={styles.content}>
          {/* New Comment Input */}
          {currentUser && (
            <View style={styles.newCommentContainer}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Write a comment..."
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[
                  styles.postCommentButton, 
                  (!newComment.trim() || creating) && styles.disabledButton
                ]}
                onPress={handleCreateComment}
                disabled={!newComment.trim() || creating}
              >
                <FAIcon name="send" size={12} color={colors.WHITE} />
                <Text style={styles.postCommentText}>
                  {creating ? 'Posting...' : 'Post Comment'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Comments List */}
          {isLoading ? (
            <LoadingIndicator text="Loading comments..." />
          ) : error ? (
            <ErrorMessage message="Failed to load comments" />
          ) : comments.length === 0 ? (
            <Text style={styles.noCommentsText}>No comments yet</Text>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item.internal_id}
              scrollEnabled={false}
            />
          )}
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.BACKGROUND,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.WHITE,
  },
  content: {
    backgroundColor: colors.WHITE,
  },
  newCommentContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: colors.LIGHT_GRAY,
    gap: 8,
  },
  commentInput: {
    backgroundColor: colors.WHITE,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  postCommentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    alignSelf: 'flex-end',
    gap: 6,
  },
  disabledButton: {
    backgroundColor: colors.GRAY,
  },
  postCommentText: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  commentItem: {
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  commentHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  yourCommentBadge: {
    backgroundColor: colors.SPEED,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  yourCommentText: {
    color: colors.BLACK,
    fontSize: 9,
    fontWeight: '800',
  },
  commentDate: {
    fontSize: 11,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  commentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  commentText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    lineHeight: 20,
    flex: 1,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  editActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  deleteActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.ERROR,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  actionButtonText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '700',
  },
  editContainer: {
    gap: 12,
  },
  editInput: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  cancelEditButton: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  cancelEditText: {
    color: colors.TEXT_PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  saveEditButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  saveEditText: {
    color: colors.WHITE,
    fontSize: 13,
    fontWeight: '700',
  },
  errorText: {
    fontSize: 14,
    color: colors.ERROR,
    textAlign: 'center',
    paddingVertical: 20,
  },
  noCommentsText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default Comments;