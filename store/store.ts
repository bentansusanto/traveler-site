import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { authService } from "./services/auth.service";
import { bookTourService } from "./services/book-tour.service";
import { destinationService } from "./services/destination.service";
import { locationService } from "./services/location.service";
import authReducer from "./slices/authSlice";
import currencyReducer from "./slices/currencySlice";
import uiReducer from "./slices/uiSlice";
import { touristService } from "./services/tourist.service";
import { paymentService } from "./services/payment.service";

export const store = configureStore({
  reducer: {
    [authService.reducerPath]: authService.reducer,
    [destinationService.reducerPath]: destinationService.reducer,
    [locationService.reducerPath]: locationService.reducer,
    [bookTourService.reducerPath]: bookTourService.reducer,
    [touristService.reducerPath]: touristService.reducer,
    [paymentService.reducerPath]: paymentService.reducer,
    auth: authReducer,
    currency: currencyReducer,
    ui: uiReducer
  },
  middleware: (get) =>
    get().concat(
      authService.middleware,
      destinationService.middleware,
      locationService.middleware,
      bookTourService.middleware,
      touristService.middleware,
      paymentService.middleware
    )
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
