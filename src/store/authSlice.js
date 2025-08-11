import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { CONFIG } from '../../config';

// Utility functions for token management
const isTokenExpired = (tokenData) => {
  try {
    const parsed = JSON.parse(tokenData);
    return new Date().getTime() > parsed.expiry;
  } catch {
    return true;
  }
};

const getStoredToken = async () => {
  try {
    const tokenData = await AsyncStorage.getItem('userToken');
    if (tokenData && !isTokenExpired(tokenData)) {
      const parsed = JSON.parse(tokenData);
      return parsed.token;
    }
    await AsyncStorage.removeItem('userToken');
    return null;
  } catch {
    return null;
  }
};

// Async thunks
export const userLogin = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        `${CONFIG.API_BASE_URL}/api/users/login`,
        { email, password },
        config
      );

      // Store token with expiry
      const tokenData = {
        token: data.userToken,
        expiry: new Date().getTime() + 30 * 24 * 60 * 60 * 1000, // 30 days
      };
      await AsyncStorage.setItem('userToken', JSON.stringify(tokenData));

      return data;
    } catch (error) {
      if (error.response && error.response.data.error) {
        return rejectWithValue(error.response.data.error);
      } else {
        return rejectWithValue('An error occurred');
      }
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      const { data } = await axios.post(
        `${CONFIG.API_BASE_URL}/api/users/register`,
        formData,
        config
      );

      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await AsyncStorage.removeItem('userToken');
});

// Initial state
const initialState = {
  loading: false,
  userInfo: null,
  userToken: null,
  isLoggedIn: false,
  error: null,
  success: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCredentials: (state, { payload }) => {
      state.userInfo = payload;
      state.isLoggedIn = !!payload;
    },
    restoreSession: (state, { payload }) => {
      state.userToken = payload;
      state.isLoggedIn = !!payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogin.fulfilled, (state, { payload }) => {
        state.loading = false;
        state.userInfo = payload;
        state.userToken = payload.userToken;
        state.isLoggedIn = true;
        state.error = null;
      })
      .addCase(userLogin.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
        state.isLoggedIn = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error = payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.userInfo = null;
        state.userToken = null;
        state.isLoggedIn = false;
        state.error = null;
      });
  },
});

export const { clearError, clearSuccess, setCredentials, restoreSession } = authSlice.actions;

export { getStoredToken };
export default authSlice.reducer;