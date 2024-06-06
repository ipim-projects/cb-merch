import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FixedLayout, Tabbar } from '@telegram-apps/telegram-ui';
import { Icon32ProfileColoredSquare } from '@telegram-apps/telegram-ui/dist/icons/32/profile_colored_square';
import { Icon28Archive } from '@telegram-apps/telegram-ui/dist/icons/28/archive';

import { IconCart } from '../icons/cart.tsx';

interface Tab {
  id: string;
  path: string,
  text: string;
  icon: React.JSX.Element;
}

const tabs: Tab[] = [
  { id: 'catalog-tab', path: '/catalog', text: 'Каталог', icon: <Icon32ProfileColoredSquare/> },
  { id: 'cart-tab', path: '/cart', text: 'Корзина', icon: <IconCart/> },
  { id: 'orders-tab', path: '/orders', text: 'Заказы', icon: <Icon28Archive/> },
];

const Main: React.FunctionComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Outlet/>
      <FixedLayout style={{ padding: 16 }}>
        <Tabbar>
          {tabs.map(({ id, path, text, icon }) => <Tabbar.Item
              key={id}
              text={text}
              selected={path === location.pathname}
              onClick={() => navigate(path)}
            >
              {icon}
            </Tabbar.Item>
          )}
        </Tabbar>
      </FixedLayout>
    </>
  )
}

export default Main;
