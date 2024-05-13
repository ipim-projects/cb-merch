import React, { useState } from 'react';
import { FixedLayout, Tabbar } from '@xelene/tgui';
import { Icon32ProfileColoredSquare } from '@xelene/tgui/dist/icons/32/profile_colored_square';
import { Icon28Archive } from '@xelene/tgui/dist/icons/28/archive';

import Catalog from '../pages/Catalog';
import ShoppingCart from '../pages/ShoppingCart';
import Orders from '../pages/Orders.tsx';
import { IconCart } from '../icons/cart.tsx';

const tabs = [
  { id: 'catalog-tab', text: 'Каталог', icon: <Icon32ProfileColoredSquare/>, component: <Catalog/> },
  { id: 'cart-tab', text: 'Корзина', icon: <IconCart/>, component: <ShoppingCart/> },
  { id: 'orders-tab', text: 'Заказы', icon: <Icon28Archive/>, component: <Orders/> },
]

const getTabComponent = (id: string) => tabs.find(tab => tab.id === id)?.component ?? <Catalog/>;

const Main: React.FunctionComponent = () => {
  const [currentTab, setCurrentTab] = useState(tabs[0].id);

  return (
    <>
      {getTabComponent(currentTab)}
      <FixedLayout style={{
        padding: 16
      }}>
        <Tabbar>
          {tabs.map(({ id, text, icon }) => <Tabbar.Item
              key={id}
              text={text}
              selected={id === currentTab}
              onClick={() => {
                setCurrentTab(id);
              }}
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
