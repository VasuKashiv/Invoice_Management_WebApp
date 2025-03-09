import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchInvoices } from "./invoiceSlice";
import { fetchCustomers } from "./customerSlice";
const API_BASE_URL = process.env.API_BASE_URL;
// Fetch all products
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async () => {
    const response = await fetch(`${API_BASE_URL}/api/products`);
    return response.json();
  }
);

export const saveProduct = createAsyncThunk(
  "products/saveProduct",
  async (product, { dispatch }) => {
    const response = await fetch(`${API_BASE_URL}/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });

    if (response.ok) {
      dispatch(fetchInvoices());
      dispatch(fetchProducts());
      dispatch(fetchCustomers());
    }
    return response.json();
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async (product) => {
    const response = await fetch(
      `${API_BASE_URL}/api/products/${product.product_id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      }
    );

    if (response.ok) {
      return product;
    }
    throw new Error("Failed to update product");
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: [],
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.fulfilled, (state, action) => action.payload)
      .addCase(saveProduct.fulfilled, (state, action) => {
        const updatedProduct = action.payload;
        const index = state.findIndex(
          (product) =>
            product.id === updatedProduct.id ||
            product._id === updatedProduct._id
        );
        if (index !== -1) {
          state[index] = updatedProduct;
        } else {
          state.push(updatedProduct); // ✅ If new product, add to state
        }
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.findIndex(
          (prod) => prod.product_id === action.payload.product_id
        );
        if (index !== -1) {
          state[index] = action.payload;
        }
      });
  },
});

export default productSlice.reducer;
// export { fetchProducts, saveProduct };
