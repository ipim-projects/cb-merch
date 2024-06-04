import React from 'react';
import { useNavigate } from 'react-router-dom';

import { AvatarBadge } from '@xelene/tgui/dist/components/Blocks/Avatar/components/AvatarBadge/AvatarBadge';
import { CardChip } from '@xelene/tgui/dist/components/Blocks/Card/components/CardChip/CardChip';

import { useGetShoppingCartInfoQuery } from '../redux/api.ts';
import IconButtonRef from '../components/IconButtonRef.tsx';
import { IconCart } from '../icons/cart.tsx';

const CartIconButton: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const { data: cartInfo, isLoading } = useGetShoppingCartInfoQuery();

  return (
    <CardChip readOnly>
      <IconButtonRef disabled={isLoading} mode="plain" size="s" onClick={() => navigate('/cart')}>
        {cartInfo && <AvatarBadge style={{right: -6}} type="number">{cartInfo?.productsCount ?? 0}</AvatarBadge>}
        <IconCart/>
      </IconButtonRef>
    </CardChip>
  )
}

export default CartIconButton;
