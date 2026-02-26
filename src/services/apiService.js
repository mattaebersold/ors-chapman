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
  tagTypes: ['User', 'Post', 'Cars', 'UserEntries', 'Search', 'Like', 'Comment', 'Brands', 'Models', 'Articles', 'Events', 'EventGallery', 'Projects', 'Mods', 'CarGallery', 'CarTask', 'Message', 'Tags', 'Notifications', 'CarFollow', 'Group', 'GroupMembers', 'GroupForum', 'GroupNews', 'GroupResources'],
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
      query: ({ page = 1, limit = 10, make = null, model = null, make_handle = null, model_handle = null, user_id = null }) => {
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
        
        // Add make_handle parameter if provided
        if (make_handle) {
          params.make_handle = make_handle;
        }
        
        // Add model parameter if provided (requires make)
        if (model && make) {
          params.model = model;
        }
        
        // Add model_handle parameter if provided (requires make_handle)
        if (model_handle && make_handle) {
          params.model_handle = model_handle;
        }
        
        // Add user_id parameter if provided
        if (user_id) {
          params.user_id = user_id;
        }
        
        return {
          url: '/api/garage',
          method: 'GET',
          params
        };
      },
      providesTags: ['Cars'],
      keepUnusedDataFor: 0,
    }),

    // Get featured cars
    getFeaturedCars: builder.query({
      query: ({ limit = 10 } = {}) => {
        return {
          url: '/api/garage',
          method: 'GET',
          params: {
            featured: true,
            limit,
            page: 0,
            sort: 'random',
            order: 'desc'
          }
        };
      },
      providesTags: ['Cars'],
      keepUnusedDataFor: 0, // Don't cache so we get different random results
    }),

    // Get featured marketplace listings
    getFeaturedListings: builder.query({
      query: ({ limit = 10 } = {}) => {
        return {
          url: '/api/post',
          method: 'GET',
          params: {
            featured: true,
            type: 'listing',
            limit,
            page: 0,
            sort: 'random'
          }
        };
      },
      providesTags: ['Post'],
      keepUnusedDataFor: 0, // Don't cache so we get different random results
    }),

    // Get featured want ads
    getFeaturedWantAds: builder.query({
      query: ({ limit = 10 } = {}) => {
        return {
          url: '/api/post',
          method: 'GET',
          params: {
            featured: true,
            type: 'want',
            limit,
            page: 0,
            sort: 'random'
          }
        };
      },
      providesTags: ['Post'],
      keepUnusedDataFor: 0, // Don't cache so we get different random results
    }),

    // Get featured spotted cars
    getFeaturedSpottedCars: builder.query({
      query: ({ limit = 10 } = {}) => {
        return {
          url: '/api/post',
          method: 'GET',
          params: {
            featured: true,
            type: 'spot',
            limit,
            page: 0,
            sort: 'random'
          }
        };
      },
      providesTags: ['Post'],
      keepUnusedDataFor: 0, 
    }),

    // Get featured users
    getFeaturedUsers: builder.query({
      query: ({ limit = 10 } = {}) => {
        return {
          url: '/api/users',
          method: 'GET',
          params: {
            featured: true,
            limit,
            page: 0,
            sort: 'random'
          }
        };
      },
      providesTags: ['User'],
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
      query: ({ page = 1, limit = 10, type = null, make = null, model = null, user_id = null, car_id = null, filter = null, username = null, omit = null, draft = null, sort = 'created_at', order = 'desc', group_id = null }) => {
        const params = {
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort,
          order,
          ...(type && { type }), // Add type parameter if provided
          ...(make && { make }), // Add make parameter if provided
          ...(model && make && { model }), // Add model parameter if provided (requires make)
          ...(user_id && { user_id }), // Add user_id parameter if provided
          ...(car_id && { car_id }), // Add car_id parameter if provided
          ...(filter && { filter }), // Add filter parameter (e.g., 'following')
          ...(username && { username }), // Add username parameter (needed for 'following' filter)
          ...(omit && { omit }), // Add omit parameter to exclude specific user's posts
          ...(draft !== null && { draft }), // Add draft parameter to filter draft/published posts
          ...(group_id && { group_id }), // Filter posts tagged with a group
        };

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

    // Get all projects (public listings)
    getProjects: builder.query({
      query: ({ page = 1, limit = 20, car_id, user_id }) => {
        const params = {
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc'
        };
        
        let url = `/api/project/${page - 1}/none/${limit}`;
        
        // Add query parameters if needed
        const queryParams = new URLSearchParams();
        if (car_id) queryParams.append('car_id', car_id);
        if (user_id) queryParams.append('user_id', user_id);
        
        if (queryParams.toString()) {
          url += `?${queryParams.toString()}`;
        }
        
        return {
          url,
          method: 'GET',
        };
      },
      providesTags: ['Projects'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create new project
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/api/project/create',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['UserEntries', 'Projects'],
    }),

    // Update existing project
    updateProject: builder.mutation({
      query: (projectData) => ({
        url: '/api/project/update',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['UserEntries', 'Projects'],
    }),

    // Delete project
    deleteProject: builder.mutation({
      query: (projectId) => ({
        url: '/api/project/delete',
        method: 'POST',
        body: { internal_id: projectId },
      }),
      invalidatesTags: ['UserEntries', 'Projects'],
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

    // User settings update endpoints - individual field updates
    updateUserBio: builder.mutation({
      query: ({ bio, userid }) => ({
        url: '/api/users/settings/update/bio',
        method: 'POST',
        body: { bio, userid },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserName: builder.mutation({
      query: ({ name, userid }) => ({
        url: '/api/users/settings/update/name',
        method: 'POST',
        body: { name, userid },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserUsername: builder.mutation({
      query: ({ username, userid }) => ({
        url: '/api/users/settings/update/username',
        method: 'POST',
        body: { username, userid },
      }),
      invalidatesTags: ['User'],
    }),
    updateUserEmail: builder.mutation({
      query: ({ email, userid }) => ({
        url: '/api/users/settings/update/email',
        method: 'POST',
        body: { email, userid },
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

    // Google authentication
    googleAuth: builder.mutation({
      query: ({ idToken }) => ({
        url: '/api/users/google-auth',
        method: 'POST',
        body: { idToken },
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

    // Update existing post
    updatePost: builder.mutation({
      query: ({ postId, formData }) => ({
        url: `/api/post/update`,
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser/fetch set it for FormData
      }),
      invalidatesTags: (result, error, { postId }) => [
        'Post',
        'UserEntries',
        { type: 'Post', id: postId }
      ],
    }),

    // Delete post
    deletePost: builder.mutation({
      query: (postId) => ({
        url: `/api/post/delete`,
        method: 'POST',
        body: { internal_id: postId },
      }),
      invalidatesTags: (result, error, postId) => [
        'Post',
        'UserEntries',
        { type: 'Post', id: postId }
      ],
    }),

    // CarTask endpoints
    getCarTasks: builder.query({
      query: ({ carId }) => ({
        url: `/api/cartask/car/${carId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { carId }) => [
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
    }),

    createCarTask: builder.mutation({
      query: ({ carId, formData }) => ({
        url: `/api/cartask/create`,
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser/fetch set it for FormData
      }),
      invalidatesTags: (result, error, { carId }) => [
        'CarTask',
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
    }),

    updateCarTask: builder.mutation({
      query: ({ taskId, formData }) => ({
        url: `/api/cartask/update/${taskId}`,
        method: 'PUT',
        body: formData,
        // Don't set Content-Type header - let browser/fetch set it for FormData
      }),
      invalidatesTags: (result, error, { taskId, carId }) => [
        'CarTask',
        { type: 'CarTask', id: taskId },
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
    }),

    toggleCarTaskCompletion: builder.mutation({
      query: ({ internal_id, completed }) => ({
        url: `/api/cartask/toggle-completion`,
        method: 'POST',
        body: { internal_id, completed },
      }),
      invalidatesTags: (result, error, { internal_id, carId }) => [
        'CarTask',
        { type: 'CarTask', id: internal_id },
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
    }),

    updateCarTaskPositions: builder.mutation({
      query: ({ tasks, carId }) => ({
        url: `/api/cartask/update-positions`,
        method: 'POST',
        body: { tasks },
      }),
      invalidatesTags: (result, error, { carId }) => [
        'CarTask',
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
    }),

    deleteCarTask: builder.mutation({
      query: (taskId) => ({
        url: `/api/cartask/delete/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { taskId, carId }) => [
        'CarTask',
        { type: 'CarTask', id: taskId },
        { type: 'CarTask', id: `CAR-${carId}` }
      ],
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
        // The backend now handles search properly, so just return the entries
        if (response && response.entries) {
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
    // Get users the current user is following
    getPaginatedFollowing: builder.query({
      query: ({ index = 0, limit = 10, omit = 'none' }) => ({
        url: `/api/follow/following/${index}/${omit}/${limit}`,
        method: 'GET',
      }),
      providesTags: ['User'],
      keepUnusedDataFor: 30, // Cache for 30 seconds
    }),

    // Like endpoints
    getLikeInfo: builder.query({
      query: (entryId) => ({
        url: `/api/likes/info/${entryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, entryId) => [{ type: 'Like', id: entryId }],
    }),

    getPostCounts: builder.query({
      query: (entryId) => ({
        url: `/api/likes/counts/${entryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, entryId) => [
        { type: 'Like', id: entryId },
        { type: 'Comment', id: entryId }
      ],
    }),

    getLikeUsers: builder.query({
      query: ({ document_id, document_type, limit = 10 }) => ({
        url: `/api/likes/users/${document_id}`,
        method: 'GET',
        params: { document_type, limit },
      }),
      providesTags: (result, error, { document_id }) => [
        { type: 'Like', id: document_id }
      ],
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
        url: `/api/comment?entry_type=${document_type}&entry_id=${document_id}&page=${page}&omit=none&limit=${limit}`,
        method: 'GET',
      }),
      providesTags: (result, error, { document_id }) => [
        { type: 'Comment', id: `LIST-${document_id}` }
      ],
    }),

    createComment: builder.mutation({
      query: ({ document_id, document_type, body }) => ({
        url: '/api/comment/create',
        method: 'POST',
        body: { 
          document_id: document_id,
          document_type: document_type, 
          body: body 
        },
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

    // Notification endpoints
    getNotifications: builder.query({
      query: ({ limit = 20, offset = 0, unread_only = false, include_archived = false }) => ({
        url: '/api/notifications',
        method: 'GET',
        params: { limit, offset, unread_only, include_archived },
      }),
      providesTags: ['Notifications'],
      keepUnusedDataFor: 0, // Don't cache to ensure fresh data
    }),

    getUnreadCount: builder.query({
      query: () => ({
        url: '/api/notifications/unread-count',
        method: 'GET',
      }),
      providesTags: ['Notifications'],
      keepUnusedDataFor: 0,
    }),

    markNotificationAsRead: builder.mutation({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    markAllNotificationsAsRead: builder.mutation({
      query: () => ({
        url: '/api/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    archiveNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}/archive`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    archiveAllNotifications: builder.mutation({
      query: () => ({
        url: '/api/notifications/archive-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    deleteNotification: builder.mutation({
      query: (notificationId) => ({
        url: `/api/notifications/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // Articles endpoint
    getArticles: builder.query({
      query: ({ page = 1, limit = 20 }) => {
        const backendPage = page - 1; // Backend uses 0-based indexing
        return {
          url: `/api/article/${backendPage}/none/${limit}`,
          method: 'GET',
        };
      },
      providesTags: ['Articles'],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get single article by ID
    getArticle: builder.query({
      query: (articleId) => ({
        url: `/api/article/detail/${articleId}`,
        method: 'GET',
      }),
      providesTags: (result, error, articleId) => [
        { type: 'Articles', id: articleId }
      ],
      keepUnusedDataFor: 300,
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
        
        return {
          url: '/api/event',
          method: 'GET',
          params
        };
      },
      providesTags: ['Events'],
      keepUnusedDataFor: 0, // Don't cache for debugging
    }),

    // Get single event by ID
    getEvent: builder.query({
      query: (eventId) => ({
        url: `/api/event/${eventId}`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [
        { type: 'Events', id: eventId }
      ],
      keepUnusedDataFor: 300,
    }),

    // Create new event
    createEvent: builder.mutation({
      query: (eventData) => ({
        url: '/api/event/create',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Events', 'UserEntries'],
    }),

    // Update existing event
    updateEvent: builder.mutation({
      query: (eventData) => ({
        url: '/api/event/update',
        method: 'POST',
        body: eventData,
      }),
      invalidatesTags: ['Events', 'UserEntries'],
    }),

    // Delete event
    deleteEvent: builder.mutation({
      query: (eventId) => ({
        url: '/api/event/delete',
        method: 'POST',
        body: { internal_id: eventId },
      }),
      invalidatesTags: ['Events', 'UserEntries'],
    }),

    // Event Gallery endpoints
    getEventGalleries: builder.query({
      query: (eventId) => ({
        url: `/api/event/galleries/${eventId}`,
        method: 'GET',
      }),
      providesTags: (result, error, eventId) => [
        'EventGallery',
        { type: 'EventGallery', id: `event-${eventId}` }
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    getEventGalleryBucketImages: builder.query({
      query: (bucketName) => ({
        url: `/api/eventgallery/bucket/${bucketName}`,
        method: 'GET',
      }),
      providesTags: (result, error, bucketName) => [
        { type: 'EventGallery', id: `bucket-${bucketName}` }
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    createEventGallery: builder.mutation({
      query: (galleryData) => ({
        url: '/api/eventgallery/create',
        method: 'POST',
        body: galleryData,
      }),
      invalidatesTags: (result, error, { event_id }) => [
        'EventGallery',
        ...(event_id ? [{ type: 'EventGallery', id: `event-${event_id}` }] : [])
      ],
    }),

    updateEventGallery: builder.mutation({
      query: (galleryData) => ({
        url: '/api/eventgallery/update',
        method: 'POST',
        body: galleryData,
      }),
      invalidatesTags: (result, error, { event_id, internal_id }) => [
        'EventGallery',
        { type: 'EventGallery', id: internal_id },
        ...(event_id ? [{ type: 'EventGallery', id: `event-${event_id}` }] : [])
      ],
    }),

    deleteEventGallery: builder.mutation({
      query: ({ internal_id, event_id }) => ({
        url: '/api/eventgallery/delete',
        method: 'POST',
        body: { internal_id },
      }),
      invalidatesTags: (result, error, { internal_id, event_id }) => [
        'EventGallery',
        { type: 'EventGallery', id: internal_id },
        ...(event_id ? [{ type: 'EventGallery', id: `event-${event_id}` }] : [])
      ],
    }),

    // Mods endpoints
    getMods: builder.query({
      query: ({ car_id, page = 1, limit = 20 }) => {
        const params = { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc'
        };
        
        // Add car_id parameter if provided
        if (car_id) {
          params.car_id = car_id;
        }
        
        return {
          url: '/api/mods',
          method: 'GET',
          params
        };
      },
      providesTags: (result, error, { car_id }) => [
        'Mods',
        ...(car_id ? [{ type: 'Mods', id: `car-${car_id}` }] : [])
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get single mod by ID
    getMod: builder.query({
      query: (modId) => ({
        url: `/api/mods/${modId}`,
        method: 'GET',
      }),
      providesTags: (result, error, modId) => [{ type: 'Mods', id: modId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create new mod
    createMod: builder.mutation({
      query: (modData) => ({
        url: '/api/mods',
        method: 'POST',
        body: modData,
      }),
      invalidatesTags: (result, error, { car_id }) => [
        'Mods',
        ...(car_id ? [{ type: 'Mods', id: `car-${car_id}` }] : [])
      ],
    }),

    // Update existing mod
    updateMod: builder.mutation({
      query: ({ modId, ...modData }) => ({
        url: `/api/mods/${modId}`,
        method: 'PUT',
        body: modData,
      }),
      invalidatesTags: (result, error, { modId, car_id }) => [
        'Mods',
        { type: 'Mods', id: modId },
        ...(car_id ? [{ type: 'Mods', id: `car-${car_id}` }] : [])
      ],
    }),

    // Delete mod
    deleteMod: builder.mutation({
      query: (modId) => ({
        url: `/api/mods/${modId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, modId) => [
        'Mods',
        { type: 'Mods', id: modId }
      ],
    }),

    // Car Gallery endpoints - separate collection from car.gallery
    getCarGalleries: builder.query({
      query: ({ internal_id, page = 1, limit = 20 }) => {
        const params = { 
          page: page - 1, // Backend uses 0-based indexing
          limit,
          sort: 'created_at',
          order: 'desc'
        };
        
        // Add internal_id parameter if provided
        if (internal_id) {
          params.internal_id = internal_id;
        }
        
        return {
          url: '/api/carGallery',
          method: 'GET',
          params
        };
      },
      providesTags: (result, error, { internal_id }) => [
        'CarGallery',
        ...(internal_id ? [{ type: 'CarGallery', id: `car-${internal_id}` }] : [])
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Car-specific galleries using internal_id URL path (like Murray)
    getCarGalleriesByInternalId: builder.query({
      query: (carInternalId) => ({
        url: `/api/car/galleries/${carInternalId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carInternalId) => [
        'CarGallery',
        { type: 'CarGallery', id: `car-${carInternalId}` }
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Car-specific mods using internal_id URL path (like Murray)  
    getCarModsByInternalId: builder.query({
      query: (carInternalId) => ({
        url: `/api/car/mods/${carInternalId}`,
        method: 'GET',
      }),
      providesTags: (result, error, carInternalId) => [
        'Mods',
        { type: 'Mods', id: `car-${carInternalId}` }
      ],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Get single car gallery by ID
    getCarGallery: builder.query({
      query: (galleryId) => ({
        url: `/api/carGallery/${galleryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, galleryId) => [{ type: 'CarGallery', id: galleryId }],
      keepUnusedDataFor: 300, // Cache for 5 minutes
    }),

    // Create new car gallery
    createCarGallery: builder.mutation({
      query: (galleryData) => ({
        url: '/api/carGallery',
        method: 'POST',
        body: galleryData,
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        'CarGallery',
        ...(internal_id ? [{ type: 'CarGallery', id: `car-${internal_id}` }] : [])
      ],
    }),

    // Update existing car gallery
    updateCarGallery: builder.mutation({
      query: ({ galleryId, ...galleryData }) => ({
        url: `/api/carGallery/${galleryId}`,
        method: 'PUT',
        body: galleryData,
      }),
      invalidatesTags: (result, error, { galleryId, internal_id }) => [
        'CarGallery',
        { type: 'CarGallery', id: galleryId },
        ...(internal_id ? [{ type: 'CarGallery', id: `car-${internal_id}` }] : [])
      ],
    }),

    // Delete car gallery
    deleteCarGallery: builder.mutation({
      query: (galleryId) => ({
        url: `/api/carGallery/${galleryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, galleryId) => [
        'CarGallery',
        { type: 'CarGallery', id: galleryId }
      ],
    }),

    // Garage Car endpoints - main car CRUD operations
    createGarageCar: builder.mutation({
      query: (formData) => ({
        url: '/api/car/create',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [
        'Cars',
        'UserEntries',
      ],
    }),

    updateGarageCar: builder.mutation({
      query: (formData) => ({
        url: '/api/car/update',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, formData) => [
        'Cars',
        'UserEntries',
        ...(result?._id ? [{ type: 'Cars', id: result._id }] : [])
      ],
    }),

    deleteGarageCar: builder.mutation({
      query: (carId) => ({
        url: '/api/car/delete',
        method: 'POST',
        body: { internal_id: carId },
      }),
      invalidatesTags: (result, error, carId) => [
        'Cars',
        'UserEntries',
        { type: 'Cars', id: carId }
      ],
    }),

    // Admin toggle featured status endpoints
    toggleGarageCarFeatured: builder.mutation({
      query: ({ internal_id, featured }) => ({
        url: '/api/car/toggle-featured',
        method: 'POST',
        body: { internal_id, featured },
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        'Cars',
        { type: 'Cars', id: internal_id }
      ],
    }),

    togglePostFeatured: builder.mutation({
      query: ({ internal_id, featured }) => ({
        url: '/api/post/toggle-featured',
        method: 'POST',
        body: { internal_id, featured },
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        'Post',
        { type: 'Post', id: internal_id }
      ],
    }),

    toggleEventFeatured: builder.mutation({
      query: ({ internal_id, featured }) => ({
        url: '/api/event/toggle-featured',
        method: 'POST',
        body: { internal_id, featured },
      }),
      invalidatesTags: (result, error, { internal_id }) => [
        'Events',
        { type: 'Events', id: internal_id }
      ],
    }),

    toggleUserFeatured: builder.mutation({
      query: ({ user_id, featured }) => ({
        url: '/api/user/toggle-featured',
        method: 'POST',
        body: { user_id, featured },
      }),
      invalidatesTags: (result, error, { user_id }) => [
        'Users',
        { type: 'User', id: user_id }
      ],
    }),

    // Car Follow endpoints
    getCarFollowers: builder.query({
      query: ({ car_id, page = 0, limit = 24 }) => ({
        url: `/api/carfollow/car-followers/${car_id}/${page}/none/${limit}`,
        method: 'GET',
      }),
      providesTags: (result, error, { car_id }) => [
        'CarFollow',
        { type: 'CarFollow', id: car_id }
      ],
    }),

    // Tag endpoints
    getTagsByPost: builder.query({
      query: (postId) => ({
        url: `/api/tags/post/${postId}`,
        method: 'GET',
      }),
      providesTags: (result, error, postId) => [
        'Tags',
        { type: 'Tags', id: postId }
      ],
      keepUnusedDataFor: 0,
    }),

    getRecentTags: builder.query({
      query: ({ limit = 20 } = {}) => ({
        url: '/api/tags/recent',
        method: 'GET',
        params: { limit },
      }),
      providesTags: ['Tags'],
      keepUnusedDataFor: 60,
    }),

    createTag: builder.mutation({
      query: (tagData) => ({
        url: '/api/tags',
        method: 'POST',
        body: tagData,
      }),
      invalidatesTags: ['Tags'],
    }),

    deleteTag: builder.mutation({
      query: (tagId) => ({
        url: `/api/tags/${tagId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Tags'],
    }),

    syncPostTags: builder.mutation({
      query: ({ post_id, tagged_users = [], tagged_cars = [], tagged_events = [], tagged_groups = [] }) => ({
        url: '/api/tags/sync',
        method: 'POST',
        body: { post_id, tagged_users, tagged_cars, tagged_events, tagged_groups },
      }),
      invalidatesTags: ['Tags'],
    }),

    // Message endpoints
    getMessages: builder.query({
      query: ({ page = 0, limit = 20, unread_only = false } = {}) => ({
        url: '/api/message',
        method: 'GET',
        params: { page, limit, unread_only },
      }),
      providesTags: ['Message'],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),

    getMessageThread: builder.query({
      query: (threadId) => ({
        url: `/api/message/thread/${threadId}`,
        method: 'GET',
      }),
      providesTags: (result, error, threadId) => [
        'Message',
        { type: 'Message', id: `thread-${threadId}` }
      ],
      keepUnusedDataFor: 60,
    }),

    createMessage: builder.mutation({
      query: (messageData) => ({
        url: '/api/message/create',
        method: 'POST',
        body: messageData,
      }),
      invalidatesTags: ['Message'],
    }),

    markMessageAsRead: builder.mutation({
      query: (messageId) => ({
        url: `/api/message/${messageId}/read`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, messageId) => [
        'Message',
        { type: 'Message', id: messageId }
      ],
    }),

    markMessageAsUnread: builder.mutation({
      query: (messageId) => ({
        url: `/api/message/${messageId}/unread`,
        method: 'PUT',
      }),
      invalidatesTags: (result, error, messageId) => [
        'Message',
        { type: 'Message', id: messageId }
      ],
    }),

    deleteMessage: builder.mutation({
      query: (messageId) => ({
        url: `/api/message/${messageId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Message'],
    }),

    getUnreadMessageCount: builder.query({
      query: () => ({
        url: '/api/message/unread/count',
        method: 'GET',
      }),
      providesTags: ['Message'],
      keepUnusedDataFor: 30, // Cache for 30 seconds
    }),

    searchUsers: builder.query({
      query: ({ q, limit = 10 }) => ({
        url: '/api/message/users/search',
        method: 'GET',
        params: { q, limit },
      }),
      keepUnusedDataFor: 60,
    }),

    // Cache management endpoints (admin only)
    getCacheStats: builder.query({
      query: () => ({
        url: '/api/cache/stats',
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Don't cache cache stats
    }),

    getCacheCollections: builder.query({
      query: () => ({
        url: '/api/cache/collections',
        method: 'GET',
      }),
      keepUnusedDataFor: 0,
    }),

    clearCollectionCache: builder.mutation({
      query: (collection) => ({
        url: `/api/cache/clear/${collection}`,
        method: 'POST',
      }),
    }),

    clearMultipleCollections: builder.mutation({
      query: (collections) => ({
        url: '/api/cache/clear-multiple',
        method: 'POST',
        body: { collections },
      }),
    }),

    flushAllCache: builder.mutation({
      query: () => ({
        url: '/api/cache/flush',
        method: 'POST',
      }),
    }),

    // =====================
    // Group endpoints
    // =====================

    getGroups: builder.query({
      query: ({ page = 0, omit = 'none', limit = 24, user_id, type, category, tag }) => {
        const params = {};
        if (user_id) params.user_id = user_id;
        if (type) params.type = type;
        if (category) params.category = category;
        if (tag) params.tag = tag;
        return {
          url: `/api/group/${page}/${omit}/${limit}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['Group'],
    }),

    getGroupDetail: builder.query({
      query: (id) => ({
        url: `/api/group/detail/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Group', id }],
    }),

    createGroup: builder.mutation({
      query: (groupData) => ({
        url: '/api/group/create',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Group', 'UserEntries'],
    }),

    updateGroup: builder.mutation({
      query: (groupData) => ({
        url: '/api/group/update',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Group', 'UserEntries'],
    }),

    deleteGroup: builder.mutation({
      query: (data) => ({
        url: '/api/group/delete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Group', 'UserEntries'],
    }),

    // Group membership
    getGroupMembers: builder.query({
      query: ({ group_id, status }) => ({
        url: `/api/group/${group_id}/members`,
        method: 'GET',
        params: status ? { status } : undefined,
      }),
      providesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    getUserGroups: builder.query({
      query: ({ user_id, status, member_type }) => {
        const params = {};
        if (status) params.status = status;
        if (member_type) params.member_type = member_type;
        return {
          url: `/api/group/user/${user_id}/groups`,
          method: 'GET',
          params,
        };
      },
      providesTags: (result, error, { user_id }) => [
        { type: 'GroupMembers', id: `user-${user_id}` }
      ],
    }),

    joinGroup: builder.mutation({
      query: (group_id) => ({
        url: `/api/group/${group_id}/join`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, group_id) => [
        { type: 'GroupMembers', id: group_id },
        'Group',
      ],
    }),

    leaveGroup: builder.mutation({
      query: (group_id) => ({
        url: `/api/group/${group_id}/leave`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, group_id) => [
        { type: 'GroupMembers', id: group_id },
        'Group',
      ],
    }),

    approveMember: builder.mutation({
      query: ({ group_id, user_id }) => ({
        url: `/api/group/${group_id}/approve/${user_id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    rejectMember: builder.mutation({
      query: ({ group_id, user_id }) => ({
        url: `/api/group/${group_id}/reject/${user_id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    removeMember: builder.mutation({
      query: ({ group_id, user_id }) => ({
        url: `/api/group/${group_id}/remove/${user_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    updateMemberType: builder.mutation({
      query: ({ group_id, user_id, member_type }) => ({
        url: `/api/group/${group_id}/member/${user_id}`,
        method: 'PATCH',
        body: { member_type },
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    inviteMember: builder.mutation({
      query: ({ group_id, user_id }) => ({
        url: `/api/group/${group_id}/invite/${user_id}`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    cancelInvitation: builder.mutation({
      query: ({ group_id, user_id }) => ({
        url: `/api/group/${group_id}/invite/${user_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { group_id }) => [
        { type: 'GroupMembers', id: group_id }
      ],
    }),

    // Group cars
    getGroupCars: builder.query({
      query: ({ group_id, page = 1, limit = 24 }) => ({
        url: `/api/garage/group/${group_id}`,
        method: 'GET',
        params: { page, limit },
      }),
      providesTags: (result, error, { group_id }) => [
        { type: 'Group', id: `cars-${group_id}` }
      ],
    }),

    // =====================
    // Group Forum endpoints
    // =====================

    getGroupForumPosts: builder.query({
      query: ({ page = 0, omit = 'none', limit = 24, group_id, category }) => {
        const params = {};
        if (group_id) params.group_id = group_id;
        if (category) params.category = category;
        return {
          url: `/api/groupforum/${page}/${omit}/${limit}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['GroupForum'],
    }),

    getGroupForumPost: builder.query({
      query: (id) => ({
        url: `/api/groupforum/detail/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'GroupForum', id }],
    }),

    createGroupForumPost: builder.mutation({
      query: (data) => ({
        url: '/api/groupforum/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupForum'],
    }),

    updateGroupForumPost: builder.mutation({
      query: (data) => ({
        url: '/api/groupforum/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupForum'],
    }),

    deleteGroupForumPost: builder.mutation({
      query: (data) => ({
        url: '/api/groupforum/delete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupForum'],
    }),

    upvoteForumPost: builder.mutation({
      query: (data) => ({
        url: '/api/groupforum/upvote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupForum'],
    }),

    downvoteForumPost: builder.mutation({
      query: (data) => ({
        url: '/api/groupforum/downvote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupForum'],
    }),

    // =====================
    // Group News endpoints
    // =====================

    getGroupNews: builder.query({
      query: ({ page = 0, omit = 'none', limit = 24, group_id }) => {
        const params = {};
        if (group_id) params.group_id = group_id;
        return {
          url: `/api/groupnews/${page}/${omit}/${limit}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['GroupNews'],
    }),

    getGroupNewsDetail: builder.query({
      query: (id) => ({
        url: `/api/groupnews/detail/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'GroupNews', id }],
    }),

    createGroupNews: builder.mutation({
      query: (data) => ({
        url: '/api/groupnews/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupNews'],
    }),

    updateGroupNews: builder.mutation({
      query: (data) => ({
        url: '/api/groupnews/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupNews'],
    }),

    deleteGroupNews: builder.mutation({
      query: (data) => ({
        url: '/api/groupnews/delete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupNews'],
    }),

    // =====================
    // Group Resources endpoints
    // =====================

    getGroupResources: builder.query({
      query: ({ page = 0, omit = 'none', limit = 24, group_id, category }) => {
        const params = {};
        if (group_id) params.group_id = group_id;
        if (category) params.category = category;
        return {
          url: `/api/groupresource/${page}/${omit}/${limit}`,
          method: 'GET',
          params,
        };
      },
      providesTags: ['GroupResources'],
    }),

    getGroupResourceDetail: builder.query({
      query: (id) => ({
        url: `/api/groupresource/detail/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'GroupResources', id }],
    }),

    createGroupResource: builder.mutation({
      query: (data) => ({
        url: '/api/groupresource/create',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupResources'],
    }),

    updateGroupResource: builder.mutation({
      query: (data) => ({
        url: '/api/groupresource/update',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupResources'],
    }),

    deleteGroupResource: builder.mutation({
      query: (data) => ({
        url: '/api/groupresource/delete',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupResources'],
    }),

    upvoteResource: builder.mutation({
      query: (data) => ({
        url: '/api/groupresource/upvote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupResources'],
    }),

    downvoteResource: builder.mutation({
      query: (data) => ({
        url: '/api/groupresource/downvote',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['GroupResources'],
    }),

  }),
});

export const {
  useGetUserDetailsQuery,
  useGetUserEntriesQuery,
  useGetUserEntryQuery,
  useGetCarsQuery,
  useGetFeaturedCarsQuery,
  useGetFeaturedListingsQuery,
  useGetFeaturedWantAdsQuery,
  useGetFeaturedSpottedCarsQuery,
  useGetFeaturedUsersQuery,
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
  useGetProjectsQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetUserEventsQuery,
  useGetUserGarageQuery,
  useUpdateUserBioMutation,
  useUpdateUserNameMutation,
  useUpdateUserUsernameMutation,
  useUpdateUserEmailMutation,
  useUpdateUserPasswordMutation,
  useGoogleAuthMutation,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useSearchQuery,
  useSearchUsernamesQuery,
  useFollowUserMutation,
  useUnfollowUserMutation,
  useGetFollowStatusQuery,
  useGetPaginatedFollowingQuery,
  useGetLikeInfoQuery,
  useGetPostCountsQuery,
  useGetLikeUsersQuery,
  useLikePostMutation,
  useUnlikePostMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useArchiveNotificationMutation,
  useArchiveAllNotificationsMutation,
  useDeleteNotificationMutation,
  useGetArticlesQuery,
  useGetArticleQuery,
  useGetEventsQuery,
  useGetEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useDeleteEventMutation,
  useGetEventGalleriesQuery,
  useGetEventGalleryBucketImagesQuery,
  useCreateEventGalleryMutation,
  useUpdateEventGalleryMutation,
  useDeleteEventGalleryMutation,
  useGetModsQuery,
  useGetModQuery,
  useCreateModMutation,
  useUpdateModMutation,
  useDeleteModMutation,
  useGetCarGalleriesQuery,
  useGetCarGalleryQuery,
  useCreateCarGalleryMutation,
  useUpdateCarGalleryMutation,
  useDeleteCarGalleryMutation,
  useGetCarGalleriesByInternalIdQuery,
  useGetCarModsByInternalIdQuery,
  useGetCarTasksQuery,
  useCreateCarTaskMutation,
  useUpdateCarTaskMutation,
  useToggleCarTaskCompletionMutation,
  useUpdateCarTaskPositionsMutation,
  useDeleteCarTaskMutation,
  useCreateGarageCarMutation,
  useUpdateGarageCarMutation,
  useDeleteGarageCarMutation,
  useToggleGarageCarFeaturedMutation,
  useTogglePostFeaturedMutation,
  useToggleEventFeaturedMutation,
  useToggleUserFeaturedMutation,
  useGetTagsByPostQuery,
  useGetRecentTagsQuery,
  useCreateTagMutation,
  useDeleteTagMutation,
  useSyncPostTagsMutation,
  useGetMessagesQuery,
  useGetMessageThreadQuery,
  useCreateMessageMutation,
  useMarkMessageAsReadMutation,
  useMarkMessageAsUnreadMutation,
  useDeleteMessageMutation,
  useGetUnreadMessageCountQuery,
  useSearchUsersQuery,
  useGetCacheStatsQuery,
  useGetCacheCollectionsQuery,
  useClearCollectionCacheMutation,
  useClearMultipleCollectionsMutation,
  useFlushAllCacheMutation,
  useGetCarFollowersQuery,
  // Group hooks
  useGetGroupsQuery,
  useGetGroupDetailQuery,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useGetGroupMembersQuery,
  useGetUserGroupsQuery,
  useJoinGroupMutation,
  useLeaveGroupMutation,
  useApproveMemberMutation,
  useRejectMemberMutation,
  useRemoveMemberMutation,
  useUpdateMemberTypeMutation,
  useInviteMemberMutation,
  useCancelInvitationMutation,
  useGetGroupCarsQuery,
  // Group Forum hooks
  useGetGroupForumPostsQuery,
  useGetGroupForumPostQuery,
  useCreateGroupForumPostMutation,
  useUpdateGroupForumPostMutation,
  useDeleteGroupForumPostMutation,
  useUpvoteForumPostMutation,
  useDownvoteForumPostMutation,
  // Group News hooks
  useGetGroupNewsQuery,
  useGetGroupNewsDetailQuery,
  useCreateGroupNewsMutation,
  useUpdateGroupNewsMutation,
  useDeleteGroupNewsMutation,
  // Group Resources hooks
  useGetGroupResourcesQuery,
  useGetGroupResourceDetailQuery,
  useCreateGroupResourceMutation,
  useUpdateGroupResourceMutation,
  useDeleteGroupResourceMutation,
  useUpvoteResourceMutation,
  useDownvoteResourceMutation,
} = apiService;