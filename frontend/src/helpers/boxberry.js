const showBoxberryMap = callback => {
  boxberry.openOnPage('boxberry_map');
  boxberry.open(
    callback,
    '1$ecec1b9c26bd9fa11d1a72e4851184ba',
    '',
    '',
    1000,
    500
  );
  /*boxberry.open(boxberryCallback, 'm2FltAKjbXQBLa2xqZ4sPQ==','Москва','', 1000, 500,
    0, 50, 50, 50);*/
}

export default showBoxberryMap;
