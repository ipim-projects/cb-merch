export interface Product {
  code: string,
  name: string,
  description: string,
  mainFile: {
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
  type: 'color' | 'size',
  value: string,
}

export interface ProductVariant {
  code: string,
  productOptions: ProductOption[],
  price:	number,
  weight:	number,
}
