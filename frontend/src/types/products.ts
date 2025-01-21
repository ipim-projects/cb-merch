export interface ProductFile {
  code: string,
  name: string,
  mimeType: string,
  isMain: boolean,
}

export interface ProductImage extends ProductFile {
  content: string,
}

export interface Product {
  code: string,
  storeCode: string,
  name: string,
  description: string,
  // TODO: добавить категорию
  smallFile: ProductImage,
  price: number,
  units: string,
}

export interface ProductDetails {
  code: string,
  name: string,
  description: string,
  fullDescription: string,
  files: ProductFile[],
  options: ProductOption[],
  variants: ProductVariant[],
  price: number,
  units: string,
}

export interface ProductOption {
  code: string,
  name: string,
  type: 'color' | 'size',
  value: string,
}

export interface ProductVariant {
  code: string,
  currentBatch: Batch,
  sourceCode: string,
  productOptions: ProductOption[],
  price: number,
  weight:	number,
}

export type BatchStatusType = 'new' | 'inProcess' | 'completed' | 'canceled';

export const BatchStatus: Record<BatchStatusType, string> = {
  new: 'Новая',
  inProcess: 'В производстве',
  completed: 'Произведена',
  canceled: 'Отменена',
}

export interface Batch {
  code: string,
  sourceCode: string,
  name: string,
  batchSize: number,
  batchStatus: BatchStatusType,
  totalCount: number,
  totalCountPaid: number,
}
