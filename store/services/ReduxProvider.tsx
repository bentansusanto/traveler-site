"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../store";
import { fetchExchangeRate } from "../slices/currencySlice";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(fetchExchangeRate());
  }, []);

  return <Provider store={store}>{children}</Provider>;
}