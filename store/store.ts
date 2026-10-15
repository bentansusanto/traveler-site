import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { customerService } from "./services/customer.service";
import { bookTourService } from "./services/book-tour.service";
import { destinationService } from "./services/destination.service";
import { locationService } from "./services/location.service";
import authReducer from "./slices/authSlice";
import currencyReducer from "./slices/currencySlice";
import uiReducer from "./slices/uiSlice";
import { touristService } from "./services/tourist.service";
import { paymentService } from "./services/payment.service";
import { profileService } from "./services/profile.service";
import { rolesService } from "./services/role.service";
import { motorService } from "./services/motor.service";
import { bookMotorService } from "./services/book-motor.service";
import { addOnsService } from "./services/add-ons.service";
import { itineraryService } from "./services/itinerary.service";
import { bookerService } from "./services/booker.service";
import { entertainmentAttractionService } from "./services/entertainment-attraction.service";
import { bookEntertainmentAttractionService } from "./services/book-entertainment-attraction.service";
import { documentVisaService } from "./services/document-visa.service";
import { bookDocumentVisaService } from "./services/book-document-visa.service";

export const store = configureStore({
  reducer: {
    [customerService.reducerPath]: customerService.reducer,
    [destinationService.reducerPath]: destinationService.reducer,
    [locationService.reducerPath]: locationService.reducer,
    [bookTourService.reducerPath]: bookTourService.reducer,
    [touristService.reducerPath]: touristService.reducer,
    [paymentService.reducerPath]: paymentService.reducer,
    [profileService.reducerPath]: profileService.reducer,
    [rolesService.reducerPath]: rolesService.reducer,
    [motorService.reducerPath]: motorService.reducer,
    [bookMotorService.reducerPath]: bookMotorService.reducer,
    [entertainmentAttractionService.reducerPath]: entertainmentAttractionService.reducer,
    [bookEntertainmentAttractionService.reducerPath]: bookEntertainmentAttractionService.reducer,
    [documentVisaService.reducerPath]: documentVisaService.reducer,
    [bookDocumentVisaService.reducerPath]: bookDocumentVisaService.reducer,
    [addOnsService.reducerPath]: addOnsService.reducer,
    [itineraryService.reducerPath]: itineraryService.reducer,
    [bookerService.reducerPath]: bookerService.reducer,
    auth: authReducer,
    currency: currencyReducer,
    ui: uiReducer
  },
  middleware: (get) =>
    get().concat(
      customerService.middleware,
      destinationService.middleware,
      locationService.middleware,
      bookTourService.middleware,
      touristService.middleware,
      paymentService.middleware,
      profileService.middleware,
      rolesService.middleware,
      motorService.middleware,
      bookMotorService.middleware,
      entertainmentAttractionService.middleware,
      bookEntertainmentAttractionService.middleware,
      documentVisaService.middleware,
      bookDocumentVisaService.middleware,
      addOnsService.middleware,
      itineraryService.middleware,
      bookerService.middleware
    )
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
