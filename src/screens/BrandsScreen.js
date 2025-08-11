import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useGetAllBrandsQuery } from '../services/apiService';
import { colors } from '../constants/colors';
import { LoadingIndicator, ErrorMessage, EmptyState, spacing, layout } from '../components/common';
import FAIcon from '../components/FAIcon';

const BrandsScreen = ({ navigation }) => {
  const { data: brandsData, isLoading, error } = useGetAllBrandsQuery();

  const brands = brandsData?.brands || [];

  const navigateToBrand = (brand) => {
    navigation.navigate('BrandDetail', { 
      brand: brand.make_handle,
      brandName: brand.make 
    });
  };

  const renderBrandCard = ({ item: brand }) => (
    <TouchableOpacity
      style={styles.brandCard}
      onPress={() => navigateToBrand(brand)}
      activeOpacity={0.7}
    >
      <View style={styles.brandIconContainer}>
        <FAIcon name="car" size={24} color={colors.BRG} />
      </View>
      
      <View style={styles.brandInfo}>
        <Text style={styles.brandName}>{brand.make}</Text>
        {brand.qty && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {brand.qty} {brand.qty === 1 ? 'car' : 'cars'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.chevronContainer}>
        <FAIcon name="chevron-right" size={16} color={colors.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FAIcon name="car" size={48} color={colors.TEXT_SECONDARY} />
      <Text style={styles.emptyTitle}>No Brands Found</Text>
      <Text style={styles.emptyText}>
        There are no car brands in the community yet.
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Car Brands</Text>
      <Text style={styles.subtitle}>
        Browse cars by manufacturer and discover what the community is driving.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <LoadingIndicator 
          text="Loading brands..." 
          size="large" 
          style={styles.loadingContainer}
        />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <FAIcon name="times" size={48} color={colors.ERROR} />
          <Text style={styles.errorTitle}>Error Loading Brands</Text>
          <Text style={styles.errorText}>
            Unable to load car brands. Please try again.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={brands}
        renderItem={renderBrandCard}
        keyExtractor={(item) => item.make_handle || item.make}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={1}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.TEXT_PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  brandIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.LIGHT_GRAY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 4,
  },
  countBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.BRG,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.WHITE,
  },
  chevronContainer: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.ERROR,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default BrandsScreen;