import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE = 'http://localhost:5000';

export const reviewApi = createApi({
  reducerPath: 'reviewApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),
  tagTypes: ['Review'],
  endpoints: (builder) => ({
    // GET /api/reviews/:roomId — reviews for a room
    getReviewsByRoom: builder.query<any[], string>({
      query: (roomId) => `/api/reviews/${roomId}`,
      providesTags: ['Review'],
    }),
    // POST /api/reviews — submit review
    submitReview: builder.mutation<any, { roomId: string; rating: number; comment: string }>({
      query: (body) => ({ url: '/api/reviews', method: 'POST', body }),
      invalidatesTags: ['Review'],
    }),
  }),
});

export const { useGetReviewsByRoomQuery, useSubmitReviewMutation } = reviewApi;
