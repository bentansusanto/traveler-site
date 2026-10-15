import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";

export const fetchExchangeRate = createAsyncThunk(
  "currency/fetchRate",
  async () => {
    try {
      const response = await fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=IDR,TRY");
      const data = await response.json();
      return {
        IDR: data.rates.IDR,
        TRY: data.rates.TRY,
        USD: 1
      };
    } catch (error) {
      console.error("Failed to fetch exchange rate:", error);
      return { IDR: 16000, TRY: 35, USD: 1 }; // Fallback rates
    }
  }
);

interface CurrencyState {
  code: string;
  symbol: string;
  idrToUsdRate: number;
  rates: any;
  loading: boolean;
}

const initialState: CurrencyState = {
  code: "IDR",
  symbol: "Rp",
  idrToUsdRate: 16761, // Deprecated name, actually stores the current currency's rate vs USD
  rates: { IDR: 16761, TRY: 47, USD: 1 },
  loading: false,
};

export const currencySlice = createSlice({
  name: "currency",
  initialState,
  reducers: {
    setCurrency: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
      state.symbol = action.payload === "IDR" ? "Rp" : action.payload === "TRY" ? "₺" : "US$";
      state.idrToUsdRate = (state.rates as any)[action.payload] || 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExchangeRate.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchExchangeRate.fulfilled, (state, action) => {
        state.loading = false;
        state.rates = action.payload;
        state.idrToUsdRate = action.payload[state.code as keyof typeof action.payload] || 1;
      })
      .addCase(fetchExchangeRate.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setCurrency } = currencySlice.actions;
export default currencySlice.reducer;