import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cell, Headline, Image, Info, Input, Section, Spinner, Tappable } from '@xelene/tgui';
import { Icon24Close } from '@xelene/tgui/dist/icons/24/close';

import { useListProductsQuery, useLazyGetProductImageQuery } from '../redux/api.ts';
import Loading from '../components/Loading.tsx';

const Catalog: React.FunctionComponent = () => {
  const [search, setSearch] = useState('');
  const [images, setImages] = useState<{ [key: string]: string | undefined }>({});

  const navigate = useNavigate();

  const { data: products, isLoading, isSuccess } = useListProductsQuery({});
  const [imageQueryTrigger] = useLazyGetProductImageQuery();

  useEffect(() => {
    const fetchProductImages = async (codes: string[]) => {
      for (const fileCode of codes) {
        const { data: image } = await imageQueryTrigger(fileCode, true);
        setImages((prev) => {
          const result = { ...prev };
          result[`${fileCode}`] = image;
          return result;
        });
      }
    }

    if (!isSuccess) return;
    console.log('products', products);
    const fileCodes = products?.items
      .filter(product => product.mainFile)
      .map(product => product.mainFile.code);
    console.log('fileCodes', fileCodes);

    fetchProductImages(fileCodes);
  }, [isSuccess]);

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
              fallbackIcon={<Spinner size="s"/>}
              size={48}
              src={
                product.mainFile?.code && images[product.mainFile.code]
                  ? images[product.mainFile.code]
                  // : 'https://avatars.githubusercontent.com/u/84640980?v=4'
                  : ''
              }
            />}
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
