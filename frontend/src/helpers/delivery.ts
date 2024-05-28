import { isNil } from 'ramda';

import { DeliveryAddress } from '../types/delivery.ts';

export const deliveryAddressToString = (address: Omit<DeliveryAddress, 'code'>) => {
  const { zipCode, region, area, city, address: streetHouse } = address;
  const arr = [zipCode, region, area, city, streetHouse].filter(item => !isNil(item));
  return arr.join(', ');
}

export const validateEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};
