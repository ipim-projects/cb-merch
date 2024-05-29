import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Cell, Info, List, Placeholder, Section } from '@xelene/tgui';
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app';

import { useGetOrderQuery, useGetPaymentQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { productOptionsChips } from '../helpers/product.tsx';
import { deliveryAddressToString } from '../helpers/delivery.ts';
import { DeliveryOptions } from '../types/delivery.ts';
import { OrderStatus, OrderStatusType } from "../types/orders.ts";

const OrderInfo: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const { data: order, isLoading } = useGetOrderQuery(orderCode!);
  const { data: payment } = useGetPaymentQuery(orderCode!);

  const isTelegram = !!window.Telegram?.WebApp?.initData;

  if (isLoading || !order) return (
    <Loading/>
  );

  /*const paymentCallback = (url: string, status: "paid" | "cancelled" | "failed" | "pending") => {
    console.log('paymentCallback', url, status);
  }*/

  return (
    <>
      {isTelegram && <BackButton onClick={() => navigate(-1)}/>}
      <Placeholder
        header={`Заказ № ${order.sourceCode} от ${new Date(order.createdAtUtc).toLocaleDateString('ru-RU')}`}
        description={OrderStatus[order.status as OrderStatusType]}
      >
      </Placeholder>
      <List>
        <Section>
          {order.items.map((item, index) => (
            <Cell
              key={index}
              subtitle={item.product.description}
              description={productOptionsChips(item.selectedOptions)}
              onClick={() => navigate(`/product/${item.product.code}`)}
              after={
                <>
                  <Info type="text" style={{ marginRight: '16px' }}>
                    {item.price * item.count} ₽
                  </Info>
                  <Badge type="number" large={true}>{item.count}</Badge>
                </>
              }
            >
              {item.product.name}
            </Cell>
          ))}
        </Section>
        <Section header="Доставка и получение">
          <Info type="text">
            Способ доставки: {DeliveryOptions.find(opt => opt.value === order.deliveryAddress.deliveryType)?.label}
          </Info>
          <Info type="text">
            Адрес: {deliveryAddressToString(order.deliveryAddress)}
          </Info>
          <Info type="text">
            Стоимость доставки: {order.deliveryPrice ?? 0} ₽
          </Info>
          <Info type="text">
            Итого: {order.totalPrice ?? 0} ₽
          </Info>
        </Section>
        {(order.status === 'new' || order.status === 'partialPaid') && payment?.paymentUrl && <Section>
          {isTelegram ?
            <MainButton
              text={'Перейти к оплате'}
              onClick={() => window.Telegram?.WebApp?.openLink(payment.paymentUrl, { try_instant_view: true })}
            /> :
            <Button
              Component="a"
              href={payment.paymentUrl}
            >
              Перейти к оплате
            </Button>
          }
        </Section>
        }
      </List>
    </>
  )
}

export default OrderInfo;
