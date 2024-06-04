import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Cell, Info, List, Modal, Placeholder, Section, Textarea } from '@xelene/tgui';
import { ModalHeader } from '@xelene/tgui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { Icon28Close } from '@xelene/tgui/dist/icons/28/close';
import { ModalClose } from '@xelene/tgui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app';

import { useGetOrderQuery, useGetPaymentQuery, useRejectOrderMutation } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { productOptionsChips } from '../helpers/product.tsx';
import { deliveryAddressToString } from '../helpers/delivery.ts';
import { DeliveryOptions } from '../types/delivery.ts';
import { OrderStatus, OrderStatusType } from '../types/orders.ts';

const OrderInfo: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { orderCode } = useParams();
  const [comment, setComment] = useState('');
  /*const [isModalOpen, setIsModalOpen] = useState(false);*/
  // обновляем каждые 5 секунд, т.к. после оплаты нет колбэка, а пользователь остаётся на странице заказа
  const { data: order, isLoading } = useGetOrderQuery(orderCode!, { pollingInterval: 5000 },);
  const { data: payment } = useGetPaymentQuery(orderCode!);
  const [rejectOrder, { isLoading: isOrderRejecting }] = useRejectOrderMutation();

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
      {order.status === 'new' && <Modal
        header={<ModalHeader
          after={<ModalClose><Icon28Close style={{ color: 'var(--tgui--plain_foreground)' }}/></ModalClose>}
        >
          Отмена заказа
        </ModalHeader>}
        trigger={<Button mode="gray" size="s" stretched disabled={isOrderRejecting}>Отменить заказ</Button>}
        /*onOpenChange={setIsModalOpen}*/
      >
        <Textarea
          header='Комментарий'
          placeholder='Укажите причину отмены заказа'
          value={comment}
          onChange={event => setComment(event.target.value)}
        />
        <Placeholder
          description="Вы уверены, что хотите отменить заказ?"
          action={<Button
            size="s"
            stretched
            disabled={isOrderRejecting}
            onClick={() => rejectOrder({orderCode: order.code, comment: comment})}
          >Подтвердить
          </Button>}
        >
        </Placeholder>
      </Modal>
      }
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
