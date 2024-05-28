import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Cell,
  Headline,
  IconButton,
  Info,
  Input,
  List,
  Multiselect,
  Section,
  Snackbar,
  Tappable,
  Textarea
} from '@xelene/tgui';
import { MultiselectOption } from '@xelene/tgui/dist/components/Form/Multiselect/types';
import { difference, equals, isEmpty, isNotNil } from 'ramda';
import { MainButton, useShowPopup } from '@vkruglikov/react-telegram-web-app';
import { Icon28Archive } from '@xelene/tgui/dist/icons/28/archive';
import { IconSelectableBase } from '@xelene/tgui/dist/components/Form/Selectable/icons/selectable_base';

import {
  useAddItemToCartMutation,
  useCreateOrderMutation,
  useDecreaseOneItemMutation,
  useGetShoppingCartQuery,
  useLazyCheckAddressQuery,
  useLazyGetDeliveryPriceQuery,
  useLazySaveAddressQuery,
  useLazySaveWidgetAddressQuery,
  useRemoveItemFromCartMutation
} from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
// @ts-ignore
import showBoxberryMap from '../helpers/boxberry.js';
// @ts-ignore
import showPochtaMap from '../helpers/pochta.js';
import { IconTrashBin } from '../icons/trash-bin.tsx';
import { DeliveryOptions, DeliveryType, WidgetDeliveryPrice } from '../types/delivery.ts';
import { deliveryAddressToString, validateEmail } from '../helpers/delivery.ts';
import { BuyerInfo } from '../types/orders.ts';
import { productOptionsChips } from '../helpers/product.tsx';

