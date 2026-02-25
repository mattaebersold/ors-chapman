import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors } from '../../constants/colors';
import ImageUploader from '../ImageUploader';
import FAIcon from '../ui/FAIcon';
import FadeScrollView from '../ui/FadeScrollView';
import { 
  useCreateEventMutation,
  useUpdateEventMutation
} from '../../services/apiService';
import { useFormSubmission } from '../../hooks/useFormSubmission';
import { useBannerWithFallback } from '../../hooks/useBannerWithFallback';
import { createFormData } from '../../utils/formUtils';
import BaseModal from './BaseModal';
import FormInput from '../forms/FormInput';
import FormTextArea from '../forms/FormTextArea';
import FormOptionButtons from '../forms/FormOptionButtons';

const EventFormModal = ({ visible, onClose, onSubmit, editMode = false, existingEvent = null }) => {
  const { showSuccess, showError } = useBannerWithFallback();

  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'event',
    category: 'meetup',
    images: [],
    // Event specific fields
    event_type: 'single', // single, recurring
    event_date: '',
    event_time: '',
    end_date: '',
    end_time: '',
    location: '',
    address: '',
    max_attendees: '',
    entry_fee: '',
    contact_info: '',
    requirements: '',
    // Recurring event fields
    recurring_frequency: '', // weekly, monthly, yearly
    recurring_end_date: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  // Populate form data when editing
  useEffect(() => {
    if (editMode && existingEvent) {
      setFormData({
        title: existingEvent.title || '',
        body: existingEvent.body || '',
        type: existingEvent.type || 'event',
        category: existingEvent.category || 'meetup',
        images: existingEvent.gallery || [],
        event_type: existingEvent.event_type || 'single',
        event_date: existingEvent.event_date || '',
        event_time: existingEvent.event_time || '',
        end_date: existingEvent.end_date || '',
        end_time: existingEvent.end_time || '',
        location: existingEvent.location || '',
        address: existingEvent.address || '',
        max_attendees: existingEvent.max_attendees || '',
        entry_fee: existingEvent.entry_fee || '',
        contact_info: existingEvent.contact_info || '',
        requirements: existingEvent.requirements || '',
        recurring_frequency: existingEvent.recurring_frequency || '',
        recurring_end_date: existingEvent.recurring_end_date || '',
      });
    } else if (!editMode) {
      // Reset form when creating new event
      resetForm();
    }
  }, [editMode, existingEvent, visible]);

  const resetForm = () => {
    setFormData({
      title: '',
      body: '',
      type: 'event',
      category: 'meetup',
      images: [],
      event_type: 'single',
      event_date: '',
      event_time: '',
      end_date: '',
      end_time: '',
      location: '',
      address: '',
      max_attendees: '',
      entry_fee: '',
      contact_info: '',
      requirements: '',
      recurring_frequency: '',
      recurring_end_date: '',
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      showError('Event title is required');
      return false;
    }
    return true;
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);

    if (selectedDate) {
      setSelectedDate(selectedDate);
      // Format date as YYYY-MM-DD
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setFormData({ ...formData, event_date: formattedDate });
    }
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Convert form data to FormData format for API
        const apiFormData = createFormData(formData);
        if (editMode && existingEvent?.internal_id) {
          apiFormData.append('internal_id', existingEvent.internal_id);
          await updateEvent(apiFormData).unwrap();
        } else {
          await createEvent(apiFormData).unwrap();
        }
      }
      showSuccess(editMode ? 'Event updated successfully!' : 'Event created successfully!');
      resetForm();
      onClose();
    } catch (error) {
      showError(error.message || `Failed to ${editMode ? 'update' : 'create'} event`);
    } finally {
      setLoading(false);
    }
  };

  const eventTypeOptions = [
    { label: 'Single Event', value: 'single' },
    { label: 'Recurring Event', value: 'recurring' },
  ];

  const categoryOptions = [
    { label: 'Meetup', value: 'meetup' },
    { label: 'Car Show', value: 'car-show' },
    { label: 'Track Day', value: 'track-day' },
    { label: 'Road Trip', value: 'road-trip' },
    { label: 'Workshop', value: 'workshop' },
    { label: 'Social', value: 'social' },
  ];

  const recurringOptions = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Bi-weekly', value: 'bi-weekly' },
    { label: 'Monthly', value: 'monthly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior='height'
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
            <FAIcon name="times" size={20} color={colors.GRAY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {editMode ? 'Edit Event' : 'New Event'}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.WHITE} />
            ) : (
              <Text style={styles.submitButtonText}>
                {editMode ? 'Update' : 'Create'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Title *</Text>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => setFormData({ ...formData, title: text })}
              placeholder="Enter event title"
              placeholderTextColor={colors.GRAY}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.body}
              onChangeText={(text) => setFormData({ ...formData, body: text })}
              placeholder="Describe your event..."
              placeholderTextColor={colors.GRAY}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category</Text>
            <FadeScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll} fadeColor="#ffffff" fadeWidth={15}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.category === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, category: option.value })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.category === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </FadeScrollView>
          </View>

          {/* Event Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Type</Text>
            <FadeScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll} fadeColor="#ffffff" fadeWidth={15}>
              {eventTypeOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionButton,
                    formData.event_type === option.value && styles.optionButtonActive
                  ]}
                  onPress={() => setFormData({ ...formData, event_type: option.value })}
                >
                  <Text style={[
                    styles.optionText,
                    formData.event_type === option.value && styles.optionTextActive
                  ]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </FadeScrollView>
          </View>

          {/* Date and Time */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Event Date</Text>
              {formData.event_date ? (
                <View style={styles.selectedDateContainer}>
                  <View style={styles.selectedDateBadge}>
                    <FAIcon name="calendar" size={14} color={colors.WHITE} />
                    <Text style={styles.selectedDateText}>
                      {formatDisplayDate(formData.event_date)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.changeDateButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.changeDateText}>Change</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.datePickerButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={styles.placeholderText}>Select Date</Text>
                  <FAIcon name="calendar" size={16} color={colors.GRAY} />
                </TouchableOpacity>
              )}
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Start Time</Text>
              <TextInput
                style={styles.input}
                value={formData.event_time}
                onChangeText={(text) => setFormData({ ...formData, event_time: text })}
                placeholder="HH:MM (optional)"
                placeholderTextColor={colors.GRAY}
              />
            </View>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={handleDateChange}
            />
          )}

          {/* End Date and Time */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                value={formData.end_date}
                onChangeText={(text) => setFormData({ ...formData, end_date: text })}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={colors.GRAY}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>End Time</Text>
              <TextInput
                style={styles.input}
                value={formData.end_time}
                onChangeText={(text) => setFormData({ ...formData, end_time: text })}
                placeholder="HH:MM"
                placeholderTextColor={colors.GRAY}
              />
            </View>
          </View>

          {/* Recurring Event Options */}
          {formData.event_type === 'recurring' && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recurring Frequency</Text>
                <FadeScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScroll} fadeColor="#ffffff" fadeWidth={15}>
                  {recurringOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.optionButton,
                        formData.recurring_frequency === option.value && styles.optionButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, recurring_frequency: option.value })}
                    >
                      <Text style={[
                        styles.optionText,
                        formData.recurring_frequency === option.value && styles.optionTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </FadeScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Recurring End Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.recurring_end_date}
                  onChangeText={(text) => setFormData({ ...formData, recurring_end_date: text })}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.GRAY}
                />
              </View>
            </>
          )}

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => setFormData({ ...formData, location: text })}
              placeholder="Event location/venue name (optional)"
              placeholderTextColor={colors.GRAY}
            />
          </View>

          {/* Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address</Text>
            <TextInput
              style={styles.input}
              value={formData.address}
              onChangeText={(text) => setFormData({ ...formData, address: text })}
              placeholder="Full address"
              placeholderTextColor={colors.GRAY}
            />
          </View>

          {/* Event Details */}
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Max Attendees</Text>
              <TextInput
                style={styles.input}
                value={formData.max_attendees}
                onChangeText={(text) => setFormData({ ...formData, max_attendees: text })}
                placeholder="0 for unlimited"
                placeholderTextColor={colors.GRAY}
                keyboardType="numeric"
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Entry Fee</Text>
              <TextInput
                style={styles.input}
                value={formData.entry_fee}
                onChangeText={(text) => setFormData({ ...formData, entry_fee: text })}
                placeholder="$0"
                placeholderTextColor={colors.GRAY}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Contact Info */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Information</Text>
            <TextInput
              style={styles.input}
              value={formData.contact_info}
              onChangeText={(text) => setFormData({ ...formData, contact_info: text })}
              placeholder="Email, phone, or other contact details"
              placeholderTextColor={colors.GRAY}
            />
          </View>

          {/* Requirements */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Requirements/Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.requirements}
              onChangeText={(text) => setFormData({ ...formData, requirements: text })}
              placeholder="Any special requirements, what to bring, etc."
              placeholderTextColor={colors.GRAY}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Event Photos</Text>
            <ImageUploader
              images={formData.images}
              onImagesChange={(images) => setFormData({ ...formData, images })}
              maxImages={5}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  cancelButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT,
  },
  submitButton: {
    backgroundColor: colors.BRG,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  inputGroup: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.TEXT,
    backgroundColor: colors.WHITE,
  },
  textArea: {
    height: 100,
  },
  rowInputs: {
    flexDirection: 'row',
    marginVertical: 12,
  },
  optionsScroll: {
    flexDirection: 'row',
  },
  optionButton: {
    backgroundColor: colors.LIGHT_GRAY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  optionButtonActive: {
    backgroundColor: colors.BRG,
  },
  optionText: {
    fontSize: 14,
    color: colors.GRAY,
    fontWeight: '500',
  },
  optionTextActive: {
    color: colors.WHITE,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.WHITE,
  },
  datePickerText: {
    fontSize: 16,
    color: colors.TEXT,
  },
  placeholderText: {
    color: colors.GRAY,
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BRG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
    marginRight: 8,
  },
  selectedDateText: {
    color: colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  changeDateButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.BRG,
  },
  changeDateText: {
    color: colors.BRG,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default EventFormModal;