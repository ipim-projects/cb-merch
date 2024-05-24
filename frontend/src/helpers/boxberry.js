const showBoxberryMap = (callback, ordersum, weight) => {
  boxberry.openOnPage('boxberry_map');
  boxberry.open(
    callback,
    '1$ecec1b9c26bd9fa11d1a72e4851184ba',
    '',
    '',
    // сумма в рублях
    ordersum,
    // вес в граммах
    weight
  );
}

export default showBoxberryMap;
