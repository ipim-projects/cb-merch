import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Accordion, Button, Info, List, Placeholder, Section, Snackbar } from '@telegram-apps/telegram-ui';
import { BackButton, MainButton } from '@vkruglikov/react-telegram-web-app';
import { ButtonBack, ButtonNext, CarouselProvider, DotGroup, Image, Slide, Slider } from 'pure-react-carousel';
import 'pure-react-carousel/dist/react-carousel.es.css';
import { isEmpty } from 'ramda';
import parse from 'html-react-parser';

import { useAddItemToCartMutation, useGetProductImagesQuery, useGetProductQuery } from '../redux/api.ts';
import Options from '../components/Options.tsx';
import Loading from '../components/Loading.tsx';
import { BatchStatus, BatchStatusType, ProductVariant } from '../types/products.ts';
import CartIconButton from '../components/CartIconButton.tsx';
import styles from './ProductCard.module.css';

const ProductCard: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { productCode } = useParams();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>();
  const [isSnackbarShown, setIsSnackbarShown] = useState(false);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);

  const { data: product, isLoading, isSuccess } = useGetProductQuery(productCode!);
  const { data: images } = useGetProductImagesQuery(productCode!);
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
      <CartIconButton/>
      <List>
        <Section>
          {images && <CarouselProvider
            naturalSlideWidth={1280}
            naturalSlideHeight={720}
            totalSlides={images.length}
          >
            <div className={styles.container}>
              <Slider>
                {images?.map((image, index) => (
                  <Slide index={index}>
                    <Image src={'data:image/jpeg;base64,' + image.content} hasMasterSpinner/>
                  </Slide>
                ))}
              </Slider>
              <ButtonBack className={styles.buttonBack}>{'<'}</ButtonBack>
              <ButtonNext className={styles.buttonNext}>{'>'}</ButtonNext>
            </div>
            <DotGroup className={styles.dotGroup}/>
          </CarouselProvider>}
          <Placeholder
            header={product.name}
            description={parse(product.fullDescription)}
          />
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
