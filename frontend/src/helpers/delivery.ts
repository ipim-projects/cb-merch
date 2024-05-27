import { isNil } from 'ramda';

import { DeliveryAddress } from '../types/delivery.ts';

export const deliveryAddressToString = (address: DeliveryAddress) => {
  const { zipCode, region, area, city, address: streetHouse } = address;
  const arr = [zipCode, region, area, city, streetHouse].filter(item => !isNil(item));
  return arr.join(', ');
}
