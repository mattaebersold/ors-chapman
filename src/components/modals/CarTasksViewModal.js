import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';

const CarTasksViewModal = ({
  visible,
  onClose,
  tasksData,
  tasksLoading,
  tasksError,
  onToggleTaskCompletion,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
}) => {
  const renderTasksContent = () => {
    if (tasksLoading) {
      return (
        <View style={styles.tasksModalLoadingContainer}>
          <FAIcon name="spinner" size={20} color={colors.BRG} />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      );
    }

    if (tasksError) {
      return (
        <View style={styles.tasksModalErrorContainer}>
          <FAIcon name="exclamation" size={24} color={colors.ERROR} />
          <Text style={styles.errorText}>Error loading tasks</Text>
          <Text style={styles.errorDetails}>
            {tasksError?.data?.message || tasksError?.message || 'Failed to load tasks'}
          </Text>
        </View>
      );
    }

    const tasks = tasksData?.entries || [];

    // Group tasks by type
    const tasksByType = tasks.reduce((groups, task) => {
      const type = task.type || 'other';
      if (!groups[type]) {
        groups[type] = [];
      }
      groups[type].push(task);
      return groups;
    }, {});

    // Type display names
    const typeLabels = {
      maintenance: 'Maintenance',
      repair: 'Repair',
      upgrade: 'Upgrade',
      inspection: 'Inspection',
      cleaning: 'Cleaning',
      modification: 'Modification',
      other: 'Other',
    };

    return (
      <>
        {/* Tasks List */}
        {tasks.length === 0 ? (
          <View style={styles.tasksModalEmptyState}>
            <Text style={styles.tasksModalEmptyTitle}>No To-Dos</Text>
            <Text style={styles.tasksModalEmptyMessage}>
              No tasks found for this car. Add your first task to get started!
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.tasksModalScrollView} showsVerticalScrollIndicator={false}>
            {Object.entries(tasksByType).map(([type, typeTasks]) => (
              <View key={type} style={styles.categoryGroup}>
                <Text style={styles.categoryTitle}>
                  {typeLabels[type] || type} ({typeTasks.length})
                </Text>
                {typeTasks.map((task, index) => (
                  <View key={task._id || index} style={[
                    styles.taskItem,
                    task.completed && styles.completedTask
                  ]}>
                    <View style={styles.taskHeader}>
                      <View style={styles.taskTitleRow}>
                        <TouchableOpacity
                          style={styles.checkbox}
                          onPress={() => onToggleTaskCompletion(task)}
                        >
                          <FAIcon
                            name={task.completed ? "check-square" : "square"}
                            size={24}
                            color={colors.WHITE}
                          />
                        </TouchableOpacity>
                        <Text style={[
                          styles.taskTitle,
                          task.completed && styles.completedTaskTitle
                        ]}>
                          {task.title}
                        </Text>
                      </View>
                      <View style={styles.taskActions}>
                        <View style={styles.reorderButtons}>
                          <TouchableOpacity
                            style={[styles.reorderButton, index === 0 && styles.disabledButton]}
                            onPress={() => onMoveTask(task.internal_id || task._id, 'up')}
                            disabled={index === 0}
                          >
                            <FAIcon name="chevron-up" size={12} color={index === 0 ? 'rgba(255,255,255,0.3)' : colors.WHITE} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.reorderButton, index === typeTasks.length - 1 && styles.disabledButton]}
                            onPress={() => onMoveTask(task.internal_id || task._id, 'down')}
                            disabled={index === typeTasks.length - 1}
                          >
                            <FAIcon name="chevron-down" size={12} color={index === typeTasks.length - 1 ? 'rgba(255,255,255,0.3)' : colors.WHITE} />
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.taskActionButton}
                          onPress={() => onEditTask(task)}
                        >
                          <FAIcon name="edit" size={14} color={colors.WHITE} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.taskActionButton}
                          onPress={() => onDeleteTask(task.internal_id || task._id)}
                        >
                          <FAIcon name="trash" size={14} color={colors.WHITE} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {task.body && (
                      <Text style={[
                        styles.taskDescription,
                        task.completed && styles.completedTaskText
                      ]} numberOfLines={2}>
                        {task.body}
                      </Text>
                    )}
                    <View style={styles.taskMeta}>
                      <View style={styles.taskBadges}>
                        <Text style={[
                          styles.taskCategory,
                          task.completed && styles.completedTaskText
                        ]}>
                          {task.category || 'general'}
                        </Text>
                        <Text style={[
                          styles.taskPriority,
                          styles[`${task.priority || 'medium'}Priority`],
                          task.completed && styles.completedTaskText
                        ]}>
                          {task.priority || 'medium'}
                        </Text>
                      </View>
                      <Text style={[
                        styles.taskDate,
                        task.completed && styles.completedTaskText
                      ]}>
                        {new Date(task.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        )}
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.tasksModalContainer}>
        <View style={styles.tasksModalHeader}>
          <TouchableOpacity onPress={onClose}>
            <FAIcon name="times" size={20} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.tasksModalTitle}>Car Tasks</Text>
          <TouchableOpacity
            style={styles.tasksModalAddButton}
            onPress={onAddTask}
          >
            <FAIcon name="plus" size={16} color={colors.WHITE} />
          </TouchableOpacity>
        </View>
        <View style={styles.tasksModalContent}>
          {renderTasksContent()}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  tasksModalContainer: {
    flex: 1,
    backgroundColor: '#161616',
  },
  tasksModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 16,
    backgroundColor: colors.BRG,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  tasksModalTitle: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '600',
  },
  tasksModalAddButton: {
    backgroundColor: colors.SPEED,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasksModalContent: {
    flex: 1,
    padding: 16,
  },
  tasksModalScrollView: {
    flex: 1,
  },
  tasksModalLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: colors.WHITE,
  },
  tasksModalErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.ERROR,
  },
  errorDetails: {
    fontSize: 14,
    color: colors.WHITE,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  tasksModalEmptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  tasksModalEmptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.WHITE,
  },
  tasksModalEmptyMessage: {
    fontSize: 14,
    color: colors.WHITE,
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryGroup: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.WHITE,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: colors.BRG,
  },
  taskItem: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    marginRight: 12,
    padding: 4,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.WHITE,
    flex: 1,
    marginRight: 12,
  },
  taskActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reorderButtons: {
    flexDirection: 'column',
    marginRight: 8,
  },
  reorderButton: {
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.3,
  },
  taskActionButton: {
    padding: 8,
    borderRadius: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.WHITE,
    lineHeight: 20,
    marginBottom: 8,
    opacity: 0.9,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  taskCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.WHITE,
    textTransform: 'capitalize',
    backgroundColor: colors.BRG,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskPriority: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    color: colors.WHITE,
  },
  criticalPriority: {
    backgroundColor: '#FF4444',
  },
  highPriority: {
    backgroundColor: '#FF8800',
  },
  mediumPriority: {
    backgroundColor: '#FFBB33',
  },
  lowPriority: {
    backgroundColor: '#00C851',
  },
  taskDate: {
    fontSize: 12,
    color: colors.WHITE,
    opacity: 0.8,
  },
  completedTask: {
  },
  completedTaskTitle: {
    textDecorationLine: 'line-through',
  },
  completedTaskText: {
    color: colors.TEXT_SECONDARY,
    opacity: 0.7,
  },
});

export default CarTasksViewModal;
