import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, List, Placeholder, Section } from '@xelene/tgui';
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app';

import { useGetProductQuery, useGetProductImageQuery, useAddItemToCartMutation } from '../redux/api.ts';
import Options from '../components/Options.tsx';
import CartIconButton from '../components/CartIconButton.tsx';
import Loading from '../components/Loading.tsx';
import { getVariant } from '../helpers/product.ts';
import { ProductVariant } from '../types/products.ts';

const ProductCard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { productCode } = useParams();
  // TODO: пока только цвет
  const [selectedColor, setSelectedColor] = useState<string>();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();

  const { data: product, isLoading } = useGetProductQuery(productCode!);
  // const { data: image } = useGetProductImageQuery(product?.mainFile.code!, { skip: !product });
  const { data: image } = useGetProductImageQuery(product?.files[0]?.code!, { skip: !product });
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();

  const isTelegram = !!window.Telegram?.WebApp?.initData;

  useEffect(() => {
    if (selectedColor) setSelectedVariant(getVariant(product?.variants ?? [], [selectedColor]));
  }, [selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedColor) {
      window.Telegram.WebApp.showPopup({
        title: 'Ошибка',
        message: 'Не выбран цвет',
      });
      return;
    }

    if (selectedVariant) await addItemToCart(selectedVariant.code);
  }

  if (isLoading || !product) return (
    <Loading/>
  );

  console.log('selectedColor', selectedColor);

  const addButtonText = isAddingToCart
    ? 'Добавляется...'
    : `Добавить за ${selectedVariant ? selectedVariant.price : product.price} ₽`;

  return (
    <>
      {isTelegram && <BackButton onClick={() => navigate(-1)}/>}
      <List>
        <Section>
          <CartIconButton/>
          <Placeholder
            header={product.name}
            description={product.description}
          >
            <img
              alt="Product image"
              src={image}
              style={{
                width: 500
              }}
            />
          </Placeholder>
        </Section>
        <Section header="Опции">
          <Options
            options={product.options}
            selectedColor={selectedColor}
            onColorSelect={setSelectedColor}
          />
          {isTelegram ?
            <MainButton
              text={addButtonText}
              disabled={isAddingToCart}
              onClick={handleAddToCart}
            /> :
            <Button disabled={isAddingToCart} onClick={handleAddToCart}>
              {addButtonText}
            </Button>
          }
        </Section>
      </List>
    </>
  )
}

export default ProductCard;
