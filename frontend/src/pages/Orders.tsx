import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Headline, Info, Section } from '@telegram-apps/telegram-ui';

import { useListOrdersQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { OrderStatus, OrderStatusType } from '../types/orders.ts';


const Orders: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { data: orders, isLoading } = useListOrdersQuery({});

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Мои заказы</Headline>
      <Section style={{ paddingBottom: '84px' }}>
        {orders?.items && orders.items.map((order, index) => (
          <Cell
            key={index}
            // subtitle={product.description}
            after={<Info type="text">{OrderStatus[order.status as OrderStatusType]}</Info>}
            onClick={() => navigate(`/order/${order.code}`)}
          >
            Заказ № {order.sourceCode} от {new Date(order.createdAtUtc).toLocaleDateString('ru-RU')}
          </Cell>
        ))}
      </Section>
    </>
  )
}

export default Orders;
