import React from 'react';
import { Cell, Headline, Info, Section } from '@xelene/tgui';

import { useListOrdersQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';

const Orders: React.FunctionComponent = () => {
  const { data: orders, isLoading } = useListOrdersQuery({});

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Мои заказы</Headline>
      <Section style={{ paddingBottom: '84px' }}>
        {orders?.items.map((order, index) => (
          <Cell
            key={index}
            // subtitle={product.description}
            after={<Info type="text">Статус {order.status}</Info>}
            // onClick={() => navigate(`/product/${product.code}`)}
          >
            Код заказа {order.code} от какой-то даты
          </Cell>
        ))}
      </Section>
    </>
  )
}

export default Orders;
