import React, { useState } from 'react';
import { Avatar, Chip, Section } from '@xelene/tgui';
import { ProductOption } from '../types/products.ts';

interface OptionsProps {
  options: ProductOption[];
  selectedColor?: string;
  onColorSelect: (code: string) => void;
}

// TODO: значение цвета не приходит с бэка, делаем костыль
const getRealColorValue = (rusColor: string) => {
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
      return 'grey';
  }
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