const ShoppingCart: React.FunctionComponent = () => {
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [deliveryType, setDeliveryType] = useState<MultiselectOption[]>(
    DeliveryOptions.filter(opt => opt.value === DeliveryType.BOXBERRY_COURIER)
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
  const [createOrder, { isLoading: isOrderCreating, isSuccess: isCreateOrderSuccess }] = useCreateOrderMutation();

  const [checkAddressQueryTrigger] = useLazyCheckAddressQuery();
  const [getDeliveryPriceQueryTrigger] = useLazyGetDeliveryPriceQuery();
  const [saveAddressQueryTrigger] = useLazySaveAddressQuery();
  const [saveWidgetAddressQueryTrigger] = useLazySaveWidgetAddressQuery();

  const navigate = useNavigate();
  const showPopup = useShowPopup();

  const isTelegram = !!window.Telegram?.WebApp?.initData;
  const buttonsDisabled = isLoading
    || isAddingToCart
    || isDecreasing
    || isRemovingFromCart
    || isOrderCreating
    || (cart?.items && isEmpty(cart?.items));

  useEffect(() => {
    if (
      cart?.delivery.deliveryAddress.deliveryType
      && deliveryType.length > 0
      && cart?.delivery.deliveryAddress.deliveryType !== deliveryType[0].value
    ) {
      setDeliveryType(DeliveryOptions.filter(opt => opt.value === cart.delivery.deliveryAddress.deliveryType));
    }
    if (cart?.delivery.deliveryAddress) {
      setAddress(deliveryAddressToString(cart.delivery.deliveryAddress));
    }
    if (cart?.delivery.price) {
      setDeliveryPrice(cart.delivery.price);
      setDeliveryPriceFoundOut(true);
    }
  }, [cart]);

  useEffect(() => {
    if (deliveryType.length > 0 && DeliveryType.BOXBERRY_PVZ === deliveryType[0].value) {
      showBoxberryMap(boxberryCallback, cart?.totalPrice, cart?.totalWeight);
    }
    if (deliveryType.length > 0 && DeliveryType.POST_PVZ === deliveryType[0].value) {
      showPochtaMap(pochtaCallback, cart?.totalPrice, cart?.totalWeight);
    }
  }, [deliveryType]);

  const handleDeliveryTypeChange = (selected: MultiselectOption[]) => {
    const isEqual = equals(selected, deliveryType);
    if (!isEqual) {
      setDeliveryType(difference(selected, deliveryType));
      setAddress('');
      setDeliveryPrice(0);
      setDeliveryPriceFoundOut(false);
    }
  }

  const handlePlaceOrder = async () => {
    await createOrder(buyerInfo);
    if (isCreateOrderSuccess) setIsSnackbarShown(true);
  }

  const handleCheckAddress = async () => {
    if (deliveryType.length !== 1) return;
    if (isEmpty(address.trim())) {
      console.log('Введите адрес');
      await showPopup({ message: 'Введите адрес' });
      return;
    }
    const { data: checkedAddress } = await checkAddressQueryTrigger({
      deliveryType: deliveryType[0].value as DeliveryType,
      address
    });
    if (!checkedAddress?.zipCode) {
      await showPopup({ title: 'Ошибка', message: 'Адрес или индекс не найден' });
      return;
    }
    const { data: savedAddress } = await saveAddressQueryTrigger(checkedAddress);
    if (!savedAddress) {
      await showPopup({ title: 'Ошибка', message: 'Не удалось сохранить адрес' });
      return;
    }
    const { data: resultDeliveryPrice } = await getDeliveryPriceQueryTrigger(savedAddress.code);
    if (!resultDeliveryPrice) {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
      return;
    }
    setDeliveryPrice(resultDeliveryPrice.price);
    setDeliveryPriceFoundOut(true);
    setAddress(deliveryAddressToString(resultDeliveryPrice.deliveryAddress));
  }

  const boxberryCallback = async (result: any) => {
    console.log('Выбрано отделение:', result);
    if (result.price) {
      // парсим адрес через вызов delivery/pochtaru/check/address
      const { data: checkedAddress } = await checkAddressQueryTrigger({
        deliveryType: DeliveryType.BOXBERRY_PVZ,
        address: result.address
      });
      if (!checkedAddress?.zipCode) {
        await showPopup({ title: 'Ошибка', message: 'Адрес или индекс не найден' });
        return;
      }
      setDeliveryPrice(Number(result.price));
      setDeliveryPriceFoundOut(true);
      setAddress(deliveryAddressToString(checkedAddress));
      const pvzAddress: WidgetDeliveryPrice = {
        address: { ...checkedAddress, pvzCode: result.id, },
        price: result.price,
      }
      await saveWidgetAddressQueryTrigger(pvzAddress);
    } else {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
    }
  }

  const pochtaCallback = async (result: any) => {
    console.log('Выбрано отделение:', result);
    if (result.cashOfDelivery) {
      // сумма в копейках
      const deliveryPrice = result.cashOfDelivery / 100;
      const pvzAddress: WidgetDeliveryPrice = {
        address: {
          country: 'Россия',
          region: result.regionTo,
          area: result.areaTo,
          city: result.cityTo,
          address: result.addressTo,
          zipCode: result.indexTo,
          pvzCode: result.id.toString(),
          deliveryType: DeliveryType.POST_PVZ,
        },
        price: deliveryPrice,
      };
      setDeliveryPrice(deliveryPrice);
      setDeliveryPriceFoundOut(true);
      setAddress(deliveryAddressToString(pvzAddress.address));
      await saveWidgetAddressQueryTrigger(pvzAddress);
    } else {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
    }
  }

  const getWarningMessages = () => {
    if (isEmpty(buyerInfo.buyerName)) return 'Введите имя и фамилию';
    if (isEmpty(buyerInfo.buyerPhone)) return 'Введите телефон';
    if (isEmpty(buyerInfo.buyerEmail)) return 'Введите e-mail';
    if (!validateEmail(buyerInfo.buyerEmail)) return 'Введите корректный e-mail';
    return null;
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
              description={productOptionsChips(item.productVariant.productOptions)}
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
                      setDeliveryPrice(0);
                      setDeliveryPriceFoundOut(false);
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
                      setDeliveryPrice(0);
                      setDeliveryPriceFoundOut(false);
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
                      setDeliveryPrice(0);
                      setDeliveryPriceFoundOut(false);
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
            options={DeliveryOptions}
            value={deliveryType}
            closeDropdownAfterSelect={true}
            onChange={handleDeliveryTypeChange}
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
          {deliveryType.length > 0
            && [DeliveryType.BOXBERRY_PVZ.toString(), DeliveryType.POST_PVZ.toString()].includes(deliveryType[0].value.toString())
            && <Input
              header='Адрес пункта выдачи заказов'
              value={address}
              disabled={true}
            />
          }
        </Section>
        <Section>
          <Info type="text">
            Общий вес: {cart?.totalWeight} г
          </Info>
          <Info type="text">
            Стоимость доставки: {deliveryPrice} ₽
          </Info>
          <Info type="text">
            Итого: {((cart?.totalPrice ?? 0) + deliveryPrice).toFixed(2)} ₽
          </Info>
        </Section>
        {deliveryPriceFoundOut && <>
          <Section header="Оформление заказа" footer={getWarningMessages()}>
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
          </Section>
          {isTelegram ?
            <MainButton
              text={'Оформить заказ'}
              disabled={buttonsDisabled || isNotNil(getWarningMessages())}
              onClick={handlePlaceOrder}
            /> :
            <Button disabled={buttonsDisabled || isNotNil(getWarningMessages())} onClick={handlePlaceOrder}>
              Оформить заказ
            </Button>
          }
        </>
        }
      </List>
    </>
  )
}

export default ShoppingCart;
