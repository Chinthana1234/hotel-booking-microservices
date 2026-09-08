import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = 'http://localhost:5000';

export const roomApi = createApi({
  reducerPath: 'roomApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  tagTypes: ['Room'],
  endpoints: (builder) => ({
    // GET /api/rooms — all rooms
    getRooms: builder.query<any[], void>({
      query: () => '/api/rooms',
      providesTags: ['Room'],
    }),
    // GET /api/rooms/:id — single room
    getRoomById: builder.query<any, string>({
      query: (id) => `/api/rooms/${id}`,
    }),
    // GET /api/bookings/available-rooms?checkIn=&checkOut= — available rooms by date
    getAvailableRooms: builder.query<any[], { checkIn: string; checkOut: string }>({
      query: ({ checkIn, checkOut }) =>
        `/api/bookings/available-rooms?checkIn=${checkIn}&checkOut=${checkOut}`,
    }),
  }),
});

export const { useGetRoomsQuery, useGetRoomByIdQuery, useGetAvailableRoomsQuery } = roomApi;
