import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Headline, Image, Info, Input, Section, Tappable } from '@xelene/tgui';
import { Icon24Close } from '@xelene/tgui/dist/icons/24/close';

import { useListProductsQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';

const Catalog: React.FunctionComponent = () => {
  const [search, setSearch] = useState('');

  const navigate = useNavigate();

  const { data: products, isLoading } = useListProductsQuery({name: search});

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Каталог товаров</Headline>
      <Section style={{ paddingBottom: '84px' }}>
        <Input
          header='Поиск'
          placeholder='Найти в каталоге'
          value={search}
          onChange={event => setSearch(event.target.value)}
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
            subtitle={product.description}
            before={product.smallFile?.content ? <Image
              size={48}
              src={'data:image/jpeg;base64,' + product.smallFile.content}
            /> : null}
            after={<Info type="text">от {product.price} ₽</Info>}
            onClick={() => navigate(`/product/${product.code}`)}
          >
            {product.name}
          </Cell>
        ))}
      </Section>
    </>
  )
}

export default Catalog;
