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
import UserBadge from './UserBadge';
import LoadingIndicator from './LoadingIndicator';
import ErrorMessage from './ErrorMessage';
import FAIcon from './FAIcon';

const Comments = ({ document_id, document_type = 'post' }) => {
  const { userInfo } = useSelector(state => state.auth);
  const { data: currentUser } = useGetUserDetailsQuery();
  const [collapsed, setCollapsed] = useState(true); // Start collapsed
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
          <UserBadge userId={comment.user_id} />
          {isUserComment && (
            <View style={styles.yourCommentBadge}>
              <Text style={styles.yourCommentText}>Your Comment</Text>
            </View>
          )}
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
                style={styles.cancelButton}
                onPress={() => {
                  setEditingComment(null);
                  setEditText('');
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.saveButton, updating && styles.disabledButton]}
                onPress={handleUpdateComment}
                disabled={updating}
              >
                <Text style={styles.saveText}>
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
                  style={styles.actionButton}
                  onPress={() => handleEditComment(comment)}
                >
                  <FAIcon name="ellipsis-v" size={12} color={colors.TEXT_SECONDARY} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => handleDeleteComment(comment.internal_id)}
                >
                  <FAIcon name="times" size={12} color={colors.ERROR} />
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
      <TouchableOpacity 
        style={styles.header}
        onPress={() => setCollapsed(!collapsed)}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <FAIcon name="comment" size={16} color={colors.BRG} />
          <Text style={styles.headerTitle}>
            Comments {commentCount > 0 && `(${commentCount})`}
          </Text>
        </View>
        <FAIcon 
          name={collapsed ? "chevron-right" : "chevron-left"} 
          size={16} 
          color={colors.TEXT_SECONDARY} 
        />
      </TouchableOpacity>

      {/* Comments Content */}
      {!collapsed && (
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
                  styles.postButton, 
                  (!newComment.trim() || creating) && styles.disabledButton
                ]}
                onPress={handleCreateComment}
                disabled={!newComment.trim() || creating}
              >
                <Text style={styles.postButtonText}>
                  {creating ? 'Posting...' : 'Post'}
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.WHITE,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  content: {
    padding: 16,
  },
  newCommentContainer: {
    marginBottom: 16,
    gap: 12,
  },
  commentInput: {
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
  postButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  disabledButton: {
    backgroundColor: colors.GRAY,
  },
  postButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  yourCommentBadge: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  yourCommentText: {
    color: colors.WHITE,
    fontSize: 10,
    fontWeight: '600',
  },
  commentDate: {
    fontSize: 12,
    color: colors.TEXT_SECONDARY,
    marginLeft: 'auto',
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
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 4,
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
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelText: {
    color: colors.TEXT_SECONDARY,
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  saveText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
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