import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { ListRequestQueryArg, ListResponse } from '../types/common.ts';
import { Product, ProductDetails } from '../types/products.ts';
import { ShoppingCartDetails, ShoppingCartInfo } from '../types/cart.ts';
import { BuyerInfo, Order, OrderBaseInfo, OrderRejectQueryArg, Payment } from '../types/orders.ts';
import {
  CheckBoxberryIndexQueryArg,
  CheckDeliveryAddressQueryArg,
  DeliveryAddress,
  DeliveryPrice,
  DeliveryType,
  WidgetDeliveryPrice
} from '../types/delivery.ts';

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
  prepareHeaders: (headers) => {
    if (window.Telegram?.WebApp?.initData) {
      console.log('initData', window.Telegram?.WebApp?.initData);
      /*const initData = 'user=%7B%22id%22%3A1%2C%22first_name%22%3Anull%2C%22last_name%22%3Anull%2C%22username%22%3A%221%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Afalse%2C%22allows_write_to_pm%22%3Atrue%7D ' +
        '&chat_instance=-3788475317572404878 ' +
        '&chat_type=private ' +
        '&auth_date=1744722938 ' +
        '&hash=3345d39cdbd768365ba9158adfd6280e67aa94e1c16cb9a84006ce93664e7910';*/
      headers.set('Authorization', `tgm ${window.Telegram.WebApp.initData}`);
      // headers.set('Authorization', `tgm ${initData}`);
    } else {
      // для тестирования в браузере
      const initData = 'query_id=AAHvN3MPAAAAAO83cw9g8AEc&user=%7B%22id%22%3A259209199%2C%22first_name%22%3A%22Ilya%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22i_pim%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1718781739&hash=9b3acdb939df7ac0978965f328f447610785def4f3ea8462acf8ba7cc370e435';
      headers.set('Authorization', `tgm ${initData}`);
    }
    return headers;
  },
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  refetchOnReconnect: true,
  tagTypes: ['Basket', 'Order'],
  endpoints: (builder) => ({
    // Products
    listProducts: builder.query<ListResponse<Product>, ListRequestQueryArg & Partial<Pick<Product, 'name'>>>({
      query: ({
                pageIndex = 1,
                pageSize = 30,
                name = ''
              }) => `product/list?pageIndex=${pageIndex}&pageSize=${pageSize}&name=${name}`,
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
      query: code => `product/${code}`,
    }),
    // Shopping cart
    getShoppingCartInfo: builder.query<ShoppingCartInfo, void>({
      query: () => 'basket/info',
      providesTags: [{ type: 'Basket', id: 'LIST' }],
    }),
    getShoppingCart: builder.query<ShoppingCartDetails, void>({
      query: () => 'basket',
      providesTags: [{ type: 'Basket', id: 'LIST' }],
    }),
    addItemToCart: builder.mutation<void, string>({
      query: productVariantCode => ({
        url: `basket/add?productVariantCode=${productVariantCode}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Basket', id: 'LIST' }],
    }),
    decreaseOneItem: builder.mutation<void, string>({
      query: productVariantCode => ({
        url: `basket/decrease?productVariantCode=${productVariantCode}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Basket', id: 'LIST' }],
    }),
    removeItemFromCart: builder.mutation<void, string>({
      query: productVariantCode => ({
        url: `basket/remove?productVariantCode=${productVariantCode}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Basket', id: 'LIST' }],
    }),
    // Delivery
    checkAddress: builder.query<DeliveryAddress, CheckDeliveryAddressQueryArg>({
      query: ({ deliveryType, address }) =>
        `delivery/pochtaru/check/address?deliveryType=${deliveryType}&address=${address}`,
    }),
    saveAddress: builder.query<DeliveryAddress, Omit<DeliveryAddress, 'code'>>({
      query: address => ({
        url: 'delivery/address/save',
        method: 'POST',
        body: address
      }),
    }),
    saveWidgetAddress: builder.query<void, WidgetDeliveryPrice>({
      query: addressPrice => ({
        url: 'delivery/widget/save',
        method: 'POST',
        body: addressPrice
      }),
    }),
    getDeliveryPrice: builder.query<DeliveryPrice, string>({
      query: addressCode => ({
        url: `delivery/price?addressCode=${addressCode}`,
        method: 'POST',
      }),
    }),
    checkBoxberryIndex: builder.query<Omit<DeliveryAddress, 'address' | 'pvzCode' | 'pvzName'>, CheckBoxberryIndexQueryArg>({
      query: ({ deliveryType = DeliveryType.BOXBERRY_COURIER, zipCode }) =>
        `delivery/boxberry/index?deliveryType=${deliveryType}&zipCode=${zipCode}`,
    }),
    // Orders
    listOrders: builder.query<ListResponse<OrderBaseInfo>, ListRequestQueryArg>({
      query: ({ pageIndex = 1, pageSize = 30 }) =>
        `order/list?pageIndex=${pageIndex}&pageSize=${pageSize}`,
      providesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    createOrder: builder.mutation<Order, BuyerInfo>({
      query: buyerInfo => ({
        url: 'order',
        method: 'POST',
        body: buyerInfo,
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, { type: 'Basket', id: 'LIST' }],
    }),
    getOrder: builder.query<Order, string>({
      query: code => `order/${code}`,
    }),
    getPayment: builder.query<Payment, string>({
      query: orderCode => ({
        url: `payment/request?orderCode=${orderCode}`,
        method: 'POST',
      }),
    }),
    rejectOrder: builder.mutation<void, OrderRejectQueryArg>({
      query: orderRejectQueryArg => ({
        url: `order/reject/${orderRejectQueryArg.orderCode}`,
        method: 'PUT',
        body: { comment: orderRejectQueryArg.comment },
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
  }),
});

export const {
  useListProductsQuery,
  // useLazyGetProductImageQuery,
  useGetProductImageQuery,
  useGetProductQuery,
  useGetShoppingCartInfoQuery,
  useGetShoppingCartQuery,
  useAddItemToCartMutation,
  useDecreaseOneItemMutation,
  useRemoveItemFromCartMutation,
  useLazyCheckAddressQuery,
  useLazyGetDeliveryPriceQuery,
  useLazySaveAddressQuery,
  useLazySaveWidgetAddressQuery,
  useLazyCheckBoxberryIndexQuery,
  useListOrdersQuery,
  useCreateOrderMutation,
  useGetOrderQuery,
  useGetPaymentQuery,
  useRejectOrderMutation,
} = api;
