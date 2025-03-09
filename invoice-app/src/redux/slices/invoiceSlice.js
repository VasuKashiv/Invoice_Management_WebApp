import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchProducts } from "./productSlice";
import { fetchCustomers } from "./customerSlice";

// Fetch all invoices
export const fetchInvoices = createAsyncThunk(
  "invoices/fetchInvoices",
  async () => {
    const response = await fetch("http://localhost:5000/api/invoices");
    return response.json();
  }
);

// Save an invoice and refresh all data
export const saveInvoice = createAsyncThunk(
  "invoices/saveInvoice",
  async (invoice, { dispatch }) => {
    const response = await fetch(
      `http://localhost:5000/api/invoices/${invoice.invoice_number}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      }
    );

    if (response.ok) {
      dispatch(fetchInvoices()); // ✅ Refresh invoices
      dispatch(fetchProducts()); // ✅ Refresh products
      dispatch(fetchCustomers()); // ✅ Refresh customers
    }
    return response.json();
  }
);

// Upload file and refresh data
// export const uploadInvoiceFile = createAsyncThunk(
//   "invoices/uploadInvoiceFile",
//   async (file, { dispatch }) => {
//     const formData = new FormData();
//     formData.append("file", file);

//     const response = await fetch("http://localhost:5000/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     if (response.ok) {
//       dispatch(fetchInvoices()); // ✅ Refresh invoices
//       dispatch(fetchProducts()); // ✅ Refresh products
//       dispatch(fetchCustomers()); // ✅ Refresh customers
//     }
//     return response.json();
//   }
// );

// const invoiceSlice = createSlice({
//   name: "invoices",
//   initialState: [],
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchInvoices.fulfilled, (state, action) => action.payload)
//       .addCase(saveInvoice.fulfilled, (state, action) => {
//         // ✅ Update Redux state immediately for real-time UI update
//         const updatedInvoice = action.payload;
//         const index = state.findIndex(
//           (invoice) => invoice.invoice_number === updatedInvoice.invoice_number
//         );
//         if (index !== -1) {
//           state[index] = updatedInvoice;
//         }
//       })
//       .addCase(uploadInvoiceFile.fulfilled, (state, action) => {});
//   },
// });
export const uploadInvoiceFile = createAsyncThunk(
  "invoices/uploadInvoiceFile",
  async (file, { dispatch }) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      dispatch(fetchInvoices()); // ✅ Refresh invoices
      dispatch(fetchProducts()); // ✅ Refresh products
      dispatch(fetchCustomers()); // ✅ Refresh customers
    }
    return response.json();
  }
);

// ✅ Update invoice in MongoDB when edited
export const updateInvoice = createAsyncThunk(
  "invoices/updateInvoice",
  async (invoice) => {
    const response = await fetch(
      `http://localhost:5000/api/invoices/${invoice.invoice_number}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoice),
      }
    );

    if (response.ok) {
      return invoice; // Return updated invoice to update state
    }
    throw new Error("Failed to update invoice");
  }
);

const invoiceSlice = createSlice({
  name: "invoices",
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.fulfilled, (state, action) => action.payload)
      .addCase(saveInvoice.fulfilled, (state, action) => {})
      .addCase(uploadInvoiceFile.fulfilled, (state, action) => {})
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.findIndex(
          (inv) => inv.invoice_number === action.payload.invoice_number
        );
        if (index !== -1) {
          state[index] = action.payload;
        }
      }); //
  },
});

export default invoiceSlice.reducer;
// export { saveInvoice, uploadInvoiceFile };
