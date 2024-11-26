import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Accordion,
  Cell,
  Headline,
  Image,
  Info,
  Input,
  Pagination,
  Section, Selectable,
  Tappable, Tooltip
} from '@telegram-apps/telegram-ui';
import { Icon24Close } from '@telegram-apps/telegram-ui/dist/icons/24/close';

import {
  PAGE_SIZE_DEFAULT,
  useGetShoppingCartInfoQuery,
  useListProductsQuery,
  useListStoresQuery
} from '../redux/api.ts';
import Loading from '../components/Loading.tsx';
import { RootState } from '../redux/store.ts';
import { setSelectedStore } from '../redux/storeSlice.ts';

const Catalog: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [tooltipShown, setTooltipShown] = useState(false);

  const storeName = useSelector((state: RootState) => state.store.name);
  const storeCode = useSelector((state: RootState) => state.store.code);
  const dispatch = useDispatch();
  const { data: storeList } = useListStoresQuery();
  const { data: cartInfo, isLoading: isCartInfoLoading } = useGetShoppingCartInfoQuery();
  const { data: products, isLoading } = useListProductsQuery({ pageIndex: currentPage, name: search, storeCode });

  useEffect(() => {
    if (!isCartInfoLoading && cartInfo && cartInfo.productsCount > 0 && storeList) {
      const storeInfo = storeList.find(item => item.code === cartInfo.storeCode);
      if (!storeInfo) return;
      dispatch(setSelectedStore({
        code: storeInfo.code,
        name: storeInfo.name,
        deliveryTypes: storeInfo.deliveryTypes,
        batchEnabled: storeInfo.batchEnabled,
      }))
    }
  }, [cartInfo]);

  if (isLoading) return (
    <Loading/>
  );

  return (
    <>
      <Headline style={{ padding: '0 24px' }}>Каталог товаров</Headline>
      {!isCartInfoLoading && cartInfo?.productsCount === 0 ?
        <Accordion
          onChange={() => setExpanded(!expanded)}
          expanded={expanded}
        >
          <Accordion.Summary>
            <Cell subhead="Выбранный магазин">
              {storeName}
            </Cell>
          </Accordion.Summary>
          <Accordion.Content>
            {storeList?.map((storeInfo, index) => (
              <Cell key={index}
                    Component="label"
                    before={<Selectable defaultChecked={storeInfo.code === storeCode}
                                        name="group"
                                        value={storeInfo.code}
                                        onChange={() => dispatch(setSelectedStore({
                                          code: storeInfo.code,
                                          name: storeInfo.name,
                                          deliveryTypes: storeInfo.deliveryTypes,
                                          batchEnabled: storeInfo.batchEnabled,
                                        }))}/>
                    }>
                {storeInfo.name}
              </Cell>
            ))}
          </Accordion.Content>
        </Accordion> :
        <Section>
          <Cell subhead="Выбранный магазин" disabled ref={ref} onClick={() => setTooltipShown(!tooltipShown)}>
            {storeName}
          </Cell>
          {tooltipShown && (
            <Tooltip targetRef={ref}>
              Для смены магазина необходимо очистить корзину
            </Tooltip>
          )}
        </Section>
      }
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
