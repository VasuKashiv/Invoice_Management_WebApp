import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchInvoices } from "../redux/slices/invoiceSlice";
import { fetchProducts } from "../redux/slices/productSlice";
import { fetchCustomers } from "../redux/slices/customerSlice";

const DataFetcher = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    fetch("http://localhost:5000/api/status")
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
