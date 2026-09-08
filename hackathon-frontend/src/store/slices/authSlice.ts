import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAdmin: boolean;
}

// Initialize from localStorage on first load
const getInitialState = (): AuthState => {
  if (typeof window === 'undefined') return { token: null, userId: null, isAdmin: false };
  const token = localStorage.getItem('token');
  if (!token) return { token: null, userId: null, isAdmin: false };
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { token, userId: payload.id || null, isAdmin: !!payload.isAdmin };
  } catch {
    return { token: null, userId: null, isAdmin: false };
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action: PayloadAction<{ token: string }>) => {
      const { token } = action.payload;
      state.token = token;
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        state.userId = payload.id || null;
        state.isAdmin = !!payload.isAdmin;
      } catch {
        state.userId = null;
        state.isAdmin = false;
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
    },
    logout: (state) => {
      state.token = null;
      state.userId = null;
      state.isAdmin = false;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
