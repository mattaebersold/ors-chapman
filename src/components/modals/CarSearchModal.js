import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { colors } from '../../constants/colors';
import FAIcon from '../ui/FAIcon';
import { useGetAllBrandsQuery, useGetBrandModelsQuery, useGetCarsQuery, useCreateTagMutation } from '../../services/apiService';
import LoadingIndicator from '../ui/LoadingIndicator';

const CarSearchModal = ({ visible, onClose, postId }) => {
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedCar, setSelectedCar] = useState(null);
  const [makeDropdownVisible, setMakeDropdownVisible] = useState(false);
  const [modelDropdownVisible, setModelDropdownVisible] = useState(false);

  // Fetch brands
  const { data: brandsData, isLoading: brandsLoading } = useGetAllBrandsQuery();

  // Fetch models for selected brand
  const { data: modelsData, isLoading: modelsLoading } = useGetBrandModelsQuery(selectedMake, {
    skip: !selectedMake
  });

  // Fetch cars for selected make/model
  const { data: carsData, isLoading: carsLoading } = useGetCarsQuery(
    { make: selectedMake, model: selectedModel, limit: 50 },
    { skip: !selectedMake || !selectedModel }
  );

  const [createTag, { isLoading: tagLoading }] = useCreateTagMutation();

  const handleMakeChange = (make) => {
    setSelectedMake(make);
    setSelectedModel('');
    setSelectedCar(null);
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    setSelectedCar(null);
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
  };

  const handleTagCar = async () => {
    if (!selectedCar || !postId) {
      Alert.alert('Error', 'Please select a car to tag');
      return;
    }

    try {
      await createTag({
        post_id: postId,
        tag_entry_type: 'garagecar',
        tag_internal_id: selectedCar.internal_id,
      }).unwrap();

      Alert.alert('Success', 'Car tagged successfully');
      setSelectedMake('');
      setSelectedModel('');
      setSelectedCar(null);
      onClose();
    } catch (error) {
      console.error('Error creating tag:', error);
      Alert.alert('Error', 'Failed to tag car. It may already be tagged.');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FAIcon name="times" size={24} color={colors.WHITE} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Search Cars</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.instructions}>
            Select a make and model to find cars
          </Text>

          {/* Make Picker */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>Make</Text>
            {brandsLoading ? (
              <LoadingIndicator size="small" />
            ) : (
              <View>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setMakeDropdownVisible(!makeDropdownVisible)}
                >
                  <Text style={[styles.dropdownButtonText, !selectedMake && styles.placeholderText]}>
                    {selectedMake || "Select a make..."}
                  </Text>
                  <FAIcon
                    name={makeDropdownVisible ? "chevron-up" : "chevron-down"}
                    size={16}
                    color={colors.TEXT_SECONDARY}
                  />
                </TouchableOpacity>
                {makeDropdownVisible && (
                  <View style={styles.dropdownList}>
                    <FlatList
                      data={brandsData}
                      keyExtractor={(item) => item.make}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.dropdownItem}
                          onPress={() => {
                            handleMakeChange(item.make);
                            setMakeDropdownVisible(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{item.make}</Text>
                        </TouchableOpacity>
                      )}
                      style={styles.dropdownFlatList}
                    />
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
                      {selectedModel || "Select a model..."}
                    </Text>
                    <FAIcon
                      name={modelDropdownVisible ? "chevron-up" : "chevron-down"}
                      size={16}
                      color={colors.TEXT_SECONDARY}
                    />
                  </TouchableOpacity>
                  {modelDropdownVisible && (
                    <View style={styles.dropdownList}>
                      <FlatList
                        data={modelsData}
                        keyExtractor={(item) => item.model}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={styles.dropdownItem}
                            onPress={() => {
                              handleModelChange(item.model);
                              setModelDropdownVisible(false);
                            }}
                          >
                            <Text style={styles.dropdownItemText}>{item.model}</Text>
                          </TouchableOpacity>
                        )}
                        style={styles.dropdownFlatList}
                      />
                    </View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Cars List */}
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
                      style={[
                        styles.carItem,
                        selectedCar?._id === car._id && styles.carItemSelected
                      ]}
                      onPress={() => handleSelectCar(car)}
                    >
                      <View style={styles.carInfo}>
                        <FAIcon
                          name="car"
                          size={20}
                          color={selectedCar?._id === car._id ? colors.BRG : colors.TEXT_SECONDARY}
                        />
                        <Text style={[
                          styles.carText,
                          selectedCar?._id === car._id && styles.carTextSelected
                        ]}>
                          {car.year} {car.make} {car.model}
                          {car.trim && ` ${car.trim}`}
                        </Text>
                      </View>
                      {selectedCar?._id === car._id && (
                        <FAIcon name="check" size={20} color={colors.BRG} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No cars found for this make/model</Text>
              )}
            </View>
          )}

          {/* Tag Button */}
          {selectedCar && (
            <TouchableOpacity
              style={styles.tagButton}
              onPress={handleTagCar}
              disabled={tagLoading}
            >
              <Text style={styles.tagButtonText}>
                {tagLoading ? 'Tagging...' : 'Tag Car'}
              </Text>
            </TouchableOpacity>
          )}
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
  },
  dropdownFlatList: {
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
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    backgroundColor: colors.BACKGROUND,
  },
  carItemSelected: {
    borderColor: colors.BRG,
    backgroundColor: colors.LIGHT_BRG + '20',
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
  carTextSelected: {
    color: colors.BRG,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  tagButton: {
    backgroundColor: colors.BRG,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tagButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CarSearchModal;
