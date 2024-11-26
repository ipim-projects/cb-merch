import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StoreInfo } from '../types/common.ts';
import { DeliveryType } from '../types/delivery.ts';

const initialState: StoreInfo = {
  code: "Logobaze",
  name: "Logobaze",
  deliveryTypes: [DeliveryType.BOXBERRY_PVZ, DeliveryType.POST_PVZ],
  batchEnabled: false,
}

export const storeSlice = createSlice({
  name: 'store',
  initialState,
  reducers: {
    setSelectedStore: (state, action: PayloadAction<StoreInfo>) => {
      state.code = action.payload.code;
      state.name = action.payload.name;
      state.deliveryTypes = [...action.payload.deliveryTypes];
      state.batchEnabled = action.payload.batchEnabled;
    },
  },
});

export const { setSelectedStore } = storeSlice.actions;
