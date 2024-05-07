import { equals } from 'ramda';

import { ProductOption, ProductVariant } from '../types/products.ts';

/*export const getVariant = (variants: ProductVariant[], options: ProductOption[]): ProductVariant | undefined => {
  const optCodes = options.map(option => option.code);
  return variants.find(variant => equals(variant.options.map(option => option.code), optCodes));
}*/
export const getVariant = (variants: ProductVariant[], optionCodes: string[]): ProductVariant | undefined =>
  variants.find(variant => equals(variant.productOptions.map(option => option.code), optionCodes));

// TODO: значение цвета не приходит с бэка, делаем костыль
export const getRealColorValue = (rusColor: string) => {
  switch (rusColor) {
    case 'белый':
      return 'white';
    case 'жёлтый':
      return 'yellow';
    case 'красный':
      return 'red';
    case 'зелёный':
      return 'green';
    default:
      return 'gray';
  }
}

export const getColorOption = (variant: ProductVariant): ProductOption | undefined =>
  variant.productOptions.find(option => option.type === 'color');
