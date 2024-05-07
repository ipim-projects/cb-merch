import React from 'react';
import { Avatar, Badge, Button, Cell, Chip, Headline, Section } from '@xelene/tgui';

import { useAddItemToCartMutation, useGetShoppingCartQuery, useRemoveItemFromCartMutation } from '../redux/api.ts';
import { getColorOption, getRealColorValue } from '../helpers/product.ts';

const ShoppingCart: React.FunctionComponent = () => {
  const { data: cart } = useGetShoppingCartQuery();
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();
  const [removeItemFromCart, { isLoading: isRemovingFromCart }] = useRemoveItemFromCartMutation();

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Корзина</Headline>
      <Section style={{ paddingBottom: '84px' }}>
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
            after={
            <>
              <Button
                mode="outline"
                size="s"
                disabled={isAddingToCart || isRemovingFromCart}
                onClick={async () => await removeItemFromCart(item.productVariant.code)}
              >
                -
              </Button>
              <Badge type="number" large={true}>{item.count}</Badge>
              <Button
                mode="outline"
                size="s"
                disabled={isAddingToCart || isRemovingFromCart}
                onClick={async () => await addItemToCart(item.productVariant.code)}
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
    </>
  )
}

export default ShoppingCart;
