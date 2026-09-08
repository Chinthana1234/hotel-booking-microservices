import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE = 'http://localhost:5000';

export const paymentApi = createApi({
  reducerPath: 'paymentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    // POST /api/payments — process payment (now hits .NET Core service)
    processPayment: builder.mutation<any, {
      bookingId: string;
      userId: string;
      amount: number;
      paymentMethod: string;
    }>({
      query: (body) => ({ url: '/api/payments', method: 'POST', body }),
      invalidatesTags: ['Payment'],
    }),
    // GET /api/payments/booking/:bookingId
    getPaymentByBooking: builder.query<any, string>({
      query: (bookingId) => `/api/payments/booking/${bookingId}`,
    }),
    // GET /api/payments/admin/all — admin view
    getAllPayments: builder.query<any[], void>({
      query: () => '/api/payments/admin/all',
      providesTags: ['Payment'],
    }),
  }),
});

export const {
  useProcessPaymentMutation,
  useGetPaymentByBookingQuery,
  useGetAllPaymentsQuery,
} = paymentApi;
