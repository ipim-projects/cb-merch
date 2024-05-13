import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Cell, Chip, Headline, Info, List, Section } from '@xelene/tgui';
import { isEmpty } from 'ramda';

import { useAddItemToCartMutation, useGetShoppingCartQuery, useRemoveItemFromCartMutation } from '../redux/api.ts';
import { getColorOption, getRealColorValue } from '../helpers/product.ts';
import Loading from '../components/Loading.tsx';
import { MainButton } from '@vkruglikov/react-telegram-web-app';

const ShoppingCart: React.FunctionComponent = () => {
  const { data: cart, isLoading } = useGetShoppingCartQuery();
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();
  const [removeItemFromCart, { isLoading: isRemovingFromCart }] = useRemoveItemFromCartMutation();

  const navigate = useNavigate();

  const isTelegram = !!window.Telegram?.WebApp?.initData;
  const placeOrderButtonDisabled = isLoading
    || isAddingToCart
    || isRemovingFromCart
    || (cart?.items && isEmpty(cart?.items));

  const handlePlaceOrder = async () => {
    // await addItemToCart(selectedVariant.code);
  }

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Корзина</Headline>
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
                      style={{ backgroundColor: getRealColorValue(getColorOption(item.productVariant)?.value ?? '') }}
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
                    disabled={isAddingToCart || isRemovingFromCart}
                    onClick={async (event) => {
                      event.stopPropagation();
                      await removeItemFromCart(item.productVariant.code);
                    }}
                  >
                    -
                  </Button>
                  <Badge type="number" large={true}>{item.count}</Badge>
                  <Button
                    mode="outline"
                    size="s"
                    disabled={isAddingToCart || isRemovingFromCart}
                    onClick={async (event) => {
                      event.stopPropagation();
                      await addItemToCart(item.productVariant.code);
                    }}
                  >
                    +
                  </Button>
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
              disabled={placeOrderButtonDisabled}
              onClick={handlePlaceOrder}
            /> :
            <Button disabled={placeOrderButtonDisabled} onClick={handlePlaceOrder}>
              Оформить заказ
            </Button>
          }
        </Section>
      </List>
    </>
  )
}

export default ShoppingCart;
