import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Headline, Info, Pagination, Section } from '@telegram-apps/telegram-ui';

import { PAGE_SIZE_DEFAULT, useListOrdersQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { OrderStatus, OrderStatusType } from '../types/orders.ts';

const Orders: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);

  // обновляем каждые 5 секунд, т.к. после оплаты нет колбэка
  const { data: orders, isLoading } = useListOrdersQuery({ pageIndex: currentPage }, { pollingInterval: 5000 });

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
        {!!orders && (orders.totalCount ?? 0) > 25 && <Section.Footer centered>
          <Pagination
            count={Math.ceil(orders.totalCount / PAGE_SIZE_DEFAULT)}
            onChange={(_, page: number) => {
              setCurrentPage(page);
            }}
          />
        </Section.Footer>
        }
      </Section>
    </>
  )
}

export default Orders;
