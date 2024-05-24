export enum DeliveryType {
  BOXBERRY_PVZ = 'boxberryPvz',
  BOXBERRY_COURIER = 'boxberryCourier',
  POST_PVZ = 'postPvz',
  // POST_COURIER = 'postCourier',
}

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
  deliveryAddress: Omit<DeliveryAddress, 'code'>,
  price: number,
}
