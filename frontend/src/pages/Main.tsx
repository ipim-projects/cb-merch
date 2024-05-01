import React, { useState } from 'react';

import { FixedLayout, Tabbar } from '@xelene/tgui';
import { Icon32ProfileColoredSquare } from '@xelene/tgui/dist/icons/32/profile_colored_square';
import { Icon20Copy } from '@xelene/tgui/dist/icons/20/copy';
import { Icon28Archive } from '@xelene/tgui/dist/icons/28/archive';
import Catalog from '../pages/Catalog.tsx';

const tabs = [
  { id: 1, text: 'Каталог', icon: <Icon32ProfileColoredSquare/> },
  { id: 2, text: 'Корзина', icon: <Icon20Copy/> },
  { id: 3, text: 'История', icon: <Icon28Archive/> },
]

const Main: React.FunctionComponent = () => {

  const [currentTab, setCurrentTab] = useState(tabs[0].id);
  return (
    <>
      <Catalog/>
      <FixedLayout style={{
        padding: 16
      }}>
        <Tabbar>
          {tabs.map(({ id, text, icon }) => <Tabbar.Item
              key={id}
              text={text}
              selected={id === currentTab}
              onClick={() => setCurrentTab(id)}
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
