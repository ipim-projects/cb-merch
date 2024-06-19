import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Headline, Image, Info, Input, Pagination, Section, Tappable } from '@telegram-apps/telegram-ui';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

import { PAGE_SIZE_DEFAULT, useListProductsQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';

const Catalog: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: products, isLoading } = useListProductsQuery({ pageIndex: currentPage, name: search });

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
            subtitle={<span style={{ whiteSpace: 'normal' }}>{product.description}</span>}
            before={product.smallFile?.content ? <Image
              size={48}
              src={'data:image/jpeg;base64,' + product.smallFile.content}
            /> : null}
            after={<Info type="text">
              <span style={{ whiteSpace: 'nowrap' }}>от {product.price} ₽</span>
            </Info>
            }
            onClick={() => navigate(`/product/${product.code}`)}
          >
            {product.name}
          </Cell>
        ))}
        {!!products && (products.totalCount ?? 0) > 25 && <Section.Footer centered>
          <Pagination
            count={Math.ceil(products.totalCount / PAGE_SIZE_DEFAULT)}
            onChange={(_, page: number) => {
              setCurrentPage(page);
            }}
          />
        </Section.Footer>
        }
      </Section>
    </>
  )
}

export default Catalog;
