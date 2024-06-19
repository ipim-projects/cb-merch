import { ascend, compose, isEmpty, prop, sort, symmetricDifference } from 'ramda';
import { Avatar, Chip } from '@telegram-apps/telegram-ui';

import { ProductOption, ProductVariant } from '../types/products.ts';

import styles from './product.module.css';

const equalIgnoreOrder = compose(isEmpty, symmetricDifference);

export const getVariant = (variants: ProductVariant[], optionCodes: string[]): ProductVariant | undefined =>
  variants.find(variant => equalIgnoreOrder(variant.productOptions.map(option => option.code), optionCodes));

export const productOptionsChips = (options: ProductOption[]) => {
  if (isEmpty(options)) return null;
  const optionChips = sort(ascend(prop('type')), options).map((option, index) => {
    if (option.type === 'color') return <Chip
      className={styles.smallchip}
      key={index}
      mode="outline"
      before={
        <Avatar
          size={28}
          style={{ backgroundColor: option.value }}
        />
      }
    >
    </Chip>;
    if (option.type === 'size') return <Chip
      className={styles.smallchip}
      key={index}
      mode="outline"
    >
      {option.value}
    </Chip>
  });
  if (isEmpty(optionChips)) return null;
  return (
    <div
      style={{
        // display: 'inline-grid',
        display: 'flex',
        gap: 8
      }}
    >
      {optionChips}
    </div>
  );
}
