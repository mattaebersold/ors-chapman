import React, { useState, useCallback, useMemo } from 'react';
import {
	View,
	Text,
	StyleSheet,
	FlatList,
	RefreshControl,
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
import LoadingIndicator from './ui/LoadingIndicator';
import { colors } from '../constants/colors';
import FilterBar from './FilterBar';


const Listing = ({ config, displayOptions = {}, HeaderComponent, onScroll, scrollEventThrottle, showFilters = false, filterTypes = ['postType', 'category'], customEvents = null, nestedScrollEnabled = false, numColumns = 1 }) => {
	// const { userInfo } = useSelector(state => state.auth);
	const [currentPage, setCurrentPage] = useState(1);
	const [allPosts, setAllPosts] = useState([]);
	const [hasMore, setHasMore] = useState(true);
	const [selectedPostType, setSelectedPostType] = useState(null);
	const [selectedCategory, setSelectedCategory] = useState(null);
	
	const POSTS_PER_PAGE = 10;

	// Extract type parameter from apiUrl if present
	const extractTypeFromUrl = (url) => {
		if (!url) return null;
		try {
			const urlObj = new URL(url);
			const type = urlObj.searchParams.get('type');
			return type;
		} catch (error) {
			return null;
		}
	};

	// Extract make parameter from apiUrl if present
	const extractMakeFromUrl = (url) => {
		if (!url) return null;
		try {
			const urlObj = new URL(url);
			const make = urlObj.searchParams.get('make');
			return make;
		} catch (error) {
			console.log('Listing - Error parsing URL for make:', url, error);
			return null;
		}
	};

	// Extract model parameter from apiUrl if present
	const extractModelFromUrl = (url) => {
		if (!url) return null;
		try {
			const urlObj = new URL(url);
			const model = urlObj.searchParams.get('model');
			return model;
		} catch (error) {
			console.log('Listing - Error parsing URL for model:', url, error);
			return null;
		}
	};

	// Extract user_id parameter from apiUrl if present
	const extractUserIdFromUrl = (url) => {
		if (!url) return null;
		try {
			const urlObj = new URL(url);
			const user_id = urlObj.searchParams.get('user_id');
			return user_id;
		} catch (error) {
			console.log('Listing - Error parsing URL for user_id:', url, error);
			return null;
		}
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

			if (currentPage === 1) {
				// Fresh data (pull to refresh)
				setAllPosts(postsData.entries);
			} else {
				// Append new data (infinite scroll) - prevent duplicates
				setAllPosts(prev => {
					const existingIds = new Set(prev.map(post => post._id));
					const newPosts = postsData.entries.filter(post => !existingIds.has(post._id));
					return [...prev, ...newPosts];
				});
			}
			
			// Check if we have more data
			const totalLoaded = currentPage * POSTS_PER_PAGE;
			setHasMore(totalLoaded < postsData.total);
		}
	}, [postsData, currentPage]);

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
		setCurrentPage(1);
		setAllPosts([]);
		setHasMore(true);
		refetchPosts();
	}, [refetchPosts]);

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
		
		switch(item.entry_type) {
			case 'post': 
				return <PostCard post={item} displayOptions={cardDisplayOptions} />;
			case 'garagecar':
				return <CarCard post={item} displayOptions={cardDisplayOptions} />;
		}

		
	}, [displayOptions]);

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
		// If HeaderComponent is provided, use it instead
		if (HeaderComponent) {
			return <HeaderComponent />;
		}
		
		if (!config?.heading) return null;
		
		return (
			<View style={styles.header}>
				<Text style={styles.welcomeText}>
					{config.heading}
				</Text>
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

	// Render filter bar if filters are enabled
	const renderFilterBar = () => {
		return (
			<FilterBar
				showFilters={showFilters}
				filterTypes={filterTypes}
				selectedPostType={selectedPostType}
				setSelectedPostType={setSelectedPostType}
				selectedCategory={selectedCategory}
				setSelectedCategory={setSelectedCategory}
				onClearFilters={clearFilters}
			/>
		);
	};



	// Combine header and filter bar into single header component
	const renderCombinedHeader = () => {
		return (
			<>
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
		</View>
	);
};

const styles = StyleSheet.create({
	header: {
		padding: 16,
		borderBottomWidth: 1,
		borderBottomColor: colors.BORDER,
	},
	welcomeText: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.TEXT_PRIMARY,
		textAlign: 'center',
	},
	loadingText: {
		textAlign: 'center',
		color: colors.TEXT_SECONDARY,
		fontStyle: 'italic',
	},
	listContainer: {
		paddingBottom: 20,
		paddingLeft: 10,
		paddingRight: 10,
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
    gap: 8,
	},
});

export default Listing;