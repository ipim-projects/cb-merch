import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { ListRequestQueryArg, ListResponse } from '../types/common.ts';
import { Product, ProductDetails } from '../types/products.ts';
import { ShoppingCartDetails, ShoppingCartInfo } from '../types/cart.ts';

const baseQuery = fetchBaseQuery({
  baseUrl: 'https://test.store4merch.ru/api/v1/',
  // baseUrl: 'https://185.251.90.50/api/v1/',
  prepareHeaders: (headers) => {
    if (window.Telegram?.WebApp?.initData) {
      // headers.set('Authorization', `tgm ${window.Telegram.WebApp.initData}`)
      const initData = 'user=%7B%22id%22%3A1%2C%22first_name%22%3Anull%2C%22last_name%22%3Anull%2C%22username%22%3A%221%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%7D ' +
        '&chat_instance=-3788475317572404878 ' +
        '&chat_type=private ' +
        '&auth_date=1744722938 ' +
        '&hash=3345d39cdbd768365ba9158adfd6280e67aa94e1c16cb9a84006ce93664e7910';
      headers.set('Authorization', `tgm ${initData}`)
    } else {
      // для тестирования в браузере
      const initData = 'user=%7B%22id%22%3A1%2C%22first_name%22%3Anull%2C%22last_name%22%3Anull%2C%22username%22%3A%221%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%7D ' +
        '&chat_instance=-3788475317572404878 ' +
        '&chat_type=private ' +
        '&auth_date=1744722938 ' +
        '&hash=3345d39cdbd768365ba9158adfd6280e67aa94e1c16cb9a84006ce93664e7910';
      headers.set('Authorization', `tgm ${initData}`)
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  endpoints: (builder) => ({
    // Products
    listProducts: builder.query<ListResponse<Product>, ListRequestQueryArg>({
      query: ({
                pageIndex = 1,
                pageSize = 30,
                name
              }) => `product/list?pageIndex=${pageIndex}&pageSize=${pageSize}${name ? '&name=' + name : ''}`,
    }),
    getProductImage: builder.query<string, string>({
      query: fileCode => ({
        url: `product/image/${fileCode}`,
        responseHandler: response => new Promise(async callback => {
          const reader = new FileReader();
          reader.onload = function () {
            callback(this.result)
          };
          reader.readAsDataURL(await response.blob());
        }),
      }),
    }),
    getProduct: builder.query<ProductDetails, string>({
      query: code => `product/${code}`
    }),
    // Shopping cart
    getShoppingCartInfo: builder.query<ShoppingCartInfo, void>({
      query: () => 'basket/info'
    }),
    getShoppingCart: builder.query<ShoppingCartDetails, void>({
      query: () => 'basket'
    }),
    addItemToCart: builder.mutation<void, string>({
      query: productVariantCode => ({
        url: `basket/add?productVariantCode=${productVariantCode}`,
        method: 'POST',
      })
    }),
    removeItemFromCart: builder.mutation<void, string>({
      query: productVariantCode => ({
        url: `basket/remove?productVariantCode=${productVariantCode}`,
        method: 'POST',
      })
    }),
  }),
});

export const {
  useListProductsQuery,
  useLazyGetProductImageQuery,
  useGetProductImageQuery,
  useGetProductQuery,
  useGetShoppingCartInfoQuery,
  useGetShoppingCartQuery,
  useAddItemToCartMutation,
  useRemoveItemFromCartMutation,
} = api;