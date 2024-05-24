import React from 'react';
import { Cell, Headline, Info, Section } from '@xelene/tgui';

import { useListOrdersQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { OrderStatus, OrderStatusType } from '../types/orders.ts';

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
            after={<Info type="text">{OrderStatus[order.status as OrderStatusType]}</Info>}
            // onClick={() => navigate(`/product/${product.code}`)}
          >
            Заказ {order.sourceCode} от {new Date(order.createdAtUtc).toLocaleDateString('ru-RU')}
          </Cell>
        ))}
      </Section>
    </>
  )
}

export default Orders;
