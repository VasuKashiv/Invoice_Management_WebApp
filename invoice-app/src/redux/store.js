import { configureStore } from "@reduxjs/toolkit";
import invoiceReducer from "./slices/invoiceSlice";
import productReducer from "./slices/productSlice";
import customerReducer from "./slices/customerSlice";

export default configureStore({
  reducer: {
    invoices: invoiceReducer,
    products: productReducer,
    customers: customerReducer,
  },
});
