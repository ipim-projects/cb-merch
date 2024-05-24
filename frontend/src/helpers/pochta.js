const showPochtaMap = (pochtaCallback, ordersum, weight) => {
  ecomStartWidget({
    id: 48776,
    callbackFunction: pochtaCallback,
    containerId: 'ecom-widget',
    // сумма в копейках
    sumoc: ordersum * 100,
    // вес в граммах
    weight: weight
  });
}

export default showPochtaMap;
