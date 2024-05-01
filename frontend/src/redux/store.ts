import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query';

import { api } from './api';

export const rtkQueryErrorLogger: Middleware =
  () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.warn('We got a rejected action!');
      console.log(action);
      if (window.Telegram?.WebApp?.initData) {
        window.Telegram.WebApp.showPopup({
          title: `Error ${action.error.code}`,
          message:
            'data' in action.error
              ? (action.error.data as { message: string }).message
              : action.error.message ?? 'Unknown error occurred',
        });
      }
    }
    return next(action);
  };

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rtkQueryErrorLogger).concat(api.middleware),
});

setupListeners(store.dispatch);
