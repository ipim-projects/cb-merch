import React, { useRef, useState } from 'react';
import { useGetShoppingCartInfoQuery } from '../redux/api.ts';
import { Tooltip } from '@xelene/tgui';
import { AvatarBadge } from '@xelene/tgui/dist/components/Blocks/Avatar/components/AvatarBadge/AvatarBadge';
import { CardChip } from '@xelene/tgui/dist/components/Blocks/Card/components/CardChip/CardChip';

import IconButtonRef from '../components/IconButtonRef.tsx';
import { IconCart } from '../icons/cart.tsx';

const CartIconButton: React.FunctionComponent = () => {
  const ref = useRef(null);
  const [tooltipShown, setTooltipShown] = useState(false);
  const { data: cartInfo, isLoading } = useGetShoppingCartInfoQuery();

  return (
    <CardChip readOnly>
      <IconButtonRef disabled={isLoading} ref={ref} mode="plain" size="m" onClick={() => setTooltipShown(!tooltipShown)}>
        {cartInfo?.productsCount && <AvatarBadge style={{right: -6}} type="number">{cartInfo.productsCount}</AvatarBadge>}
        <IconCart/>
      </IconButtonRef>
      {tooltipShown && (
        <Tooltip targetRef={ref}>
          Товаров в корзине: {cartInfo?.productsCount ?? 0}
        </Tooltip>
      )}
    </CardChip>
  )
}

export default CartIconButton;
