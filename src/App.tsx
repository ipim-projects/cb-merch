import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useHapticFeedback, useShowPopup } from '@vkruglikov/react-telegram-web-app';

import Main from './pages/Main';
import ProductCard from './pages/ProductCard';

import '@xelene/tgui/dist/styles.css';
// import { AppRoot } from '@xelene/tgui';

const App = () => {
  const showPopup = useShowPopup();
  const [_impactOccurred, notificationOccurred, _selectionChanged] = useHapticFeedback();
  const [isInvalidVersion, setIsInvalidVersion] = useState(false);

  useEffect(() => {
    if (window.Telegram?.WebApp?.initData) {
      if (!window.Telegram.WebApp.isVersionAtLeast('6.9')) {
        notificationOccurred('error');
        if (window.Telegram.WebApp.isVersionAtLeast('6.2')) {
          showPopup({ message: 'Please update your Telegram app to the latest version to use this app.' });
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
      // window.Telegram.WebApp.expand();
      console.log(`initData: ${window.Telegram.WebApp.initData}`);
      // showPopup({ message: `initData: ${tgWebApp.initData.slice(0, 50)}` });
    }
  }, [])

  return (
    <>
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
            <Route path='/' element={<Main/>}/>
            <Route path='/product/:productCode' element={<ProductCard/>}/>
            {/*<Route path='/cart' element={<ShoppingCart/>}/>*/}
          </Routes>
        </BrowserRouter>)}
    </>
  )
};

export default App;
