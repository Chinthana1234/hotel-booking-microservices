import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_BASE = 'http://localhost:5000';

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  endpoints: (builder) => ({
    // POST /api/users/login
    login: builder.mutation<{ token: string }, { email: string; password: string }>({
      query: (body) => ({ url: '/api/users/login', method: 'POST', body }),
    }),
    // POST /api/users/register
    register: builder.mutation<{ token: string }, { name: string; email: string; password: string }>({
      query: (body) => ({ url: '/api/users/register', method: 'POST', body }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation } = userApi;
