export interface Product {
  code: string,
  name: string,
  description: string,
  // TODO: добавить категорию
  smallFile: {
    content: string,
    code: string,
    name: string,
    mimeType: string,
    isMain: boolean,
  },
  price: number,
  units: string,
}

export interface ProductDetails {
  code: string,
  name: string,
  description: string,
  fullDescription: string,
  files: [
    {
      code: string,
      name: string,
      mimeType: string,
      isMain: boolean,
    }
  ],
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
  sourceCode: string,
  productOptions: ProductOption[],
  price:	number,
  weight:	number,
}
