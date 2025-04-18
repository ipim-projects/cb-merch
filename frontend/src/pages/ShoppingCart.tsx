import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  Badge,
  Blockquote,
  Button,
  Cell,
  Checkbox,
  Headline,
  IconButton,
  Info,
  Input,
  List,
  Modal,
  Multiselect,
  Section,
  Snackbar,
  Spinner,
  Tappable,
  Textarea
} from '@telegram-apps/telegram-ui';
import { MultiselectOption } from '@telegram-apps/telegram-ui/dist/components/Form/Multiselect/types';
import { difference, equals, isEmpty, isNil, isNotNil } from 'ramda';
import { MainButton, useShowPopup } from '@vkruglikov/react-telegram-web-app';
import {
  ModalHeader
} from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader';
import { ModalClose } from '@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose';
import { Icon28Close } from '@telegram-apps/telegram-ui/dist/icons/28/close';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';
import { IconSelectableBase } from '@telegram-apps/telegram-ui/dist/components/Form/Selectable/icons/selectable_base';

import {
  useAddItemToCartMutation,
  useCreateOrderMutation,
  useDecreaseOneItemMutation,
  useGetShoppingCartQuery,
  useLazyCheckAddressQuery,
  useLazyCheckBoxberryIndexQuery,
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
import { IconAddCircle } from '../icons/add-circle.tsx';
import { IconMinusCircle } from '../icons/minus-circle.tsx';
import { DeliveryOptions, DeliveryType, WidgetDeliveryPrice } from '../types/delivery.ts';
import { deliveryAddressToString, validateEmail, validatePhone } from '../helpers/delivery.ts';
import { BuyerInfo } from '../types/orders.ts';
import { productOptionsChips } from '../helpers/product.tsx';

import styles from './ShoppingCart.module.css';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store.ts';

const ShoppingCart: React.FunctionComponent = () => {
  const storeDeliveryTypes = useSelector((state: RootState) => state.store.deliveryTypes);
  const storeCode = useSelector((state: RootState) => state.store.code);
  const storeDeliveryOptions: MultiselectOption[] = DeliveryOptions.filter(opt => storeDeliveryTypes.includes(opt.value.toString()));

  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [deliveryType, setDeliveryType] = useState<MultiselectOption[]>([]);
  const [address, setAddress] = useState('');
  const [deliveryPrice, setDeliveryPrice] = useState(0);
  const [deliveryPriceFoundOut, setDeliveryPriceFoundOut] = useState(false);
  const [isAddressChecking, setIsAddressChecking] = useState(false);
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({ buyerName: '', buyerPhone: '', buyerEmail: '' });
  const [buyerNameInputStatus, setBuyerNameInputStatus] = useState<undefined | 'error'>(undefined);
  const [buyerPhoneInputStatus, setBuyerPhoneInputStatus] = useState<undefined | 'error'>(undefined);
  const [buyerEmailInputStatus, setBuyerEmailInputStatus] = useState<undefined | 'error'>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [agreement, setAgreement] = useState(false);
  const [isAgreementExpanded, setIsAgreementExpanded] = useState(false);

  const { data: cart, isLoading, refetch: cartRefetch } = useGetShoppingCartQuery();
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();
  const [decreaseOneItem, { isLoading: isDecreasing }] = useDecreaseOneItemMutation();
  const [removeItemFromCart, { isLoading: isRemovingFromCart }] = useRemoveItemFromCartMutation();
  const [createOrder, {
    data: order,
    isLoading: isOrderCreating,
    isSuccess: isCreateOrderSuccess
  }] = useCreateOrderMutation();

  const [checkAddressQueryTrigger] = useLazyCheckAddressQuery();
  const [getDeliveryPriceQueryTrigger] = useLazyGetDeliveryPriceQuery();
  const [saveAddressQueryTrigger] = useLazySaveAddressQuery();
  const [saveWidgetAddressQueryTrigger] = useLazySaveWidgetAddressQuery();
  const [checkBoxberryIndexQueryTrigger] = useLazyCheckBoxberryIndexQuery();

  const navigate = useNavigate();
  const showPopup = useShowPopup();

  const isTelegram = !!window.Telegram?.WebApp?.initData;
  const buttonsDisabled = isLoading
    || isAddingToCart
    || isDecreasing
    || isRemovingFromCart
    || isAddressChecking
    || isOrderCreating
    || !!order
    || (cart?.items && isEmpty(cart?.items));

  const divRef = useRef<null | HTMLDivElement>(null);
  const scrollToDown = () => {
    if (divRef.current) {
      divRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  useEffect(() => {
    if (cart?.delivery?.deliveryAddress?.deliveryType
      && (isEmpty(deliveryType) || (
          deliveryType.length > 0
          && cart.delivery.deliveryAddress.deliveryType !== deliveryType[0].value
        )
      )) {
      setDeliveryType(DeliveryOptions.filter(opt => opt.value === cart.delivery.deliveryAddress.deliveryType));
    }
    if (cart?.delivery?.deliveryAddress) {
      cart?.delivery?.deliveryAddress?.deliveryType === DeliveryType.BOXBERRY_PVZ
        ? setAddress(cart.delivery.deliveryAddress.address)
        : setAddress(deliveryAddressToString(cart.delivery.deliveryAddress));
    }
    if (cart?.delivery?.price) {
      setDeliveryPrice(cart.delivery.price);
      setDeliveryPriceFoundOut(true);
    }
  }, [cart]);

  useEffect(() => {
    if (deliveryType.length > 0 && DeliveryType.BOXBERRY_PVZ === deliveryType[0].value) {
      showBoxberryMap(boxberryCallback, cart?.productPrice, cart?.totalWeight, storeCode);
    }
    if (deliveryType.length > 0 && DeliveryType.POST_PVZ === deliveryType[0].value) {
      showPochtaMap(storeCode === 'Logobaze' ? logobazePochtaCallback : pochtaCallback, cart?.productPrice, cart?.totalWeight, storeCode);
    }
  }, [deliveryType]);

  useEffect(() => {
    if (isCreateOrderSuccess && order) {
      setIsSnackbarShown(true);
      cartRefetch();
    }
  }, [isCreateOrderSuccess]);

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
    await createOrder({
      ...buyerInfo,
      buyerName: buyerInfo.buyerName.trim(),
      buyerPhone: '7' + buyerInfo.buyerPhone,
    });
    setIsModalOpen(false);
    setIsSnackbarShown(true);
  }

  const handleOrderCreated = () => {
    if (isSnackbarShown) {
      setIsSnackbarShown(false);
      navigate(`/order/${order?.code}`);
    }
  }

  const handleCheckAddress = async () => {
    if (deliveryType.length !== 1) return;
    setIsAddressChecking(true);
    if (isEmpty(address.trim())) {
      await showPopup({ message: 'Введите адрес' });
      setIsAddressChecking(false);
      return;
    }
    const { data: checkedAddress } = await checkAddressQueryTrigger({
      deliveryType: deliveryType[0].value as DeliveryType,
      address
    });
    if (!checkedAddress?.zipCode) {
      await showPopup({ title: 'Ошибка', message: 'Адрес или индекс не найден' });
      setIsAddressChecking(false);
      return;
    }
    const { data: checkedBoxberryIndex } = await checkBoxberryIndexQueryTrigger({ zipCode: checkedAddress.zipCode });
    if (isEmpty(checkedBoxberryIndex)) {
      await showPopup({ message: 'На указанный адрес доставка невозможна' });
      setIsAddressChecking(false);
      return;
    }
    const { data: savedAddress } = await saveAddressQueryTrigger(checkedAddress);
    if (!savedAddress) {
      await showPopup({ title: 'Ошибка', message: 'Не удалось сохранить адрес' });
      setIsAddressChecking(false);
      return;
    }
    const { data: resultDeliveryPrice } = await getDeliveryPriceQueryTrigger(savedAddress.code);
    if (!resultDeliveryPrice) {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
      setIsAddressChecking(false);
      return;
    }
    setDeliveryPrice(resultDeliveryPrice.price);
    setDeliveryPriceFoundOut(true);
    setAddress(deliveryAddressToString(resultDeliveryPrice.deliveryAddress));
    scrollToDown();
    cartRefetch();
    setIsAddressChecking(false);
  }

  const boxberryCallback = async (result: any) => {
    console.log('Выбрано отделение:', result);
    if (result.price) {
      if (!result.zip) {
        await showPopup({ title: 'Ошибка', message: 'Адрес или индекс не найден' });
        return;
      }
      setDeliveryPrice(Number(result.price));
      setDeliveryPriceFoundOut(true);
      setAddress(result.address);
      const pvzAddress: WidgetDeliveryPrice = {
        address: {
          country: 'Россия',
          // region: undefined,
          // area: undefined,
          // city: undefined,
          address: result.address,
          zipCode: result.zip,
          pvzCode: result.id,
          deliveryType: DeliveryType.BOXBERRY_PVZ,
        },
        price: result.price,
      }
      await saveWidgetAddressQueryTrigger(pvzAddress);
      scrollToDown();
      cartRefetch();
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
      scrollToDown();
      cartRefetch();
    } else {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
    }
  }

  const logobazePochtaCallback = async (result: any) => {
    console.log('Logobaze Выбрано отделение:', result);
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
      scrollToDown();
      cartRefetch();
    } else {
      await showPopup({ title: 'Ошибка', message: 'Не удалось получить стоимость доставки' });
    }
  }

  const getWarningMessages = () => {
    if (isEmpty(buyerInfo.buyerName.trim())) return 'Введите имя и фамилию';
    if (!validatePhone(buyerInfo.buyerPhone.trim())) return 'Введите номер телефона';
    if (!validateEmail(buyerInfo.buyerEmail.trim())) return 'Введите корректный e-mail';
    return null;
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
              multiline={true}
              key={index}
              subtitle={<span style={{ whiteSpace: 'normal' }}>{item.product.description}</span>}
              description={productOptionsChips(item.productVariant.productOptions)}
              onClick={() => navigate(`/product/${item.product.code}`)}
              after={
                <List>
                  {item.product.name !== 'Фулфилмент' && <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <IconButton
                      mode="plain"
                      size="s"
                      disabled={buttonsDisabled}
                      onClick={async (event) => {
                        event.stopPropagation();
                        await decreaseOneItem(item.productVariant.code);
                        setDeliveryPrice(0);
                        setDeliveryPriceFoundOut(false);
                      }}
                    >
                      <IconMinusCircle/>
                    </IconButton>
                    <Badge type="number" mode="primary" large={false}>{item.count}</Badge>
                    <IconButton
                      mode="plain"
                      size="s"
                      disabled={buttonsDisabled}
                      onClick={async (event) => {
                        event.stopPropagation();
                        await addItemToCart(item.productVariant.code);
                        setDeliveryPrice(0);
                        setDeliveryPriceFoundOut(false);
                      }}
                    >
                      <IconAddCircle/>
                    </IconButton>
                    <IconButton
                      // style={{ marginLeft: '16px' }}
                      mode="plain"
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
                  </div>
                  }
                  <Info type="text">
                    <span style={{ whiteSpace: 'nowrap' }}>{item.productVariant.price * item.count} ₽</span>
                  </Info>
                </List>
              }
            >
              {item.product.name}
            </Cell>
          ))}
        </Section>
        <Section header="Доставка и получение">
          <Multiselect
            header="Способ доставки"
            options={storeDeliveryOptions}
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
              disabled={isAddressChecking}
              value={address}
              onChange={event => setAddress(event.target.value)}
              after={
                <Tappable
                  Component='div'
                  style={{ display: 'flex' }}
                  onClick={handleCheckAddress}>
                  {isAddressChecking ?
                    <Spinner size="s"/> :
                    <IconSelectableBase/>
                  }
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
            Стоимость доставки: {deliveryPrice.toFixed(2)} ₽
          </Info>
          <Info type="text">
            Итого: {((cart?.productPrice ?? 0) + deliveryPrice).toFixed(2)} ₽
          </Info>
        </Section>
        <div id="divRef" ref={divRef}></div>
        {deliveryPriceFoundOut && <Modal
          header={<ModalHeader
            after={<ModalClose><Icon28Close
              style={{ color: 'var(--tgui--plain_foreground)' }}
              onClick={() => setIsModalOpen(false)}
            /></ModalClose>}
          >
            Оформление заказа
          </ModalHeader>}
          trigger={undefined}
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
        >
          <Section header="Оформление заказа" footer={getWarningMessages()}>
            <Input
              header='Имя, фамилия'
              placeholder='Введите имя и фамилию'
              value={buyerInfo?.buyerName}
              status={buyerNameInputStatus}
              onChange={event => {
                setBuyerInfo(prevState => ({
                  ...prevState, buyerName: event.target.value
                }));
                setBuyerNameInputStatus(isEmpty(event.target.value.trim()) ? 'error' : undefined);
              }}
            />
            <Input
              header='Телефон'
              placeholder='Введите номер телефона в формате 9991112233'
              value={buyerInfo?.buyerPhone}
              status={buyerPhoneInputStatus}
              before={<Badge type="number" mode="gray" large={true}>+7</Badge>}
              onChange={event => {
                setBuyerInfo(prevState => ({
                  ...prevState, buyerPhone: event.target.value.trim()
                }));
                setBuyerPhoneInputStatus(!validatePhone(event.target.value.trim()) ? 'error' : undefined);
              }}
            />
            <Input
              header='Email'
              placeholder='Введите адрес электронной почты'
              value={buyerInfo?.buyerEmail}
              status={buyerEmailInputStatus}
              onChange={event => {
                setBuyerInfo(prevState => ({
                  ...prevState, buyerEmail: event.target.value.trim()
                }));
                setBuyerEmailInputStatus(!validateEmail(event.target.value.trim()) ? 'error' : undefined);
              }}
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
            <Cell
              Component="label"
              before={<Checkbox name="agreementCheckbox" value="0" onChange={() => setAgreement(!agreement)}/>}
              description="Согласен на обработку и передачу персональных данных"
              multiline
            />
            <Accordion
              onChange={() => setIsAgreementExpanded(!isAgreementExpanded)}
              expanded={isAgreementExpanded}
            >
              <Accordion.Summary>
                Текст согласия
              </Accordion.Summary>
              <Accordion.Content>
                <div
                  style={{
                    padding: '10px 20px 20px'
                  }}
                >
                  <Blockquote>
                    <p>Предоставляя свои персональные данные, Покупатель даёт согласие на обработку, хранение и
                      использование своих персональных данных на основании ФЗ № 152-ФЗ «О персональных данных» от
                      27.07.2006 г. в следующих целях:<br/>
                      • Регистрации Пользователя на в Витрине<br/>
                      • Осуществления клиентской поддержки Продавцом<br/>
                      • Выполнения Продавцом обязательств перед Покупателем<br/>
                      Под персональными данными подразумевается любая информация личного характера, позволяющая
                      установить личность Покупателя такая как:<br/>
                      • Фамилия, Имя, Отчество<br/>
                      • Контактный телефон<br/>
                      • Адрес электронной почты<br/>
                      • Почтовый адрес (в случае доставки курьерской службой)<br/>
                      • Имя пользователя Telegram (в случае выставления счета на оплату Продавцом через чат мессенджера
                      Telegram)</p>
                    <p>Персональные данные Покупателей не хранятся в Витрине, а передаются в рамках заказа Продавцу. На
                      стороне Продавца персональные данные хранятся исключительно на электронных носителях и
                      обрабатываются с использованием автоматизированных систем, за исключением случаев, когда
                      неавтоматизированная обработка персональных данных необходима в связи с исполнением требований
                      законодательства.<br/>
                      Витрина обязуется не передавать полученные персональные данные любым третьим лицам кроме
                      Продавца и логистических компаний, обеспечивающих доставку, которым передается информация заказа
                      Покупателя, за исключением уполномоченных органов государственной власти РФ только по основаниям
                      и в порядке, установленным законодательством РФ.<br/>
                      Витрина оставляет за собой право вносить изменения в одностороннем порядке в настоящие правила,
                      при условии, что изменения не противоречат действующему законодательству РФ. Изменения условий
                      настоящих правил вступают в силу после их публикации в интерфейсе Витрины.</p>
                  </Blockquote>
                </div>
              </Accordion.Content>
            </Accordion>
          </Section>
          {!buttonsDisabled && isNil(getWarningMessages()) && isModalOpen && agreement && <>
            {isTelegram ?
              <MainButton
                text={'Оформить заказ'}
                disabled={buttonsDisabled || isNotNil(getWarningMessages())}
                onClick={handlePlaceOrder}
              /> :
              <Button
                disabled={buttonsDisabled || isNotNil(getWarningMessages())}
                onClick={handlePlaceOrder}
              >
                Оформить заказ
              </Button>
            }
          </>
          }
        </Modal>
        }
        {isSnackbarShown && order && (
          <Snackbar
            className={styles.fixed}
            before={<Icon28Archive/>}
            description={`№ ${order.sourceCode} от ${new Date(order.createdAtUtc).toLocaleDateString('ru-RU')}`}
            children="Заказ сформирован"
            onClose={handleOrderCreated}
            after={(
              <Snackbar.Button onClick={handleOrderCreated}>
                К заказу
              </Snackbar.Button>
            )}
          />
        )}
        {deliveryPriceFoundOut && !isModalOpen && <>
          {isTelegram ?
            <MainButton
              text={'Перейти к оформлению'}
              onClick={() => setIsModalOpen(true)}
            /> :
            <Button
              onClick={() => setIsModalOpen(true)}
            >
              Перейти к оформлению
            </Button>
          }
        </>
        }
      </List>
    </>
  )
}

export default ShoppingCart;
