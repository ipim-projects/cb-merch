import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes } from 'react-router-dom';
import { useHapticFeedback } from '@vkruglikov/react-telegram-web-app';

import '@telegram-apps/telegram-ui/dist/styles.css';
import { AppRoot } from '@telegram-apps/telegram-ui';

import Main from './pages/Main';
import ProductCard from './pages/ProductCard';
import Catalog from './pages/Catalog.tsx';
import ShoppingCart from './pages/ShoppingCart.tsx';
import Orders from './pages/Orders.tsx';
import OrderInfo from './pages/OrderInfo.tsx';

const NoMatch = () => (
  <div>
    <h2>Страница не существует</h2>
    <p>
      <Link to="/">На главную</Link>
    </p>
  </div>
);

const PaymentReturnPage = () => (
  <div>
    <h2>Информацию о статусе оплаты можно посмотреть в магазине через телеграм-бот</h2>
  </div>
);

const App = () => {
  const [_impactOccurred, notificationOccurred, _selectionChanged] = useHapticFeedback();
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initData) {
      if (!window.Telegram.WebApp.isVersionAtLeast('6.9')) {
        notificationOccurred('error');
        if (window.Telegram.WebApp.isVersionAtLeast('6.2')) {
          window.Telegram.WebApp.showPopup({ message: 'Please update your Telegram app to the latest version to use this app.' });
        } else {
          console.log('the version is not supported');
          setIsInvalidVersion(true);
        }
      }
      // Alternatively to what can be set with react-telegram-web-app, you can directly set the following properties:
      try {
        window.Telegram.WebApp.requestWriteAccess();
      } catch (e) {
        console.log(e);
      }
      window.Telegram.WebApp.expand();
      // console.log(`initData: ${window.Telegram.WebApp.initData}`);
      // showPopup({ message: `initData: ${tgWebApp.initData.slice(0, 50)}` });
    }
  }, [])

  return (
    <AppRoot>
      {isInvalidVersion &&
        (<div className='invalid-version'>
            <div className='invalid-version__content'>
              <h1>Sorry but this version is outdated!
              </h1>
              <h1>Please update your Telegram app to the latest
                version to
                use this app.</h1>
            </div>
          </div>
        )}
      {!isInvalidVersion && (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Main/>}>
              <Route index element={<Navigate to="/catalog" replace/>}/>
              <Route path="catalog" element={<Catalog/>}/>
              <Route path="cart" element={<ShoppingCart/>}/>
              <Route path="orders" element={<Orders/>}/>
            </Route>
            <Route path="/product/:productCode" element={<ProductCard/>}/>
            <Route path="/order/:orderCode" element={<OrderInfo/>}/>
            <Route path="/payment" element={<PaymentReturnPage/>}/>
            <Route path="*" element={<NoMatch/>}/>
          </Routes>
        </BrowserRouter>)}
    </AppRoot>
  )
};

export default App;
