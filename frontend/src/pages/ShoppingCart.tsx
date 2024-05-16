import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Badge,
  Button,
  Cell,
  Chip,
  Headline,
  IconButton,
  Info, Input,
  List,
  Multiselect,
  Section,
  Snackbar, Tappable
} from '@xelene/tgui';
import { MultiselectOption } from '@xelene/tgui/dist/components/Form/Multiselect/types';
import { difference, equals, isEmpty } from 'ramda';
import { MainButton } from '@vkruglikov/react-telegram-web-app';
import { Icon28Archive } from '@xelene/tgui/dist/icons/28/archive';
import { IconSelectableBase } from '@xelene/tgui/dist/components/Form/Selectable/icons/selectable_base';

import {
  useAddItemToCartMutation,
  useGetShoppingCartQuery,
  useRemoveItemFromCartMutation,
  useCreateOrderMutation,
  useDecreaseOneItemMutation,
  useLazyCheckAddressQuery,
  useLazyGetDeliveryPriceQuery,
  useLazySaveAddressQuery
} from '../redux/api.ts';
import { getColorOption } from '../helpers/product.ts';
import Loading from '../components/Loading.tsx';
import { IconTrashBin } from '../icons/trash-bin.tsx';
import { DeliveryPrice, DeliveryType } from '../types/delivery.ts';

export const DELIVERY_OPTIONS: MultiselectOption[] = [
  { value: DeliveryType.BOXBERRY_PVZ, label: 'Boxberry: Пункт выдачи' },
  { value: DeliveryType.BOXBERRY_COURIER, label: 'Boxberry: Курьер' },
  { value: DeliveryType.POST_PVZ, label: 'Почта России: Пункт выдачи' },
  { value: DeliveryType.POST_COURIER, label: 'Почта России: Курьер' }
]

const ShoppingCart: React.FunctionComponent = () => {
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [deliveryType, setDeliveryType] = useState<MultiselectOption[]>(
    DELIVERY_OPTIONS.filter(opt => opt.value === DeliveryType.BOXBERRY_COURIER)
  );
  const [address, setAddress] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState<DeliveryPrice>();

  const { data: cart, isLoading } = useGetShoppingCartQuery();
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();
  const [decreaseOneItem, { isLoading: isDecreasing }] = useDecreaseOneItemMutation();
  const [removeItemFromCart, { isLoading: isRemovingFromCart }] = useRemoveItemFromCartMutation();
  const [createOrder, { isLoading: isOrderCreating }] = useCreateOrderMutation();

  const [checkAddressQueryTrigger] = useLazyCheckAddressQuery();
  const [getDeliveryPriceQueryTrigger] = useLazyGetDeliveryPriceQuery();
  const [saveAddressQueryTrigger] = useLazySaveAddressQuery();

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

  const handleCheckAddress = async () => {
    if (deliveryType.length !== 1) return;
    const { data: checkedAddress } = await checkAddressQueryTrigger({
      deliveryType: deliveryType[0].value as DeliveryType,
      address
    });
    console.log('checkedAddress', checkedAddress);
    if (!checkedAddress) return;
    const { data: savedAddress } = await saveAddressQueryTrigger(checkedAddress);
    console.log('savedAddress', savedAddress);
    // TODO: костыль
    const { data: resultDeliveryPrice } = await getDeliveryPriceQueryTrigger(checkedAddress.code + '123');
    setDeliveryPrice(resultDeliveryPrice);
    console.log('resultDeliveryPrice', resultDeliveryPrice);
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
        <Section header="Доставка и получение">
          <Multiselect
            header="Способ доставки"
            options={DELIVERY_OPTIONS}
            value={deliveryType}
            closeDropdownAfterSelect={true}
            onChange={selected => setDeliveryType(
              equals(selected, deliveryType)
                ? deliveryType
                : difference(selected, deliveryType)
            )}
          >
          </Multiselect>
          {deliveryType.length > 0
            && [DeliveryType.BOXBERRY_COURIER.toString(), DeliveryType.POST_COURIER.toString()].includes(deliveryType[0].value.toString())
            && <Input
              header='Адрес доставки'
              placeholder='Введите адрес доставки'
              value={address}
              onChange={event => setAddress(event.target.value)}
              after={
                <Tappable
                  Component='div'
                  style={{ display: 'flex' }}
                  onClick={handleCheckAddress}>
                  <IconSelectableBase/>
                </Tappable>
              }/>
          }
          {deliveryPrice && <Info type="text">
            Стоимость доставки: {deliveryPrice.price} ₽
          </Info>
          }
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
