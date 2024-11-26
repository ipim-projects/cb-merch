import { configureStore, isRejectedWithValue } from '@reduxjs/toolkit';
import type { Middleware } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query';

import { api } from './api';
import { storeSlice } from "./storeSlice.ts";

export const rtkQueryErrorLogger: Middleware =
  () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      console.warn('We got a rejected action!');
      console.log(action);
      if (window.Telegram?.WebApp?.initData) {
        if ((action.payload as { status: string | number }).status === 401) {
          window.Telegram.WebApp.showPopup({
            message: 'Требуется авторизация'
          });
        } else {
          window.Telegram.WebApp.showPopup({
            title: `Ошибка ${(action.payload as { status: string | number }).status}`,
            message:
              action.payload && typeof action.payload === 'object' && 'data' in action.payload
                ? (action.payload.data as { title: string }).title ?? action.payload.data
                : action.error.message ?? 'Неизвестная ошибка',
          });
        }
      }
    }
    return next(action);
  };

export const reduxStore = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    store: storeSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(rtkQueryErrorLogger).concat(api.middleware),
});

export type RootState = ReturnType<typeof reduxStore.getState>;

setupListeners(reduxStore.dispatch);
