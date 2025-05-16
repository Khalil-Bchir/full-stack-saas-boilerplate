import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { createSelector } from 'reselect';

import { RootState } from '../store';

interface AuthState {
  loading: boolean;
  error: string | null;
  accessToken: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
}

const isClient = typeof window !== 'undefined';

const initialState: AuthState = {
  loading: false,
  error: null,
  accessToken: isClient ? sessionStorage.getItem('access_token') : null,
  user:
    isClient && sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user')!) : null,
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`, {
      email,
      password,
    });
    return response.data;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.accessToken = null;
      state.user = null;
      if (isClient) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.accessToken = action.payload.access_token;
        state.user = action.payload.user;
        if (isClient) {
          sessionStorage.setItem('access_token', action.payload.access_token);
          sessionStorage.setItem('user', JSON.stringify(action.payload.user));
          console.log('Saved user:', JSON.parse(sessionStorage.getItem('user')!));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to login';
      });
  },
});

export const { logout } = authSlice.actions;

export const selectAuthState = (state: RootState) => state.auth;

export const selectAuth = createSelector([selectAuthState], (auth) => ({
  ...auth,
  isAuthenticated: !!auth.accessToken,
}));

export default authSlice.reducer;
