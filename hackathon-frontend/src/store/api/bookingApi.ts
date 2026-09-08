import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE = 'http://localhost:5000';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Booking'],
  endpoints: (builder) => ({
    // GET /api/bookings/user/:userId — user's own bookings
    getUserBookings: builder.query<any[], string>({
      query: (userId) => `/api/bookings/user/${userId}`,
      providesTags: ['Booking'],
    }),
    // GET /api/bookings/admin/all — all bookings (admin)
    getAllBookings: builder.query<any[], void>({
      query: () => '/api/bookings/admin/all',
      providesTags: ['Booking'],
    }),
    // POST /api/bookings — create booking
    createBooking: builder.mutation<any, any>({
      query: (body) => ({ url: '/api/bookings', method: 'POST', body }),
      invalidatesTags: ['Booking'],
    }),
    // DELETE /api/bookings/:id — cancel booking
    cancelBooking: builder.mutation<any, string>({
      query: (id) => ({ url: `/api/bookings/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Booking'],
    }),
  }),
});

export const {
  useGetUserBookingsQuery,
  useGetAllBookingsQuery,
  useCreateBookingMutation,
  useCancelBookingMutation,
} = bookingApi;
