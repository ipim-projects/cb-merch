import React, { useState } from 'react';
import { Avatar, Chip, Section } from '@xelene/tgui';
import { isNil, reject } from 'ramda';

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

  const getWarningMessages = () => {
    if (colorOptions.length > 0 && !selectedColorOption) return 'Цвет не выбран';
    if (sizeOptions.length > 0 && !selectedSizeOption) return 'Размер не выбран';
    const opts = reject(isNil, [selectedColorOption, selectedSizeOption]);
    if (!getVariant(variants, opts)) return 'Выбранный вариант недоступен';
    return null;
  }

  return (
    <Section footer={getWarningMessages()}>
      <div
        style={{
          display: 'flex',
          gap: 16
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
      <div
        style={{
          display: 'flex',
          gap: 16
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
  )
}

export default Options;
