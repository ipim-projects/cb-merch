import { User } from './user.ts';
import { Batch, Product, ProductOption } from './products.ts';
import { DeliveryAddress } from './delivery.ts';

export type OrderStatusType = 'new' | 'canceled' | 'partialPaid' | 'paid' | 'inProcess' | 'produced' | 'sentToBuyer' | 'deliveredToBuyer';

export const OrderStatus: Record<OrderStatusType, string> = {
  new: 'Новый',
  canceled: 'Отменён',
  partialPaid: 'Оплачен частично',
  paid: 'Оплачен',
  inProcess: 'В производстве',
  produced: 'Произведён',
  sentToBuyer: 'Отправлен',
  deliveredToBuyer: 'Доставлен',
}

export interface OrderBaseInfo {
  code: string,
  sourceCode: string,
  user: User,
  status: OrderStatusType,
  rejectReason: string,
  createdAtUtc: string,
}

export interface OrderItem {
  batch: Batch,
  product: Product,
  selectedOptions: ProductOption[],
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

export type Order = OrderBaseInfo & { items: OrderItem[] } & OrderPayment & OrderDelivery;

export interface BuyerInfo {
  buyerName: string,
  buyerPhone: string,
  buyerEmail: string,
  comment?: string,
}

export interface Payment {
  orderCode: string,
  totalPrice: number,
  paymentUrl: string,
  paymentSystemCode: string
}

