import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoryReducer from "./slices/categorySlice";
import documentTypeReducer from './slices/documetTypeSlice';
import subcategoryReducer from "./slices/subcategories"
import serviceSliceReducer from "./slices/serviceSlice"
import gharbetiSliceReducer from "./slices/gharbetislice"
import servicesSliceReducerRealWala from "./slices/servicesSlice"
// import allServiceReducer from "./slices/serviceallSlice"

import allServiceReducer from "./slices/serviceallSlice"
export const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    document: documentTypeReducer,
    service: serviceSliceReducer,
    subcategory: subcategoryReducer,
    gharbeti: gharbetiSliceReducer,
    allServices: allServiceReducer,
    servicesReal: servicesSliceReducerRealWala

  },
});