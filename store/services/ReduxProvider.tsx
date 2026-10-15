"use client";

import React, { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "../store";
import { fetchExchangeRate, setCurrency } from "../slices/currencySlice";
import { useLocale } from "next-intl";

function CurrencyLocaleSync() {
  const locale = useLocale();
  const dispatch = useDispatch();
  const currentCurrency = useSelector((state: any) => state.currency);

  useEffect(() => {
    const expectedCurrency = locale === "id" ? "IDR" : locale === "tr" ? "TRY" : "USD";
    if (currentCurrency?.code !== expectedCurrency) {
      dispatch(setCurrency(expectedCurrency));
    }
  }, [locale, currentCurrency?.code, dispatch]);

  return null;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(fetchExchangeRate());
  }, []);

  return (
    <Provider store={store}>
      <CurrencyLocaleSync />
      {children}
    </Provider>
  );
}