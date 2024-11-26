import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import { ListRequestQueryArg, ListResponse, StoreInfo } from '../types/common.ts';
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
import { User } from '../types/user.ts';

export const PAGE_SIZE_DEFAULT = 25;

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_BACKEND_BASE_URL,
  prepareHeaders: (headers) => {
    if (window.Telegram?.WebApp?.initData) {
      console.log('initData', window.Telegram?.WebApp?.initData);
      headers.set('Authorization', `tgm ${window.Telegram.WebApp.initData}`);
    } else {
      // для тестирования в браузере
      const initData = 'query_id=AAHvN3MPAAAAAO83cw9Nf3a2&user=%7B%22id%22%3A259209199%2C%22first_name%22%3A%22Ilya%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22i_pim%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FZN-fIE-YFmtpT9QHHolMfEPQsgK1Nc-UJWBUuzb72A0.svg%22%7D&auth_date=1732608563&signature=61FA2CcOu4pICzjkkgc9Mu0a78XcrYeUAFw1xeYTnzReqF3p_pLVdaj-PhBmoL0HYibLDJPbAHFwJOBwdlWKAA&hash=6726701699f09f14d6c8ce1bbe36ee588c751e4d5f467e8d61799705cf3ca6b0';
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
    listProducts: builder.query<ListResponse<Product>, ListRequestQueryArg & Partial<Pick<Product, 'name' | 'storeCode'>>>({
      query: ({
                pageIndex = 1,
                pageSize = PAGE_SIZE_DEFAULT,
                name = '',
                storeCode = '',
              }) => `product/list?pageIndex=${pageIndex}&pageSize=${pageSize}&name=${name}&storeCode=${storeCode}`,
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
      query: ({ pageIndex = 1, pageSize = PAGE_SIZE_DEFAULT }) =>
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
        method: 'POST',
        body: { comment: orderRejectQueryArg.comment },
      }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }],
    }),
    // Stores
    listStores: builder.query<StoreInfo[], void>({
      query: () => 'store/list',
    }),
    // User
    getCurrentUser: builder.query<User, void>({
      query: () => 'user/current',
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
  useListStoresQuery,
  useGetCurrentUserQuery,
} = api;
