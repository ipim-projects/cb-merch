import { Product, ProductVariant } from './products.ts';
import { DeliveryPrice } from './delivery.ts';

export interface ShoppingCartItem {
  product: Product,
  productVariant: ProductVariant,
  count: number,
}

export interface ShoppingCartDetails {
  delivery: DeliveryPrice,
  totalPrice: number,
  totalWeight: number,
  items: ShoppingCartItem[],
}

export interface ShoppingCartInfo {
  productsCount: number,
}
