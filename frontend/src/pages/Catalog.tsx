import React, { useState } from 'react';
import { Cell, Headline, Image, Input, Section, Tappable } from '@xelene/tgui';
import { Icon24Close } from '@xelene/tgui/dist/icons/24/close';
import { useListProductsQuery } from '../redux/api.ts';

const Catalog: React.FunctionComponent = () => {
  const [search, setSearch] = useState('')

  const { data: products, isLoading } = useListProductsQuery({});
  console.log(products);

  return (
    <>
      {/*<List style={{
        width: 500,
        maxWidth: '100%',
        margin: 'auto',
        background: 'var(--tgui--secondary_bg_color)'
      }}>*/}
      <Headline style={{ padding: '0 24px' }}>Каталог товаров</Headline>
      <Section style={{ paddingBottom: '84px' }}>
        <Input
          header='Поиск'
          placeholder='Найти в каталоге'
          value={search}
          onChange={e => setSearch(e.target.value)}
          after={
            <Tappable
              Component='div'
              style={{ display: 'flex' }}
              onClick={() => setSearch('')}>
              <Icon24Close/>
            </Tappable>
          }/>
        {products?.items.map((product, index) => (
          <Cell
            key={index}
            before={<Image
              fallbackIcon={<span>😕</span>}
              size={96}
              src="https://avatars.githubusercontent.com/u/84640980?v=4"
            />}>
            {product.name}
          </Cell>
        ))}
      </Section>
      {/*</List>*/}
    </>
  )
}

export default Catalog;
