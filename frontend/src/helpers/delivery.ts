import { DeliveryAddress } from '../types/delivery.ts';
import { isNil } from 'ramda';

export const deliveryAddressToString = (address: DeliveryAddress) => {
  const { zipCode, region, area, city, address: streetHouse } = address;
  const arr = [zipCode, region, area, city, streetHouse].filter(item => !isNil(item));
  return arr.join(', ');
}
