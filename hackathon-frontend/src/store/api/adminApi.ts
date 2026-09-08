import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE = 'http://localhost:5000';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Admin'],
  endpoints: (builder) => ({
    // GET /api/admin/dashboard — aggregated stats from FastAPI admin-service
    getDashboard: builder.query<any, void>({
      query: () => '/api/admin/dashboard',
      providesTags: ['Admin'],
    }),
    // GET /api/admin/users
    getAdminUsers: builder.query<any[], void>({
      query: () => '/api/admin/users',
    }),
    // PUT /api/admin/users/:userId/promote
    promoteUser: builder.mutation<any, string>({
      query: (userId) => ({ url: `/api/admin/users/${userId}/promote`, method: 'PUT' }),
    }),
    // GET /api/admin/bookings — all bookings with user details
    getAdminBookings: builder.query<any[], void>({
      query: () => '/api/admin/bookings',
      providesTags: ['Admin'],
    }),
    // DELETE /api/admin/bookings/:bookingId
    deleteAdminBooking: builder.mutation<any, string>({
      query: (id) => ({ url: `/api/admin/bookings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  usePromoteUserMutation,
  useGetAdminBookingsQuery,
  useDeleteAdminBookingMutation,
} = adminApi;
