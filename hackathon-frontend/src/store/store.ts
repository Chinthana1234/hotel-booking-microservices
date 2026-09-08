import { configureStore } from '@reduxjs/toolkit';
import { roomApi } from './api/roomApi';
import { bookingApi } from './api/bookingApi';
import { paymentApi } from './api/paymentApi';
import { reviewApi } from './api/reviewApi';
import { userApi } from './api/userApi';
import { adminApi } from './api/adminApi';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // RTK Query reducers
    [roomApi.reducerPath]: roomApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [paymentApi.reducerPath]: paymentApi.reducer,
    [reviewApi.reducerPath]: reviewApi.reducer,
    [userApi.reducerPath]: userApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      roomApi.middleware,
      bookingApi.middleware,
      paymentApi.middleware,
      reviewApi.middleware,
      userApi.middleware,
      adminApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
