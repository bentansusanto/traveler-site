import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  hasNewBooking: boolean;
}

const initialState: UIState = {
  hasNewBooking: false
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setHasNewBooking: (state, action: PayloadAction<boolean>) => {
      state.hasNewBooking = action.payload;
    }
  }
});

export const { setHasNewBooking } = uiSlice.actions;
export default uiSlice.reducer;
