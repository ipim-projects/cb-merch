import React from 'react';
import { Avatar, Chip } from '@xelene/tgui';

import { ProductOption } from '../types/products.ts';
import { getRealColorValue } from '../helpers/product.ts';

interface OptionsProps {
  options: ProductOption[];
  selectedColor?: string;
  onColorSelect: (code: string) => void;
}

const Options: React.FunctionComponent<OptionsProps> = ({ options, selectedColor, onColorSelect }) => {
  const colorOptions = options.filter(option => option.type === 'color');

  return (
    <div
      style={{
        display: 'flex',
        gap: 16
      }}
    >
      {colorOptions.map((option, index) => (
        <Chip
          key={index}
          mode={option.code === selectedColor ? 'mono' : 'elevated'}
          before={
            <Avatar
              size={28}
              style={{ backgroundColor: getRealColorValue(option.value) }}
            />
          }
          onClick={() => onColorSelect(option.code)}
        >
          {option.value}
        </Chip>
      ))}
    </div>
  )
}

export default Options;
