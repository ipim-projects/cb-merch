import { equals } from 'ramda';

import { ProductOption, ProductVariant } from '../types/products.ts';

/*export const getVariant = (variants: ProductVariant[], options: ProductOption[]): ProductVariant | undefined => {
  const optCodes = options.map(option => option.code);
  return variants.find(variant => equals(variant.productOptions.map(option => option.code), optCodes));
}*/
export const getVariant = (variants: ProductVariant[], optionCodes: string[]): ProductVariant | undefined =>
  variants.find(variant => equals(variant.productOptions.map(option => option.code), optionCodes));

export const getColorOption = (variant: ProductVariant): ProductOption | undefined =>
  variant.productOptions.find(option => option.type === 'color');
