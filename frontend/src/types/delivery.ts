import { MultiselectOption } from '@xelene/tgui/dist/components/Form/Multiselect/types';

export enum DeliveryType {
  BOXBERRY_PVZ = 'boxberryPvz',
  BOXBERRY_COURIER = 'boxberryCourier',
  POST_PVZ = 'postPvz',
  // POST_COURIER = 'postCourier',
}

export const DeliveryOptions: MultiselectOption[] = [
  { value: DeliveryType.BOXBERRY_PVZ, label: 'Boxberry: Пункт выдачи' },
  { value: DeliveryType.BOXBERRY_COURIER, label: 'Boxberry: Курьер' },
  { value: DeliveryType.POST_PVZ, label: 'Почта России: Пункт выдачи' },
  // { value: DeliveryType.POST_COURIER, label: 'Почта России: Курьер' }
];

export interface DeliveryAddress {
  country: string,
  region?: string,
  area?: string,
  city: string,
  address: string,
  zipCode: string,
  pvzCode?: string,
  pvzName?: string,
  deliveryType: DeliveryType,
  code: string,
}

export interface CheckDeliveryAddressQueryArg {
  deliveryType: DeliveryType,
  address: string,
}

export interface DeliveryPrice {
  deliveryAddress: DeliveryAddress,
  price: number,
}

export interface WidgetDeliveryPrice {
  address: Omit<DeliveryAddress, 'code'>,
  price: number,
}

export interface CheckBoxberryIndexQueryArg {
  deliveryType?: DeliveryType,
  zipCode: string,
}
