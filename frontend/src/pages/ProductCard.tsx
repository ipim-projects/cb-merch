import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, Button, Info, List, Placeholder, Section, Snackbar } from '@telegram-apps/telegram-ui';
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app';
import { isEmpty } from 'ramda';

import { useGetProductQuery, useGetProductImageQuery, useAddItemToCartMutation } from '../redux/api.ts';
import Options from '../components/Options.tsx';
import CartIconButton from '../components/CartIconButton.tsx';
import Loading from '../components/Loading.tsx';
import { BatchStatus, BatchStatusType, ProductVariant } from '../types/products.ts';

const ProductCard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { productCode } = useParams();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);

  const { data: product, isLoading, isSuccess } = useGetProductQuery(productCode!);
  const { data: image } = useGetProductImageQuery(
    product?.files.find(file => file.isMain)?.code!,
    { skip: !product || !product.files || isEmpty(product.files) }
  );
  const [addItemToCart, { isLoading: isAddingToCart }] = useAddItemToCartMutation();

  const isTelegram = !!window.Telegram?.WebApp?.initData;

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addItemToCart(selectedVariant.code);
    setIsSnackbarShown(true);
  }

  useEffect(() => {
    // в случае единственного варианта товара
    if (isSuccess && isEmpty(product.options) && product.variants.length === 1) setSelectedVariant(product.variants[0]);
  }, [isSuccess]);

  if (isLoading || !product) return (
    <Loading/>
  );

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
            {image && <img
              alt="Product image"
              src={image}
              style={{
                width: '100%',
                maxWidth: 1280,
              }}
            />}
          </Placeholder>
        </Section>
        {selectedVariant?.currentBatch && <Section>
          <Accordion onChange={() => setIsAccordionExpanded(!isAccordionExpanded)} expanded={isAccordionExpanded}>
            <Accordion.Summary>Текущая партия</Accordion.Summary>
            <Accordion.Content>
              <Info type="text">
                Минимальное количество в партии: {selectedVariant.currentBatch.batchSize} шт.
              </Info>
              <Info type="text">
                Уже набранное и оплаченное количество: {selectedVariant.currentBatch.totalCountPaid} шт.
              </Info>
              <Info type="text">
                Статус партии: {BatchStatus[selectedVariant.currentBatch.batchStatus as BatchStatusType]}
              </Info>
            </Accordion.Content>
          </Accordion>
        </Section>}
        {!isEmpty(product.options) && product.variants.length > 0 && <Options
          options={product.options}
          variants={product.variants}
          onOptionSelect={setSelectedVariant}
        />}
        {isSnackbarShown && (
          <Snackbar
            description={`${product.name}`}
            children="Товар добавлен в корзину"
            onClose={() => setIsSnackbarShown(false)}
            after={(
              <Snackbar.Button onClick={() => navigate('/cart')}>
                В корзину
              </Snackbar.Button>
            )}
          />
        )}
        {!isAddingToCart && selectedVariant && <>
          {isTelegram ?
            <MainButton
              text={addButtonText}
              disabled={isAddingToCart || !selectedVariant}
              onClick={handleAddToCart}
            /> :
            <Button disabled={isAddingToCart || !selectedVariant} onClick={handleAddToCart}>
              {addButtonText}
            </Button>
          }
        </>
        }
      </List>
    </>
  )
}

export default ProductCard;
