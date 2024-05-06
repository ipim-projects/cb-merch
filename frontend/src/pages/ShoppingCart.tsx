import React from 'react';
import { Badge, Cell, Headline, Image, List, Section, Spinner } from '@xelene/tgui';

import { useGetShoppingCartQuery } from '../redux/api.ts';

const ShoppingCart: React.FunctionComponent = () => {
  const { data: cart } = useGetShoppingCartQuery();

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Корзина</Headline>
      <Section style={{ paddingBottom: '84px' }}>
        {cart?.items.map((item, index) => (
          <Cell
            key={index}
            after={<Badge type="number">{item.count}</Badge>}
          >
            {item.product.name}
          </Cell>
        ))}
      </Section>
    </>
  )
}

export default ShoppingCart;
