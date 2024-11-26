import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import { reduxStore } from './redux/store';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Provider store={reduxStore}>
      <App/>
    </Provider>
  </React.StrictMode>
);
