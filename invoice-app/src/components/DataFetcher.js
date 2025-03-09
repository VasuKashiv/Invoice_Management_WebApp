import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchInvoices } from "../redux/slices/invoiceSlice";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchCustomers } from "../redux/slices/customerSlice";
const API_BASE_URL = process.env.API_BASE_URL;
const DataFetcher = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/status`)
      .then((res) => res.json())
      .then((data) => console.log("Backend Status:", data))
      .catch((err) => console.error("Error connecting to backend:", err));

    dispatch(fetchInvoices());
    dispatch(fetchProducts());
    dispatch(fetchCustomers());
  }, [dispatch]);

  return null; // No UI needed
};

export default DataFetcher;
