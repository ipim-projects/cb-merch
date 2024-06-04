import { ascend, compose, isEmpty, prop, sort, symmetricDifference } from 'ramda';
import { Avatar, Chip } from '@xelene/tgui';

import { ProductOption, ProductVariant } from '../types/products.ts';

const equalIgnoreOrder = compose(isEmpty, symmetricDifference);

export const getVariant = (variants: ProductVariant[], optionCodes: string[]): ProductVariant | undefined =>
  variants.find(variant => equalIgnoreOrder(variant.productOptions.map(option => option.code), optionCodes));

export const productOptionsChips = (options: ProductOption[]) => {
  if (isEmpty(options)) return null;
  const optionChips = sort(ascend(prop('type')), options).map((option, index) => {
    if (option.type === 'color') return <Chip
      key={index}
      mode="elevated"
      before={
        <Avatar
          size={28}
          style={{ backgroundColor: option.value }}
        />
      }
    >
      {option.name}
    </Chip>;
    if (option.type === 'size') return <Chip
      key={index}
      mode="elevated"
    >
      {option.value}
    </Chip>
  });
  if (isEmpty(optionChips)) return null;
  return (
    <div
      style={{
        display: 'flex',
        gap: 16
      }}
    >
      {optionChips}
    </div>
  );
}
