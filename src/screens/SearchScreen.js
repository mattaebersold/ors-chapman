import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { colors } from '../constants/colors';
import { useSearchQuery } from '../services/apiService';
import Card from '../components/Card';
import UserRow from '../components/UserRow';
import FAIcon from '../components/FAIcon';

const SearchScreen = ({ navigation, route }) => {
  const [searchTerm, setSearchTerm] = useState(route?.params?.query || '');
  const [activeTab, setActiveTab] = useState('all');
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Popular searches for automotive community
  const popularSearches = [
    'BMW E30', 'Honda Civic', 'Toyota Supra', 'engine swap', 
    'turbo build', 'restoration', 'track day', 'drift build',
    'JDM', 'stance', 'autocross', 'car meet'
  ];

  // Search API integration - matches Murray's approach
  const { 
    data: searchResults, 
    isLoading: searchLoading, 
    error: searchError 
  } = useSearchQuery(
    { query: searchTerm },
    { skip: !hasSearched || !searchTerm.trim() }
  );

  const handleSearch = () => {
    if (searchTerm.trim()) {
      setHasSearched(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setHasSearched(false);
  };

  const handlePopularSearch = (term) => {
    setSearchTerm(term);
    setHasSearched(true);
  };

  // Get filtered results based on active tab (matches Murray's approach)
  const getFilteredResults = () => {
    if (!searchResults) return [];
    
    if (activeTab === 'all') {
      // Combine all result types
      let allResults = [];
      Object.entries(searchResults).forEach(([type, items]) => {
        if (Array.isArray(items)) {
          allResults.push(...items.map(item => ({ ...item, resultType: type })));
        }
      });
      return allResults;
    } else {
      return searchResults[activeTab] || [];
    }
  };

  // Get total counts for tabs (matches Murray's approach)
  const getTotalResults = () => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((total, arr) => 
      total + (Array.isArray(arr) ? arr.length : 0), 0
    );
  };

  const contentTypes = [
    { key: 'all', label: 'All', count: getTotalResults() },
    { key: 'cars', label: 'Cars', count: searchResults?.cars?.length || 0 },
    { key: 'posts', label: 'Posts', count: searchResults?.posts?.length || 0 },
    { key: 'users', label: 'Users', count: searchResults?.users?.length || 0 },
    { key: 'events', label: 'Events', count: searchResults?.events?.length || 0 },
  ];

  const renderSearchItem = ({ item }) => {
    // Determine if this is a user or post/car/event
    const isUser = item.resultType === 'users' || item.username || (item.name && !item.title);
    
    if (isUser) {
      return (
        <UserRow 
          user={item} 
          onPress={(user) => navigation.navigate('UserDetail', { 
            userId: user._id || user.id,
            user: user 
          })}
        />
      );
    } else {
      return <Card post={item} />;
    }
  };

  const renderSearchForm = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <FAIcon name="search" size={16} color={colors.GRAY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search cars, posts, users, events..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus={!hasSearched}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <FAIcon name="times" size={16} color={colors.GRAY} />
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={[styles.searchButton, !searchTerm.trim() && styles.searchButtonDisabled]}
        onPress={handleSearch}
        disabled={!searchTerm.trim()}
      >
        <Text style={styles.searchButtonText}>Search</Text>
      </TouchableOpacity>
    </View>
  );

  const renderContentTypeTabs = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.tabsContainer}
      contentContainerStyle={styles.tabsContent}
    >
      {contentTypes.map((type) => (
        <TouchableOpacity
          key={type.key}
          style={[
            styles.tabButton,
            activeTab === type.key && styles.activeTabButton
          ]}
          onPress={() => setActiveTab(type.key)}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === type.key && styles.activeTabButtonText
          ]}>
            {type.label} ({type.count})
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderPopularSearches = () => (
    <View style={styles.popularContainer}>
      <Text style={styles.popularTitle}>Popular Searches</Text>
      <View style={styles.popularGrid}>
        {popularSearches.map((term, index) => (
          <TouchableOpacity
            key={index}
            style={styles.popularItem}
            onPress={() => handlePopularSearch(term)}
          >
            <FAIcon name="search" size={12} color={colors.BRG} />
            <Text style={styles.popularText}>{term}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FAIcon name="search" size={48} color={colors.LIGHT_GRAY} />
      <Text style={styles.emptyStateTitle}>Search the Community</Text>
      <Text style={styles.emptyStateText}>
        Find posts, cars, users, and listings{'\n'}
        Enter a search term above to get started
      </Text>
    </View>
  );

  const renderResults = () => {
    if (!hasSearched || !searchTerm.trim()) {
      return (
        <ScrollView style={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <FAIcon name="search" size={48} color={colors.LIGHT_GRAY} />
            <Text style={styles.emptyStateTitle}>Search the Community</Text>
            <Text style={styles.emptyStateText}>
              Find cars, posts, users, and events across{'\n'}
              the Open Road Society community
            </Text>
          </View>
          {renderPopularSearches()}
        </ScrollView>
      );
    }

    if (searchLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.BRG} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>
      );
    }

    if (searchError) {
      return (
        <View style={styles.errorContainer}>
          <FAIcon name="exclamation" size={48} color={colors.ERROR} />
          <Text style={styles.errorTitle}>Search Error</Text>
          <Text style={styles.errorText}>
            Unable to search at this time.{'\n'}
            Please try again later.
          </Text>
        </View>
      );
    }

    const filteredResults = getFilteredResults();
    const totalResults = getTotalResults();

    if (totalResults === 0) {
      return (
        <View style={styles.emptyResultsContainer}>
          <FAIcon name="search" size={48} color={colors.LIGHT_GRAY} />
          <Text style={styles.emptyResultsTitle}>No Results Found</Text>
          <Text style={styles.emptyResultsText}>
            We couldn't find anything matching "{searchTerm}"{'\n'}
            Try different keywords or check spelling
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.resultsContainer}>
        {renderContentTypeTabs()}
        
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            Showing {filteredResults.length} of {totalResults} results for "{searchTerm}"
          </Text>
        </View>
        
        <FlatList
          data={filteredResults}
          renderItem={renderSearchItem}
          keyExtractor={(item, index) => item._id || item.id || `search-${index}`}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderSearchForm()}
      {renderResults()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.BACKGROUND,
  },
  searchContainer: {
    backgroundColor: colors.WHITE,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: colors.BRG,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: colors.LIGHT_GRAY,
  },
  searchButtonText: {
    color: colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  tabsContainer: {
    backgroundColor: colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.BACKGROUND,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  activeTabButton: {
    backgroundColor: colors.BRG,
    borderColor: colors.BRG,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.TEXT_SECONDARY,
  },
  activeTabButtonText: {
    color: colors.WHITE,
  },
  emptyStateContainer: {
    flex: 1,
  },
  popularContainer: {
    backgroundColor: colors.WHITE,
    margin: 16,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginBottom: 16,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  popularItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.BACKGROUND,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: colors.BORDER,
  },
  popularText: {
    fontSize: 14,
    color: colors.TEXT_PRIMARY,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    backgroundColor: colors.WHITE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    fontWeight: '500',
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
    paddingHorizontal: 32,
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
    lineHeight: 24,
  },
  emptyResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyResultsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResultsText: {
    fontSize: 16,
    color: colors.TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default SearchScreen;