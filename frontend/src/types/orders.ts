import { User } from './user.ts';
import { Product } from './products.ts';

enum DeliveryType {
  POST_PVZ = 'postPvz',
  POST_COURIER = 'postCourier',
  BOXBERRY_PVZ = 'boxberryPvz',
  BOXBERRY_COURIER = 'boxberryCourier',
}

export interface DeliveryAddress {
  country: string,
  region?: string,
  area?: string,
  city: string,
  address: string,
  zipCode: string,
  pvzCode?: string,
  pvzName?: string,
  deliveryType: DeliveryType,
  code: string,
}

export interface OrderBaseInfo {
  code: string,
  sourceCode: string,
  user: User,
  status: string,
  rejectReason: string,
}

export interface OrderItem {
  // batch: Batch,
  product: Product,
  count: number,
  price: number,
}

export interface OrderPayment {
  totalPrice: number,
  paid: number,
}

export interface OrderDelivery {
  deliveryPrice: number,
  deliveryAddress: DeliveryAddress,
  deliveryTrackNumber: string,
}

export type Order = OrderBaseInfo & OrderItem[] & OrderPayment & OrderDelivery;

export interface BuyerInfo {
  buyerName: string,
  buyerPhone: string,
  buyerEmail: string,
  comment: string,
}
