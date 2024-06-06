import React from 'react';
import { Placeholder, Spinner } from '@telegram-apps/telegram-ui';

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
