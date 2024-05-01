import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Product } from '../types/products.ts';
import { ListRequestQueryArg, ListResponse } from "../types/common.ts";

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://test.store4merch.ru/api/v1/',
  prepareHeaders: (headers) => {
    if (window.Telegram?.WebApp?.initData) {
      // headers.set('Authorization', `tgm ${window.Telegram.WebApp.initData}`)
      const initData = 'user=%7B%22id%22%3A2%2C%22first_name%22%3Anull%2C%22last_name%22%3Anull%2C%22username%22%3A%222%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%7D &chat_instance=-3788475317572404878 &chat_type=private &auth_date=1744722938 &hash=4725348357fdc4a8cd514b61cf6aa456a5915a28d203469c77b5a814da30de74';
      headers.set('Authorization', `tgm ${initData}`)
    } else {
      // для тестирования в браузере
      const initData = 'user=%7B%22id%22%3A2%2C%22first_name%22%3Anull%2C%22last_name%22%3Anull%2C%22username%22%3A%222%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%7D &chat_instance=-3788475317572404878 &chat_type=private &auth_date=1744722938 &hash=4725348357fdc4a8cd514b61cf6aa456a5915a28d203469c77b5a814da30de74';
      headers.set('Authorization', `tgm ${initData}`)
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    listProducts: builder.query<ListResponse<Product>, ListRequestQueryArg>({
      query: ({
                pageIndex = 1,
                pageSize = 30,
                name
              }) => `product/list?pageIndex=${pageIndex}&pageSize=${pageSize}${name ? '&name=' + name : ''}`,
    }),
  }),
});

export const { useListProductsQuery } = api;
