import { User } from './user.ts';
import { Product } from './products.ts';
import { DeliveryAddress } from './delivery.ts';

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
  comment?: string,
}
