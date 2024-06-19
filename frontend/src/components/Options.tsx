import React, { useState } from 'react';
import { Avatar, Chip, List, Section } from '@telegram-apps/telegram-ui';
import { isEmpty, isNil, reject } from 'ramda';

import { ProductOption, ProductVariant } from '../types/products.ts';
import { getVariant } from '../helpers/product.tsx';

interface OptionsProps {
  options: ProductOption[];
  variants: ProductVariant[];
  onOptionSelect: (variant: ProductVariant | undefined) => void;
}

const Options: React.FunctionComponent<OptionsProps> = ({
                                                          options,
                                                          variants,
                                                          onOptionSelect
                                                        }) => {
  const [selectedColorOption, setSelectedColorOption] = useState<string>();
  const [selectedSizeOption, setSelectedSizeOption] = useState<string>();

  const colorOptions = options.filter(option => option.type === 'color');
  const sizeOptions = options.filter(option => option.type === 'size');

  const getWarningMessages = (section: 'color' | 'size') => {
    const isColorNotSelected = colorOptions.length > 0 && !selectedColorOption;
    const isSizeNotSelected = sizeOptions.length > 0 && !selectedSizeOption;
    if (section === 'color' && isColorNotSelected) return 'Цвет не выбран';
    if (section === 'size' && isSizeNotSelected) return 'Размер не выбран';
    const opts = reject(isNil, [selectedColorOption, selectedSizeOption]);
    if (!getVariant(variants, opts) && isEmpty(sizeOptions) && section === 'color') {
      return 'Выбранный вариант недоступен';
    }
    if (!getVariant(variants, opts) && section === 'size' && !isColorNotSelected) {
      return 'Выбранный вариант недоступен';
    }
    return null;
  }

  return (
    <List>
      {colorOptions.length > 0 && <Section header="Цвет" footer={getWarningMessages('color')}>
        <div
          style={{
            display: 'flex',
            gap: 8
          }}
        >
          {colorOptions.map((option, index) => (
            <Chip
              key={index}
              mode={option.code === selectedColorOption ? 'mono' : 'elevated'}
              before={
                <Avatar
                  size={28}
                  style={{ backgroundColor: option.value }}
                />
              }
              onClick={() => {
                setSelectedColorOption(option.code);
                const opts = reject(isNil, [option.code, selectedSizeOption]);
                onOptionSelect(getVariant(variants, opts));
              }}
            >
              {option.name}
            </Chip>
          ))}
        </div>
      </Section>
      }
      {sizeOptions.length > 0 && <Section header="Размер" footer={getWarningMessages('size')}>
        <div
          style={{
            display: 'flex',
            gap: 8
          }}
        >
          {sizeOptions.map((option, index) => (
            <Chip
              key={index}
              mode={option.code === selectedSizeOption ? 'mono' : 'elevated'}
              onClick={() => {
                setSelectedSizeOption(option.code);
                const opts = reject(isNil, [selectedColorOption, option.code]);
                onOptionSelect(getVariant(variants, opts));
              }}
            >
              {option.value}
            </Chip>
          ))}
        </div>
      </Section>
      }
    </List>
  )
}

export default Options;
