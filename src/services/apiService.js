import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../../config';

// Base API configuration
const baseQuery = fetchBaseQuery({
  baseUrl: CONFIG.API_BASE_URL,
  prepareHeaders: async (headers, { getState }) => {
    try {
      const tokenData = await AsyncStorage.getItem('userToken');
      if (tokenData) {
        const { token } = JSON.parse(tokenData);
        headers.set('authorization', `Bearer ${token}`);
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }
    return headers;
  },
});

export const apiService = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['User', 'Post', 'Cars', 'UserEntries', 'Search', 'Like', 'Comment', 'Brands', 'Models', 'Articles', 'Events'],
  endpoints: (builder) => ({
    // User authentication endpoints
    getUserDetails: builder.query({
      query: () => ({
        url: '/api/users/loggedInUser',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),

    getUserEntries: builder.query({
      query: ({ page = 1, limit = 5, url }) => ({
        url: url,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: ['UserEntries'],
    }),

    getUserEntry: builder.query({
      query: (url) => ({
        url: `/api/protected/${url}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Post', id }],
    }),

    // Cars endpoints
    getCars: builder.query({
      query: ({ page = 1, limit = 10, make = null, model = null, user_id = null }) => {
        const params = { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc'
        };
        
        // Add make parameter if provided
        if (make) {
          params.make = make;
        }
        
        // Add model parameter if provided (requires make)
        if (model && make) {
          params.model = model;
        }
        
        // Add user_id parameter if provided
        if (user_id) {
          params.user_id = user_id;
        }
        
        console.log('API getCars - params with user_id:', params);
        return {
          url: '/api/garage',
          method: 'GET',
          params
        };
      },
      providesTags: ['Cars'],
      keepUnusedDataFor: 0,
    }),

    // Get single car by ID
    getCar: builder.query({
      query: (carId) => ({
        url: `/api/garage/${carId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carId) => [{ type: 'Cars', id: carId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get all brands
    getAllBrands: builder.query({
      query: () => ({
        url: '/api/garage/brands/all',
        method: 'GET',
      }),
      providesTags: ['Brands'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get models for a specific brand
    getBrandModels: builder.query({
      query: (brand) => ({
        url: `/api/garage/brands/brand/${brand}/models`,
        method: 'GET',
      }),
      providesTags: (result, error, brand) => [{ type: 'Models', id: brand }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Listings endpoints
    getListings: builder.query({
      query: ({ page = 1, limit = 10, sort = 'recent' }) => ({
        url: '/api/post?type=listing',
        method: 'GET',
        params: { 
          page: page - 1, // Backend uses 0-based indexing
          limit, 
          sort: 'created_at', 
          order: 'desc' 
        },
      }),
      providesTags: ['Post'],
      // Force fresh data on each request for now
      keepUnusedDataFor: 0,
    }),

    getWantAds: builder.query({
      query: ({ page = 1, limit = 10, sort = 'recent' }) => ({
        url: '/api/post?type=want',
        method: 'GET',
        params: { 
          page: page - 1, // Backend uses 0-based indexing
          limit, 
          sort: 'created_at', 
          order: 'desc' 
        },
      }),
      providesTags: ['Post'],
      // Force fresh data on each request for now
      keepUnusedDataFor: 0,
    }),

    // Users endpoints
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search }) => ({
        url: '/api/users',
        method: 'GET',
        params: { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc',
          include_follow_status: true, // Request follow status for each user
          ...(search && { q: search }) // Add search parameter if provided
        },
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 0,
    }),

    // Get single user by ID
    getUser: builder.query({
      query: (userId) => ({
        url: `/api/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Posts endpoints
    getPosts: builder.query({
      query: ({ page = 1, limit = 10, type = null, make = null, model = null, user_id = null }) => {
        const params = { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc',
          ...(type && { type }), // Add type parameter if provided
          ...(make && { make }), // Add make parameter if provided
          ...(model && make && { model }), // Add model parameter if provided (requires make)
          ...(user_id && { user_id }) // Add user_id parameter if provided
        };
        console.log('API getPosts - params with user_id:', params);
        return {
          url: '/api/post',
          method: 'GET',
          params
        };
      },
      providesTags: ['Post'],
      // Force fresh data on each request for now
      keepUnusedDataFor: 0,
    }),

    // Protected user content endpoints
    getUserPosts: builder.query({
      query: ({ type = 'records', page = 1, limit = 24 }) => ({
        url: `/api/protected/post/type/${type}/${page}/none/${limit}`,
        method: 'GET',
      }),
      providesTags: ['UserEntries'],
    }),

    getUserProjects: builder.query({
      query: ({ page = 1, limit = 6 }) => ({
        url: `/api/protected/projects/${page}/none/${limit}`,
        method: 'GET',
      }),
      providesTags: ['UserEntries'],
    }),

    getUserEvents: builder.query({
      query: ({ page = 1, limit = 6 }) => ({
        url: `/api/protected/events/${page}/none/${limit}`,
        method: 'GET',
      }),
      providesTags: ['UserEntries'],
    }),

    getUserGarage: builder.query({
      query: ({ page = 1, limit = 6 }) => ({
        url: `/api/protected/garage/${page}/none/${limit}`,
        method: 'GET',
      }),
      providesTags: ['UserEntries'],
    }),

    // User settings update endpoints
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: '/api/users/update',
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),

    updateUserPassword: builder.mutation({
      query: (passwordData) => ({
        url: '/api/users/password',
        method: 'PUT',
        body: passwordData,
      }),
    }),

    // Post creation endpoint
    createPost: builder.mutation({
      query: (formData) => ({
        url: '/api/post/create',
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser/fetch set it for FormData
      }),
      invalidatesTags: ['Post', 'UserEntries'],
    }),

    // Search endpoint - matches Murray's approach
    search: builder.query({
      query: ({ query }) => ({
        url: `/api/search/${encodeURIComponent(query)}`,
        method: 'GET',
      }),
      providesTags: ['Search'],
      keepUnusedDataFor: 300, // Cache search results for 5 minutes
    }),

    // Username search for autocomplete - uses the dedicated search endpoint
    searchUsernames: builder.query({
      query: ({ query, limit = 10 }) => ({
        url: '/api/users/search',
        method: 'GET',
        params: {
          q: query,
          limit: Math.min(limit, 50), // Respect backend limit cap
          page: 0
        }
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 60, // Cache for 1 minute
      transformResponse: (response, meta, { query, limit = 10 }) => {
        console.log('searchUsernames API Response:', response);
        console.log('Search query:', query);
        
        // The backend now handles search properly, so just return the entries
        if (response && response.entries) {
          console.log('Total users found:', response.total);
          console.log('Users returned:', response.entries.length);
          return response.entries; // Return the entries directly
        }
        return [];
      }
    }),

    // Follow/unfollow endpoints - backend uses usernames, not user IDs
    followUser: builder.mutation({
      query: (username) => ({
        url: '/api/follow/set-following',
        method: 'POST',
        body: { username },
      }),
      invalidatesTags: (result, error, username) => [
        'User', 
        { type: 'User', id: `follow-${username}` }
      ],
    }),

    unfollowUser: builder.mutation({
      query: (username) => ({
        url: '/api/follow/set-unfollowing',
        method: 'POST',
        body: { username },
      }),
      invalidatesTags: (result, error, username) => [
        'User', 
        { type: 'User', id: `follow-${username}` }
      ],
    }),

    // Check follow status - backend uses username, not user ID
    getFollowStatus: builder.query({
      query: (username) => {
        if (!username || typeof username !== 'string') {
          throw new Error('Username must be a non-empty string');
        }
        return {
          url: `/api/protected/followstatus/${username}`,
          method: 'GET',
        };
      },
      providesTags: (result, error, username) => [{ type: 'User', id: `follow-${username}` }],
      keepUnusedDataFor: 0, // Don't cache follow status
    }),

    // Like endpoints
    getLikeInfo: builder.query({
      query: (entryId) => ({
        url: `/api/likes/info/${entryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, entryId) => [{ type: 'Like', id: entryId }],
    }),

    likePost: builder.mutation({
      query: ({ document_id, document_type }) => ({
        url: '/api/likes/like',
        method: 'POST',
        body: { document_id, document_type },
      }),
      invalidatesTags: (result, error, { document_id }) => [
        { type: 'Like', id: document_id }
      ],
    }),

    unlikePost: builder.mutation({
      query: ({ document_id, document_type }) => ({
        url: '/api/likes/unlike',
        method: 'POST',
        body: { document_id, document_type },
      }),
      invalidatesTags: (result, error, { document_id }) => [
        { type: 'Like', id: document_id }
      ],
    }),

    // Comment endpoints
    getComments: builder.query({
      query: ({ document_id, document_type, page = 0, limit = 10 }) => ({
        url: '/api/comment',
        method: 'GET',
        params: {
          document_id,
          document_type,
          page,
          limit,
          sort: 'created_at',
          order: 'desc'
        },
      }),
      providesTags: (result, error, { document_id }) => [
        { type: 'Comment', id: `LIST-${document_id}` }
      ],
    }),

    createComment: builder.mutation({
      query: ({ document_id, document_type, body }) => ({
        url: '/api/comment/create',
        method: 'POST',
        body: { document_id, document_type, body },
      }),
      invalidatesTags: (result, error, { document_id }) => [
        { type: 'Comment', id: `LIST-${document_id}` }
      ],
    }),

    updateComment: builder.mutation({
      query: ({ internal_id, body }) => ({
        url: '/api/comment/update',
        method: 'POST',
        body: { internal_id, body },
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        { type: 'Comment', id: internal_id }
      ],
    }),

    deleteComment: builder.mutation({
      query: ({ internal_id }) => ({
        url: '/api/comment/delete',
        method: 'POST',
        body: { internal_id },
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        { type: 'Comment', id: internal_id }
      ],
    }),

    // Articles endpoint  
    getArticles: builder.query({
      query: ({ page = 1, limit = 20 }) => {
        // Convert to 0-based indexing like other endpoints
        const index = page - 1;
        return {
          url: `/api/article/${index}/none/${limit}`,
          method: 'GET',
        };
      },
      providesTags: ['Articles'],
      keepUnusedDataFor: 0, // Don't cache for debugging
    }),

    // Events endpoint - dedicated events API
    getEvents: builder.query({
      query: ({ page = 1, limit = 10, event_type = null, type = null, time_filter = null }) => {
        const params = { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          ...(event_type && { event_type }), // "single" or "recurring"
          ...(type && { type }), // event type like "drive"
          ...(time_filter && { time_filter }), // "upcoming" or "past"
        };
        
        console.log('API getEvents - params:', params);
        console.log('API getEvents - final URL:', '/api/event');
        return {
          url: '/api/event',
          method: 'GET',
          params
        };
      },
      providesTags: ['Events'],
      keepUnusedDataFor: 0, // Don't cache for debugging
    }),
  }),
});

export const {
  useGetUserDetailsQuery,
  useGetUserEntriesQuery,
  useGetUserEntryQuery,
  useGetCarsQuery,
  useGetCarQuery,
  useGetAllBrandsQuery,
  useGetBrandModelsQuery,
  useGetUsersQuery,
  useGetUserQuery,
  useGetListingsQuery,
  useGetWantAdsQuery,
  useGetPostsQuery,
  useGetUserPostsQuery,
  useGetUserProjectsQuery,
  useGetUserEventsQuery,
  useGetUserGarageQuery,
  useUpdateUserProfileMutation,
  useUpdateUserPasswordMutation,
  useCreatePostMutation,
  useSearchQuery,
  useSearchUsernamesQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
  useGetLikeInfoQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetArticlesQuery,
  useGetEventsQuery,
} = apiService;