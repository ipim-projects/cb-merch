const showPochtaMap = pochtaCallback => {
  ecomStartWidget({
    id: 48776,
    callbackFunction: pochtaCallback,
    containerId: 'ecom-widget',
    sumoc: 1000,
    weight: 500,
  });
}

export default showPochtaMap;
