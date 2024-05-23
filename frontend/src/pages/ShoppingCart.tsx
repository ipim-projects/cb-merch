import React, { useEffect, useState } from 'react';
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
  Snackbar,
  Tappable, Textarea
} from '@xelene/tgui';
import { MultiselectOption } from '@xelene/tgui/dist/components/Form/Multiselect/types';
import { ascend, difference, equals, isEmpty, prop, sort } from 'ramda';
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
import Loading from '../components/Loading.tsx';
// @ts-ignore
import showBoxberryMap from '../helpers/boxberry.js';
// @ts-ignore
import showPochtaMap from '../helpers/pochta.js';
import { IconTrashBin } from '../icons/trash-bin.tsx';
import { DeliveryType } from '../types/delivery.ts';
import { deliveryAddressToString } from '../helpers/delivery.ts';
import { BuyerInfo } from '../types/orders.ts';
import { ShoppingCartItem } from '../types/cart.ts';

export const DELIVERY_OPTIONS: MultiselectOption[] = [
  { value: DeliveryType.BOXBERRY_PVZ, label: 'Boxberry: Пункт выдачи' },
  { value: DeliveryType.BOXBERRY_COURIER, label: 'Boxberry: Курьер' },
  { value: DeliveryType.POST_PVZ, label: 'Почта России: Пункт выдачи' },
  // { value: DeliveryType.POST_COURIER, label: 'Почта России: Курьер' }
]

const ShoppingCart: React.FunctionComponent = () => {
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [deliveryType, setDeliveryType] = useState<MultiselectOption[]>(
    DELIVERY_OPTIONS.filter(opt => opt.value === DeliveryType.BOXBERRY_COURIER)
  );
  const [address, setAddress] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [deliveryPriceFoundOut, setDeliveryPriceFoundOut] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
  });

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

  useEffect(() => {
    setDeliveryPrice(0);
    setDeliveryPriceFoundOut(false);
    if (deliveryType.length > 0 && DeliveryType.BOXBERRY_PVZ === deliveryType[0].value) {
      console.log('showBoxberryMap');
      showBoxberryMap(boxberryCallback);
    }
    if (deliveryType.length > 0 && DeliveryType.POST_PVZ === deliveryType[0].value) {
      console.log('showPochtaMap');
      showPochtaMap(pochtaCallback);
    }
  }, [deliveryType]);

  const handlePlaceOrder = async () => {
    await createOrder(buyerInfo);
    setIsSnackbarShown(true);
  }

  const handleCheckAddress = async () => {
    if (deliveryType.length !== 1) return;
    const { data: checkedAddress } = await checkAddressQueryTrigger({
      deliveryType: deliveryType[0].value as DeliveryType,
      address
    });
    if (!checkedAddress) return;
    const { data: savedAddress } = await saveAddressQueryTrigger(checkedAddress);
    if (!savedAddress) return;
    const { data: resultDeliveryPrice } = await getDeliveryPriceQueryTrigger(savedAddress.code);
    if (!resultDeliveryPrice) return;
    setDeliveryPrice(resultDeliveryPrice.price);
    setDeliveryPriceFoundOut(true);
    setAddress(deliveryAddressToString(resultDeliveryPrice.deliveryAddress));
    console.log('resultDeliveryPrice', resultDeliveryPrice);
  }

  const cartItemOptions = (item: ShoppingCartItem) => {
    const options = item.productVariant.productOptions;
    if (isEmpty(options)) return null;
    const optionChips = sort(ascend(prop('type')), options).map((option, index) => {
      if (option.type === 'color') return <Chip
        key={index}
        mode="elevated"
        before={
          <Avatar
            size={28}
            style={{ backgroundColor: option.value }}
          />
        }
      >
        {option.name}
      </Chip>;
      if (option.type === 'size') return <Chip
        key={index}
        mode="elevated"
      >
        {option.value}
      </Chip>
    });
    if (isEmpty(optionChips)) return null;
    return (
      <div
        style={{
          display: 'flex',
          gap: 16
        }}
      >
        {optionChips}
      </div>
    );
  }

  const boxberryCallback = (result: any) => {
    console.log('Выбрано отделение:', result);
    if (result.price) {
      setDeliveryPrice(result.price);
      setDeliveryPriceFoundOut(true);
    }
  }

  const pochtaCallback = (result: any) => {
    console.log('Выбрано отделение:', result);
    if (result.cashOfDelivery) {
      setDeliveryPrice(result.cashOfDelivery);
      setDeliveryPriceFoundOut(true);
    }
  }

  if (isLoading) return (
    <Loading/>
  );

  console.log('buyerInfo', buyerInfo);

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
              description={cartItemOptions(item)}
              onClick={() => navigate(`/product/${item.product.code}`)}
              after={
                <>
                  <Info type="text" style={{ marginRight: '16px' }}>
                    {item.productVariant.price * item.count} ₽
                  </Info>
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
            // && [DeliveryType.BOXBERRY_COURIER.toString(), DeliveryType.POST_COURIER.toString()].includes(deliveryType[0].value.toString())
            && DeliveryType.BOXBERRY_COURIER === deliveryType[0].value.toString()
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
          {deliveryType.length > 0 && DeliveryType.BOXBERRY_PVZ === deliveryType[0].value && <div
            id="boxberry_map"
          ></div>
          }
          {deliveryType.length > 0 && DeliveryType.POST_PVZ === deliveryType[0].value && <div
            id="ecom-widget"
            style={{ height: 500 }}
          ></div>
          }
        </Section>
        <Section>
          <Info type="text">
            Стоимость доставки: {deliveryPrice} ₽
          </Info>
          <Info type="text">
            Итого: {(cart?.totalPrice ?? 0) + deliveryPrice} ₽
          </Info>
        </Section>
        {deliveryPriceFoundOut && <Section header="Оформление заказа">
          <Input
            header='Имя, фамилия'
            placeholder='Введите имя и фамилию'
            value={buyerInfo?.buyerName}
            onChange={event =>
              setBuyerInfo(prevState => ({
                ...prevState, buyerName: event.target.value
              }))
            }
          />
          <Input
            header='Телефон'
            placeholder='Введите номер телефона'
            value={buyerInfo?.buyerPhone}
            onChange={event =>
              setBuyerInfo(prevState => ({
                ...prevState, buyerPhone: event.target.value
              }))
            }
          />
          <Input
            header='Email'
            placeholder='Введите адрес электронной почты'
            value={buyerInfo?.buyerEmail}
            onChange={event =>
              setBuyerInfo(prevState => ({
                ...prevState, buyerEmail: event.target.value
              }))
            }
          />
          <Textarea
            header='Комментарий'
            placeholder='Введите комментарий к заказу'
            value={buyerInfo?.comment}
            onChange={event =>
              setBuyerInfo(prevState => ({
                ...prevState, comment: event.target.value
              }))
            }
          />
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
        }
      </List>
    </>
  )
}

export default ShoppingCart;
