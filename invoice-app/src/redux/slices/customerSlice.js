import { fetchProducts } from "./productSlice";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchInvoices } from "./invoiceSlice";
// Fetch all customers
export const fetchCustomers = createAsyncThunk(
  "customers/fetchCustomers",
  async () => {
    const response = await fetch("http://localhost:5000/api/customers");
    return response.json();
  }
);

export const saveCustomer = createAsyncThunk(
  "customers/saveCustomer",
  async (customer, { dispatch }) => {
    const response = await fetch(
      `http://localhost:5000/api/customers/${customer.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      }
    );

    if (response.ok) {
      dispatch(fetchInvoices());
      dispatch(fetchProducts());
      dispatch(fetchCustomers());
    }
    return response.json();
  }
);
export const updateCustomer = createAsyncThunk(
  "customers/updateCustomer",
  async (customer) => {
    const response = await fetch(
      `http://localhost:5000/api/customers/${customer.customer_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      }
    );

    if (response.ok) {
      return customer;
    }
    throw new Error("Failed to update customer");
  }
);
const customerSlice = createSlice({
  name: "customers",
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomers.fulfilled, (state, action) => action.payload)
      .addCase(saveCustomer.fulfilled, (state, action) => {
        const updatedCustomer = action.payload;
        const index = state.findIndex(
          (customer) => customer.id === updatedCustomer.id
        );
        if (index !== -1) {
          state[index] = updatedCustomer;
        }
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        const index = state.findIndex(
          (cust) => cust.customer_id === action.payload.customer_id
        );
        if (index !== -1) {
          state[index] = action.payload;
        }
      });
  },
});

export default customerSlice.reducer;
// export { saveCustomer };
