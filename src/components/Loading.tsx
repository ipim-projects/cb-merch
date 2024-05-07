import React from 'react';
import { Placeholder, Spinner } from '@xelene/tgui';

const Loading: React.FunctionComponent = () => (
  <>
    <Placeholder
      description="Загрузка..."
    >
      <Spinner size="l"/>
    </Placeholder>
  </>
);

export default Loading;
