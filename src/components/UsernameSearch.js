import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Keyboard,
} from 'react-native';
import { colors } from '../constants/colors';
import FAIcon from './FAIcon';
import { useGetUsersQuery } from '../services/apiService';

const UsernameSearch = ({ onUserSelect, style }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Debounce search to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Get a large batch of users for comprehensive search
  const { data: usersResponse, isLoading, error: searchError } = useGetUsersQuery(
    { page: 1, limit: 500 }, // Get many users to search through
    { 
      skip: debouncedSearchTerm.length < 2,
      refetchOnMountOrArgChange: false // Don't refetch on search term change
    }
  );
  
  console.log('API Query params:', { page: 1, limit: 500 });
  console.log('Skip condition:', debouncedSearchTerm.length < 2);
  console.log('Full API response:', usersResponse);

  // Extract users from the response (getUsers returns { entries: [...], total: ... })
  const searchResults = usersResponse?.entries || [];
  
  // Apply client-side filtering as backup (in case backend search isn't working)
  const filteredResults = searchResults.filter(user => {
    if (!debouncedSearchTerm) return true; // Show all if no search term
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchLower)
    );
  });
  
  // Limit results to keep dropdown manageable
  const finalResults = filteredResults.slice(0, 8);

  // Debug logging
  useEffect(() => {
    
    if (debouncedSearchTerm.length >= 2) {
      
      if (searchError) {
        console.log('Search Error:', searchError);
      }
      console.log('=== End Debug ===\n');
    }
  }, [searchTerm, debouncedSearchTerm, searchResults, filteredResults, finalResults, isLoading, searchError, showResults]);

  const handleUserSelect = (user) => {
    setSearchTerm('');
    setShowResults(false);
    Keyboard.dismiss(); // Dismiss keyboard when user is selected
    onUserSelect(user);
  };

  const handleSearchChange = (text) => {
    setSearchTerm(text);
    setShowResults(text.length >= 2);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowResults(false);
  };

  const getProfileImageSource = (user) => {
    if (user?.gallery?.[0]?.filename) {
      return { uri: `https://d2481n2uw7a0p.cloudfront.net/${user.gallery[0].filename}` };
    }
    if (user?.profile_image) {
      return { uri: user.profile_image };
    }
    return null;
  };

  const renderUserItem = ({ item: user }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleUserSelect(user)}
      activeOpacity={0.7}
      underlayColor={colors.BACKGROUND}
    >
      <View style={styles.userItemContent}>
        {/* Profile Image */}
        <View style={styles.resultAvatar}>
          {getProfileImageSource(user) ? (
            <Image
              source={getProfileImageSource(user)}
              style={styles.resultAvatarImage}
            />
          ) : (
            <View style={[styles.resultAvatarImage, styles.resultAvatarPlaceholder]}>
              <FAIcon name="user" size={16} color={colors.WHITE} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.resultUserInfo}>
          <Text style={styles.resultUsername} numberOfLines={1}>
            {user.username || 'Unknown User'}
          </Text>
          {(user.firstName || user.lastName) && (
            <Text style={styles.resultName} numberOfLines={1}>
              {[user.firstName, user.lastName].filter(Boolean).join(' ')}
            </Text>
          )}
        </View>

        {/* Arrow Icon */}
        <FAIcon name="chevron-right" size={14} color={colors.TEXT_SECONDARY} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Search Input */}
      <View style={styles.searchInputContainer}>
        <FAIcon name="search" size={16} color={colors.TEXT_SECONDARY} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search members..."
          value={searchTerm}
          onChangeText={handleSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <FAIcon name="times" size={16} color={colors.TEXT_SECONDARY} />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <FAIcon name="spinner" size={20} color={colors.BRG} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : finalResults && finalResults.length > 0 ? (
            <View style={styles.resultsList}>
              {finalResults.map((user) => (
                <View key={user._id || user.id}>
                  {renderUserItem({ item: user })}
                </View>
              ))}
            </View>
          ) : debouncedSearchTerm.length >= 2 ? (
            <View style={styles.noResultsContainer}>
              <FAIcon name="user" size={24} color={colors.LIGHT_GRAY} />
              <Text style={styles.noResultsText}>No members found</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.BORDER,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.TEXT_PRIMARY,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    backgroundColor: colors.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.BRG,
    maxHeight: 300,
    shadowColor: colors.BLACK,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
    zIndex: 1001,
  },
  resultsList: {
    // Remove maxHeight since we're not scrolling, just showing limited results
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.BORDER,
    backgroundColor: colors.WHITE,
  },
  userItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultAvatar: {
    marginRight: 12,
  },
  resultAvatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.LIGHT_GRAY,
  },
  resultAvatarPlaceholder: {
    backgroundColor: colors.BRG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultUserInfo: {
    flex: 1,
  },
  resultUsername: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.TEXT_PRIMARY,
  },
  resultName: {
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noResultsText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.TEXT_SECONDARY,
  },
});

export default UsernameSearch;