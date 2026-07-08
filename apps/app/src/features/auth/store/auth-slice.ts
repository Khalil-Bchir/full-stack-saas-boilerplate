import { api } from '@/lib/api';
import { AUTH_USER_KEY, clearAuthSession, persistAuthSession } from '@/lib/auth';
import type { RootState } from '@/lib/store';
import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { createSelector } from 'reselect';

import type { AuthState, LoginInput, RegisterInput } from '../types';

const isClient = typeof window !== 'undefined';

const initialState: AuthState = {
  loading: false,
  error: null,
  accessToken: isClient ? sessionStorage.getItem('access_token') : null,
  user:
    isClient && sessionStorage.getItem(AUTH_USER_KEY)
      ? JSON.parse(sessionStorage.getItem(AUTH_USER_KEY)!)
      : null,
};

export const login = createAsyncThunk('auth/login', async ({ email, password }: LoginInput) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ email, password }: RegisterInput) => {
    const response = await api.post('/auth/register', { email, password });
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
      state.error = null;
      clearAuthSession();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<{ access_token: string; user: AuthState['user'] }>) => {
          state.loading = false;
          state.accessToken = action.payload.access_token;
          state.user = action.payload.user;
          if (action.payload.access_token && action.payload.user) {
            persistAuthSession(action.payload.access_token, action.payload.user);
          }
        },
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to login';
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to register';
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
