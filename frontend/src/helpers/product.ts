import { equals } from 'ramda';

import { ProductVariant } from '../types/products.ts';

export const getVariant = (variants: ProductVariant[], optionCodes: string[]): ProductVariant | undefined =>
  variants.find(variant => equals(variant.productOptions.map(option => option.code), optionCodes));
