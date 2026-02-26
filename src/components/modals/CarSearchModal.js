import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import {
  useGetAllBrandsQuery,
  useGetBrandModelsQuery,
  useGetCarsQuery,
  useCreateTagMutation,
  useGetRecentTagsQuery,
  useGetCarQuery,
} from '../../services/apiService';
import LoadingIndicator from '../ui/LoadingIndicator';

const RecentCarItem = ({ tag, onSelect }) => {
  const { data: car, isLoading } = useGetCarQuery(tag.tag_internal_id);
  if (isLoading || !car) return null;

  return (
    <TouchableOpacity
      style={styles.carItem}
      onPress={() => onSelect(car)}
    >
      <View style={styles.carInfo}>
        <FAIcon name="clock-o" size={14} color={colors.TEXT_SECONDARY} />
        <FAIcon name="car" size={16} color={colors.BRG} />
        <Text style={styles.carText} numberOfLines={1}>
          {car.year} {car.make} {car.model}{car.trim ? ` ${car.trim}` : ''}
        </Text>
      </View>
      <FAIcon name="plus" size={16} color={colors.BRG} />
    </TouchableOpacity>
  );
};

const CarSearchModal = ({ visible, onClose, postId, onSelect }) => {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [makeDropdownVisible, setMakeDropdownVisible] = useState(false);
  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);

  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandsQuery();

  const { data: modelsData, isLoading: modelsLoading } = useGetBrandModelsQuery(selectedMake, {
    skip: !selectedMake,
  });

  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery(
    { make: selectedMake, model: selectedModel, limit: 50 },
    { skip: !selectedMake || !selectedModel }
  );

  const { data: recentTagsData } = useGetRecentTagsQuery(
    { limit: 20 },
    { skip: !visible }
  );

  const [createTag] = useCreateTagMutation();

  const recentCarTags = (recentTagsData?.tags || [])
    .filter(t => t.tag_entry_type === 'garagecar')
    .slice(0, 8);

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    setSelectedModel('');
  };

  const handleClose = () => {
    setSelectedMake('');
    setSelectedModel('');
    setMakeDropdownVisible(false);
    setModelDropdownVisible(false);
    onClose();
  };

  const handleSelectCar = async (car) => {
    if (!car) return;

    if (onSelect) {
      onSelect({
        id: car.internal_id,
        label: `${car.year} ${car.make} ${car.model}${car.trim ? ' ' + car.trim : ''}`,
        type: 'garagecar',
      });
      setSelectedMake('');
      setSelectedModel('');
      onClose();
      return;
    }

    if (!postId) return;

    try {
      await createTag({
        post_id: postId,
        tag_entry_type: 'garagecar',
        tag_internal_id: car.internal_id,
      }).unwrap();
      Alert.alert('Success', 'Car tagged successfully');
      setSelectedMake('');
      setSelectedModel('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to tag car. It may already be tagged.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tag a Car</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Use ScrollView at top level — no FlatList nesting */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.instructions}>
            Select a make and model to find cars
          </Text>

          {/* Recently Tagged Cars — shown before a make is selected */}
          {!selectedMake && recentCarTags.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Recently Tagged</Text>
              {recentCarTags.map(tag => (
                <RecentCarItem
                  key={`${tag.tag_entry_type}-${tag.tag_internal_id}`}
                  tag={tag}
                  onSelect={handleSelectCar}
                />
              ))}
            </View>
          )}

          {/* Make Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Make</Text>
            {brandsLoading ? (
              <LoadingIndicator size="small" />
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setMakeDropdownVisible(!makeDropdownVisible);
                    setModelDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownButtonText, !selectedMake && styles.placeholderText]}>
                    {selectedMake || 'Select a make...'}
                  </Text>
                  <FAIcon
                    name={makeDropdownVisible ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
                {makeDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                      {(brandsData || []).map(item => (
                        <TouchableOpacity
                          key={item.make}
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleMakeChange(item.make);
                            setMakeDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{item.make}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Model Picker */}
          {selectedMake && (
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerLabel}>Model</Text>
              {modelsLoading ? (
                <LoadingIndicator size="small" />
              ) : (
                <View>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setModelDropdownVisible(!modelDropdownVisible)}
                  >
                    <Text style={[styles.dropdownButtonText, !selectedModel && styles.placeholderText]}>
                      {selectedModel || 'Select a model...'}
                    </Text>
                    <FAIcon
                      name={modelDropdownVisible ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                  {modelDropdownVisible && (
                    <View style={styles.dropdownList}>
                      <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                        {(modelsData || []).map(item => (
                          <TouchableOpacity
                            key={item.model}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setSelectedModel(item.model);
                              setModelDropdownVisible(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{item.model}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Cars List — tap to immediately tag */}
          {selectedMake && selectedModel && (
            <View style={styles.carsSection}>
              <Text style={styles.carsSectionTitle}>Available Cars</Text>
              {carsLoading ? (
                <LoadingIndicator />
              ) : carsData?.entries?.length > 0 ? (
                <View style={styles.carsList}>
                  {carsData.entries.map(car => (
                    <TouchableOpacity
                      key={car._id}
                      style={styles.carItem}
                      onPress={() => handleSelectCar(car)}
                    >
                      <View style={styles.carInfo}>
                        <FAIcon name="car" size={16} color={colors.BRG} />
                        <Text style={styles.carText}>
                          {car.year} {car.make} {car.model}
                          {car.trim && ` ${car.trim}`}
                        </Text>
                      </View>
                      <FAIcon name="plus" size={16} color={colors.BRG} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No cars found for this make/model</Text>
              )}
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    backgroundColor: colors.BRG,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: colors.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  instructions: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    padding: 16,
    paddingBottom: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.TEXT_SECONDARY,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: colors.WHITE,
    marginBottom: 8,
    padding: 16,
  },
  pickerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    padding: 14,
    backgroundColor: colors.BACKGROUND,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    flex: 1,
  },
  placeholderText: {
    color: colors.TEXT_SECONDARY,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    borderRadius: 8,
    backgroundColor: colors.WHITE,
    maxHeight: 200,
    overflow: 'hidden',
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  carsSection: {
    backgroundColor: colors.WHITE,
    padding: 16,
    marginBottom: 8,
  },
  carsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.TEXT_PRIMARY,
    marginBottom: 12,
  },
  carsList: {
    gap: 8,
  },
  carItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.WHITE,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  carInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  carText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    fontWeight: '500',
    flex: 1,
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  bottomSpacer: {
    height: 60,
  },
});

export default CarSearchModal;
