import { Product, ProductVariant } from '../types/products.ts';

export interface ShoppingCartItem {
  product: Product,
  productVariant: ProductVariant,
  count: number,
}

export interface ShoppingCartDetails {
  totalPrice: number,
  totalWeight: number,
  items: ShoppingCartItem[],
}

export interface ShoppingCartInfo {
  productsCount: number,
}