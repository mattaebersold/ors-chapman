import React, { useState, useCallback, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	RefreshControl,
	TouchableOpacity,
	Modal,
	ScrollView,
} from 'react-native';
import { 
	useGetPostsQuery,
	useGetCarsQuery,
	useGetListingsQuery,
	useGetWantAdsQuery,
	useGetUserEntriesQuery,
	useGetUsersQuery,
	useGetArticlesQuery,
	useGetEventsQuery,
	useGetProjectsQuery,
	useGetModsQuery,
} from '../services/apiService';
import PostCard from './cards/PostCard';
import CarCard from './cards/CarCard';
import UserCard from './cards/UserCard';
import LoadingIndicator from './ui/LoadingIndicator';
import { colors, getPostTypeColor, getCategoryColor } from '../constants/colors';
import FilterBar from './FilterBar';
import FAIcon from './ui/FAIcon';


const Listing = ({ config, displayOptions = {}, HeaderComponent, onScroll, scrollEventThrottle, showFilters = false, filterTypes = ['postType', 'category'], customEvents = null, nestedScrollEnabled = false, numColumns = 1, heading, customHeaderButtons, customFilterBar, customHeaderSection }) => {
	// const { userInfo } = useSelector(state => state.auth);
	const [currentPage, setCurrentPage] = useState(1);
	const [allPosts, setAllPosts] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const [selectedPostType, setSelectedPostType] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	const [filterModalVisible, setFilterModalVisible] = useState(false);
	
	const POSTS_PER_PAGE = 10;

	// Helper function to parse query parameters from relative or absolute URLs
	const parseUrlParams = (url) => {
		if (!url) return new URLSearchParams();
		try {
			// Check if URL has query parameters
			const queryIndex = url.indexOf('?');
			if (queryIndex === -1) return new URLSearchParams();

			// Extract query string and parse it
			const queryString = url.substring(queryIndex + 1);
			return new URLSearchParams(queryString);
		} catch (error) {
			return new URLSearchParams();
		}
	};

	// Extract type parameter from apiUrl if present
	const extractTypeFromUrl = (url) => {
		if (!url) return null;
		const params = parseUrlParams(url);
		return params.get('type');
	};

	// Extract make parameter from apiUrl if present
	const extractMakeFromUrl = (url) => {
		if (!url) return null;
		const params = parseUrlParams(url);
		return params.get('make');
	};

	// Extract model parameter from apiUrl if present
	const extractModelFromUrl = (url) => {
		if (!url) return null;
		const params = parseUrlParams(url);
		return params.get('model');
	};

	// Extract user_id parameter from apiUrl if present
	const extractUserIdFromUrl = (url) => {
		if (!url) return null;
		const params = parseUrlParams(url);
		return params.get('user_id');
	};

	// Dynamic API query based on config.type
	const getQueryHook = () => {
		const make = extractMakeFromUrl(config?.apiUrl);
		const model = extractModelFromUrl(config?.apiUrl);
		const user_id = extractUserIdFromUrl(config?.apiUrl);
		
		switch (config?.type) {
			case 'posts':
				const postType = extractTypeFromUrl(config?.apiUrl);
				return useGetPostsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					type: postType,
					make,
					model,
					user_id,
					...(config?.postsParams || {})
				}, {
					skip: !!customEvents
				});
			case 'cars':
				return useGetCarsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					make,
					model,
					user_id
				}, {
					skip: !!customEvents
				});
			case 'users':
				return useGetUsersQuery({ page: currentPage, limit: POSTS_PER_PAGE }, {
					skip: !!customEvents
				});	
			case 'listings':
				return useGetListingsQuery({ page: currentPage, limit: POSTS_PER_PAGE }, {
					skip: !!customEvents
				});
			case 'wants':
				return useGetWantAdsQuery({ page: currentPage, limit: POSTS_PER_PAGE }, {
					skip: !!customEvents
				});
			case 'userEntries':
				return useGetUserEntriesQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE, 
					url: config?.apiUrl || '/api/user/entries'
				}, {
					skip: !!customEvents
				});
			case 'articles':
				return useGetArticlesQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE 
				}, {
					skip: !!customEvents
				});
			case 'events':
				// Use the dedicated /api/events endpoint
				return useGetEventsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					user_id,
					...(config?.eventParams || {})
				}, {
					skip: !!customEvents
				});
			case 'dedicated-events':
				// Use the dedicated /api/event endpoint
				return useGetEventsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE 
				}, {
					skip: !!customEvents
				});
			case 'projects':
				// Use the dedicated /api/project endpoint
				return useGetProjectsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					car_id: extractTypeFromUrl(config?.apiUrl), // Support filtering by car_id
					user_id,
					...(config?.projectParams || {})
				}, {
					skip: !!customEvents
				});
			case 'mods':
				// Use the dedicated /api/mods endpoint
				return useGetModsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					car_id: extractTypeFromUrl(config?.apiUrl), // Support filtering by car_id
					...(config?.modParams || {})
				}, {
					skip: !!customEvents
				});
			default:
				const defaultType = extractTypeFromUrl(config?.apiUrl);
				return useGetPostsQuery({ 
					page: currentPage, 
					limit: POSTS_PER_PAGE,
					type: defaultType,
					make,
					model,
					user_id,
					// Add support for additional params from config
					...(config?.postsParams || {})
				}, {
					skip: !!customEvents
				});
		}
	};

	// Conditional API hook usage
	const apiResult = getQueryHook();
	
	// Memoize custom events data to prevent infinite re-renders
	const customEventsData = useMemo(() => {
		if (customEvents) {
			return { entries: customEvents, total: customEvents.length };
		}
		return null;
	}, [customEvents]);
	
	// Use custom events or API result
	const postsData = customEventsData || apiResult.data;
	const postsLoading = customEvents ? false : apiResult.isLoading;
	const refetchPosts = customEvents ? () => {} : apiResult.refetch;
	const postsError = customEvents ? null : apiResult.error;

	// Update posts when new data arrives
	React.useEffect(() => {
		if (postsData?.entries) {
			console.log('📦 Posts data received:', {
				page: currentPage,
				entriesCount: postsData.entries.length,
				total: postsData.total,
				firstPostId: postsData.entries[0]?._id,
				firstPostTitle: postsData.entries[0]?.title,
				firstPostCreated: postsData.entries[0]?.created_at
			});

			// Normalize entries to ensure correct entry_type for rendering
			const normalizedEntries = postsData.entries.map(entry => {
				// If config type is 'users', ensure entry_type is 'user'
				if (config?.type === 'users' && !entry.entry_type) {
					return { ...entry, entry_type: 'user' };
				}
				return entry;
			});

			if (currentPage === 1) {
				// Fresh data (pull to refresh)
				console.log('✨ Setting fresh data (page 1)');
				setAllPosts(normalizedEntries);
			} else {
				// Append new data (infinite scroll) - prevent duplicates
				console.log('➕ Appending data (page ' + currentPage + ')');
				setAllPosts(prev => {
					const existingIds = new Set(prev.map(post => post._id));
					const newPosts = normalizedEntries.filter(post => !existingIds.has(post._id));
					return [...prev, ...newPosts];
				});
			}

			// Check if we have more data
			const totalLoaded = currentPage * POSTS_PER_PAGE;
			setHasMore(totalLoaded < postsData.total);
		}
	}, [postsData, currentPage, config?.type]);

	// Filter posts based on selected filters
	const filteredPosts = useMemo(() => {
		if (!allPosts.length) return [];

		return allPosts.filter(post => {
			// For articles, don't apply post type filtering since articles have different type structure
			if (post.entry_type === 'article') {
				// For articles, only filter by category if a category is selected
				if (selectedCategory && post.category !== selectedCategory) {
					return false;
				}
				return true;
			}

			// For cars/garage entries, don't apply post type filtering
			if (post.entry_type === 'garagecar') {
				return true;
			}

			// For regular posts, apply normal filtering
			// Filter by post type
			if (selectedPostType && post.type !== selectedPostType) {
				return false;
			}

			// Filter by category
			if (selectedCategory && post.category !== selectedCategory) {
				return false;
			}

			return true;
		});
	}, [allPosts, selectedPostType, selectedCategory]);

	const handleRefresh = useCallback(() => {
		console.log('🔄 Refresh triggered - resetting pagination');
		setAllPosts([]);
		setHasMore(true);

		// If we're already on page 1, force refetch
		if (currentPage === 1) {
			console.log('Already on page 1, forcing refetch');
			refetchPosts();
		} else {
			// Otherwise, reset to page 1 which will trigger a new query
			console.log('Resetting to page 1');
			setCurrentPage(1);
		}
	}, [currentPage, refetchPosts]);

	const handleLoadMore = useCallback(() => {
		if (!postsLoading && hasMore) {
			setCurrentPage(prev => prev + 1);
		}
	}, [postsLoading, hasMore]);

	const renderPost = useCallback(({ item }) => {

		const cardDisplayOptions = {
			...displayOptions,
			numColumns,
		};

		const card = (() => {
			switch(item.entry_type) {
				case 'post':
					return <PostCard post={item} displayOptions={cardDisplayOptions} />;
				case 'garagecar':
					return <CarCard post={item} displayOptions={cardDisplayOptions} />;
				case 'user':
					return <UserCard user={item} displayOptions={cardDisplayOptions} />;
			}
		})();

		return (
			<View style={numColumns > 1 ? styles.cardWrapperGrid : styles.cardWrapper}>
				{card}
			</View>
		);
	}, [displayOptions, numColumns]);

	const renderFooter = () => {
		if (!hasMore) return null;
		
		return (
			<LoadingIndicator 
				text="Loading more posts..." 
				variant="activity" 
				size="small"
				style={styles.footerLoader}
			/>
		);
	};

	// dynamic header
	const renderHeader = () => {
		return (
			<View style={[styles.header, styles.headerPadding]}>
				<Text style={styles.welcomeText}>
					{heading}
				</Text>
				<View style={styles.headerButtons}>
					{customHeaderButtons ? (
						customHeaderButtons()
					) : (
						showFilters && (
							<TouchableOpacity
								style={styles.filterButton}
								onPress={() => setFilterModalVisible(true)}
							>
								<FAIcon name="filter" size={16} color={colors.BLACK} />
							</TouchableOpacity>
						)
					)}
				</View>
			</View>
		);
	};


	// Clear all filters (only clear filters that are shown)
	const clearFilters = () => {
		if (filterTypes.includes('postType')) {
			setSelectedPostType(null);
		}
		if (filterTypes.includes('category')) {
			setSelectedCategory(null);
		}
	};

	const handleClearAll = () => {
		clearFilters();
		setFilterModalVisible(false);
	};

	const handleRemoveFilter = (filterType) => {
		if (filterType === 'postType') {
			setSelectedPostType(null);
		} else if (filterType === 'category') {
			setSelectedCategory(null);
		}
	};

	const renderFilterBar = () => {
		// If custom filter bar is provided, use it
		if (customFilterBar) {
			return <View style={styles.headerPadding}>{customFilterBar()}</View>;
		}

		// Check if there are any active filters
		const hasActiveFilters = (filterTypes.includes('postType') && selectedPostType) ||
		                         (filterTypes.includes('category') && selectedCategory);

		if (!showFilters || !hasActiveFilters) return null;

		return (
			<View style={styles.headerPadding}>
				<FilterBar
					showFilters={showFilters}
					filterTypes={filterTypes}
					selectedPostType={selectedPostType}
					selectedCategory={selectedCategory}
					onRemoveFilter={handleRemoveFilter}
				/>
			</View>
		);
	};

	// Get active filters for display
	const getActiveFilters = () => {
		const activeFilters = [];
		if (filterTypes.includes('postType') && selectedPostType) {
			activeFilters.push({ type: 'postType', value: selectedPostType, label: selectedPostType.charAt(0).toUpperCase() + selectedPostType.slice(1) });
		}
		if (filterTypes.includes('category') && selectedCategory) {
			activeFilters.push({ type: 'category', value: selectedCategory, label: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1) });
		}
		return activeFilters;
	};

	const renderFilterChip = (label, value, selectedValue, onSelect, getColorFunc) => (
		<TouchableOpacity
			key={value}
			style={[
				styles.filterChip,
				selectedValue === value && styles.filterChipActive,
				selectedValue === value && getColorFunc && { backgroundColor: getColorFunc(value) },
			]}
			onPress={() => {
				onSelect(selectedValue === value ? null : value);
				setFilterModalVisible(false);
			}}
		>
			<Text
				style={[
					styles.filterChipText,
					selectedValue === value && styles.filterChipTextActive,
				]}
			>
				{label}
			</Text>
		</TouchableOpacity>
	);

	const renderFilterModal = () => {
		if (!showFilters) return null;

		const postTypes = ['general', 'record', 'listing', 'want', 'spot'];
		const categories = ['show', 'misc', 'new', 'used', 'car', 'accessories', 'other', 'part', 'museum', 'wild', 'general', 'mod', 'restoration', 'maintenance', 'detailing'];
		const activeFilters = getActiveFilters();

		return (
			<Modal
				visible={filterModalVisible}
				animationType="slide"
				presentationStyle="pageSheet"
				onRequestClose={() => setFilterModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					{/* Modal Header */}
					<View style={styles.modalHeader}>
						<Text></Text>
						<Text style={styles.modalTitle}>Filter Posts</Text>
						<TouchableOpacity
							onPress={() => setFilterModalVisible(false)}
							style={styles.modalCloseButton}
						>
							<FAIcon name="times" size={18} color={colors.TEXT_SECONDARY} />
						</TouchableOpacity>
						
					</View>

					<ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
						{/* Post Type Filters */}
						{filterTypes.includes('postType') && (
							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>Type</Text>
								<View style={styles.filterGrid}>
									{postTypes.map(type =>
										renderFilterChip(
											type.charAt(0).toUpperCase() + type.slice(1),
											type,
											selectedPostType,
											setSelectedPostType,
											getPostTypeColor
										)
									)}
								</View>
							</View>
						)}

						{/* Category Filters */}
						{filterTypes.includes('category') && (
							<View style={styles.modalSection}>
								<Text style={styles.modalSectionTitle}>Category</Text>
								<View style={styles.filterGrid}>
									{categories.map(category =>
										renderFilterChip(
											category.charAt(0).toUpperCase() + category.slice(1),
											category,
											selectedCategory,
											setSelectedCategory,
											getCategoryColor
										)
									)}
								</View>
							</View>
						)}
						<>
						<TouchableOpacity
							onPress={handleClearAll}
							style={styles.modalClearButton}
						>
							<Text style={styles.modalClearText}>Clear All</Text>
						</TouchableOpacity>
						</>
					</ScrollView>
				</View>
			</Modal>
		);
	};

	// Combine header and filter bar into single header component
	const renderCombinedHeader = () => {
		return (
			<>
				{customHeaderSection && customHeaderSection()}
				{renderHeader()}
				{renderFilterBar()}
				
			</>
		);
	};

	return (
		<View>
			<FlatList
				data={filteredPosts}
				renderItem={renderPost}
				keyExtractor={(item, index) => item._id ? `post-${item._id}` : `post-${index}`}
				numColumns={numColumns}
        key={numColumns}
				refreshControl={
					<RefreshControl
						refreshing={postsLoading && currentPage === 1}
						onRefresh={handleRefresh}
					/>
				}
				onEndReached={handleLoadMore}
				onEndReachedThreshold={0.5}
				ListHeaderComponent={renderCombinedHeader}
				ListFooterComponent={renderFooter}
				contentContainerStyle={styles.listContainer}
				showsVerticalScrollIndicator={false}
				onScroll={onScroll}
				scrollEventThrottle={scrollEventThrottle}
				nestedScrollEnabled={nestedScrollEnabled}
				columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
			/>
			{renderFilterModal()}
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: 12,
	},
	welcomeText: {
		fontSize: 16,
		fontWeight: '800',
		color: colors.TEXT_PRIMARY,
		textAlign: 'left',
		flex: 1,
	},
	headerButtons: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	filterButton: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(0, 0, 0, 0.08)',
		justifyContent: 'center',
		alignItems: 'center',
	},
	loadingText: {
		textAlign: 'center',
		color: colors.TEXT_SECONDARY,
		fontStyle: 'italic',
	},
	listContainer: {
		paddingBottom: 80,
	},
	headerPadding: {
		paddingHorizontal: 10,
	},
	cardWrapper: {
		paddingHorizontal: 10,
	},
	cardWrapperGrid: {
		flex: 1,
		paddingHorizontal: 4,
	},
	footerLoader: {
		paddingVertical: 20,
		alignItems: 'center',
	},
	filterBar: {
		backgroundColor: colors.WHITE,
		borderBottomWidth: 1,
		borderBottomColor: colors.BORDER,
		paddingHorizontal: 16,
		paddingVertical: 8,
	},
	filterBarContent: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	filterInfo: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
	},
	filterText: {
		fontSize: 12,
		color: colors.TEXT_SECONDARY,
		fontWeight: '500',
	},
	columnWrapper: {
		paddingHorizontal: 6,
	},
	// Modal styles
	modalContainer: {
		flex: 1,
		backgroundColor: colors.BACKGROUND,
	},
	modalHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 20,
		paddingVertical: 16,
		backgroundColor: colors.WHITE,
		borderBottomWidth: 1,
		borderBottomColor: colors.BORDER,
	},
	modalCloseButton: {
		padding: 8,
		borderRadius: 20,
		backgroundColor: colors.LIGHT_GRAY,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: '700',
		color: colors.TEXT_PRIMARY,
	},
	modalClearButton: {
		padding: 8,
	},
	modalClearText: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.BRG,
	},
	modalContent: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	modalSection: {
		marginBottom: 32,
	},
	modalSectionTitle: {
		fontSize: 16,
		fontWeight: '700',
		color: colors.TEXT_PRIMARY,
		marginBottom: 16,
	},
	filterGrid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: 12,
	},
	filterChip: {
		paddingHorizontal: 16,
		paddingVertical: 10,
		borderRadius: 20,
		backgroundColor: colors.WHITE,
		borderWidth: 1,
		borderColor: colors.BORDER,
		marginBottom: 8,
	},
	filterChipActive: {
		backgroundColor: colors.BRG,
		borderColor: colors.BRG,
	},
	filterChipText: {
		fontSize: 14,
		fontWeight: '500',
		color: colors.TEXT_SECONDARY,
	},
	filterChipTextActive: {
		color: colors.WHITE,
		fontWeight: '600',
	},
	modalFooter: {
		backgroundColor: colors.WHITE,
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderTopWidth: 1,
		borderTopColor: colors.BORDER,
	},
	applyButton: {
		backgroundColor: colors.BRG,
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	applyButtonText: {
		color: colors.WHITE,
		fontSize: 16,
		fontWeight: '700',
	},
});

export default Listing;