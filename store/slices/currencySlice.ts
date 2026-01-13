import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchExchangeRate = createAsyncThunk(
  "currency/fetchRate",
  async () => {
    try {
      const response = await fetch("https://api.frankfurter.app/latest?from=IDR&to=USD");
      const data = await response.json();
      return data.rates.USD;
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return 1 / 16000; // Fallback rate (IDR to USD)
    }
  }
);

interface CurrencyState {
  code: string;
  symbol: string;
  idrToUsdRate: number;
  loading: boolean;
}

const initialState: CurrencyState = {
  code: "IDR",
  symbol: "Rp",
  idrToUsdRate: 1 / 16761, // Default based on user preference
  loading: false,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
      state.symbol = action.payload === "IDR" ? "Rp" : "US$";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.idrToUsdRate = action.payload;
      })
      .addCase(fetchExchangeRate.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;