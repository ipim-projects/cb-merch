const ids = {
  Logobaze: 52759,
  Mamcupy: 48776,
}

const showPochtaMap = (pochtaCallback, ordersum, weight, storeCode) => {
  ecomStartWidget({
    id: ids[storeCode],
    callbackFunction: pochtaCallback,
    containerId: 'ecom-widget',
    // сумма в копейках
    sumoc: ordersum * 100,
    // вес в граммах
    weight: weight
  });
}

export default showPochtaMap;
