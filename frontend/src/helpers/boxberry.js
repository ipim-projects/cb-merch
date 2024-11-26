const tokens = {
  Logobaze: '1$ctlhr7CciYTmxPws68ECBzLj7h2DKH-n',
  Mamcupy: '1$ecec1b9c26bd9fa11d1a72e4851184ba',
}

const showBoxberryMap = (callback, ordersum, weight, storeCode) => {
  boxberry.openOnPage('boxberry_map');
  boxberry.open(
    callback,
    tokens[storeCode],
    '',
    '',
    // сумма в рублях
    ordersum,
    // вес в граммах
    weight
  );
}

export default showBoxberryMap;
