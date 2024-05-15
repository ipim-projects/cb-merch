import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Cell, Chip, Headline, IconButton, Info, List, Section, Snackbar } from '@xelene/tgui';
import { isEmpty } from 'ramda';
import { MainButton } from '@vkruglikov/react-telegram-web-app';
import { Icon28Archive } from '@xelene/tgui/dist/icons/28/archive';

import {
  useAddItemToCartMutation,
  useGetShoppingCartQuery,
  useRemoveItemFromCartMutation,
  useCreateOrderMutation,
  useDecreaseOneItemMutation
} from '../redux/api.ts';
import { getColorOption } from '../helpers/product.ts';
import Loading from '../components/Loading.tsx';
import { IconTrashBin } from '../icons/trash-bin.tsx';

const ShoppingCart: React.FunctionComponent = () => {
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const { data: cart, isLoading } = useGetShoppingCartQuery();
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();
  const [decreaseOneItem, { isLoading: isDecreasing }] = useDecreaseOneItemMutation();
  const [removeItemFromCart, { isLoading: isRemovingFromCart }] = useRemoveItemFromCartMutation();
  const [createOrder, { isLoading: isOrderCreating }] = useCreateOrderMutation();

  const navigate = useNavigate();

  const isTelegram = !!window.Telegram?.WebApp?.initData;
  const buttonsDisabled = isLoading
    || isAddingToCart
    || isDecreasing
    || isRemovingFromCart
    || isOrderCreating
    || (cart?.items && isEmpty(cart?.items));

  const handlePlaceOrder = async () => {
    await createOrder({
      buyerName: 'Buyer Name',
      buyerPhone: 'Phone Number',
      buyerEmail: 'Email Address',
      comment: 'Комментарий к заказу',
    });
    setIsSnackbarShown(true);
  }

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Корзина</Headline>
      {isSnackbarShown && (
        <Snackbar
          before={<Icon28Archive/>}
          description="№ такой-то от такой-то даты"
          children="Заказ сформирован"
          onClose={() => setIsSnackbarShown(false)}
          after={(
            <Snackbar.Button /*onClick={() => navigate(`/product/${item.product.code}`)}*/>
              К заказу
            </Snackbar.Button>
          )}
        />
      )}
      <List style={{ paddingBottom: '84px' }}>
        <Section>
          {cart?.items.map((item, index) => (
            <Cell
              key={index}
              subtitle={item.product.description}
              description={
                <Chip
                  mode="elevated"
                  before={
                    <Avatar
                      size={28}
                      style={{ backgroundColor: getColorOption(item.productVariant)?.value ?? '' }}
                    />
                  }
                >
                  {getColorOption(item.productVariant)?.value}
                </Chip>
              }
              onClick={() => navigate(`/product/${item.product.code}`)}
              after={
                <>
                  <Button
                    mode="outline"
                    size="s"
                    disabled={buttonsDisabled}
                    onClick={async (event) => {
                      event.stopPropagation();
                      await decreaseOneItem(item.productVariant.code);
                    }}
                  >
                    -
                  </Button>
                  <Badge type="number" large={true}>{item.count}</Badge>
                  <Button
                    mode="outline"
                    size="s"
                    disabled={buttonsDisabled}
                    onClick={async (event) => {
                      event.stopPropagation();
                      await addItemToCart(item.productVariant.code);
                    }}
                  >
                    +
                  </Button>
                  <IconButton
                    style={{ marginLeft: '16px' }}
                    mode="outline"
                    size="s"
                    disabled={buttonsDisabled}
                    onClick={async (event) => {
                      event.stopPropagation();
                      await removeItemFromCart(item.productVariant.code);
                    }}
                  >
                    <IconTrashBin/>
                  </IconButton>
                </>
              }
            >
              {item.product.name}
            </Cell>
          ))}
        </Section>
        <Section>
          <Info type="text">
            Итого: {cart?.totalPrice} ₽
          </Info>
          {isTelegram ?
            <MainButton
              text={'Оформить заказ'}
              disabled={buttonsDisabled}
              onClick={handlePlaceOrder}
            /> :
            <Button disabled={buttonsDisabled} onClick={handlePlaceOrder}>
              Оформить заказ
            </Button>
          }
        </Section>
      </List>
    </>
  )
}

export default ShoppingCart;
