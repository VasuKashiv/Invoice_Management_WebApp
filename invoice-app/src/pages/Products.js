import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchProducts,
  saveProduct,
  updateProduct,
} from "../redux/slices/productSlice";

const Products = () => {
  const dispatch = useDispatch();
  const products = useSelector((state) => state.products) || [];

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const handleEdit = (product, field, value) => {
    const updatedProduct = { ...product, [field]: value };
    dispatch(updateProduct(updatedProduct)); // ✅ Update Redux & MongoDB
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-xl">
      <h2 className="text-xl font-bold mb-4">Products</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">Tax (%)</th>
            <th className="border p-2">Price with Tax</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">
                <input
                  type="text"
                  defaultValue={product.product_name || "---"}
                  onBlur={(e) =>
                    handleEdit(product, "product_name", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={product.quantity || 0}
                  onBlur={(e) =>
                    handleEdit(product, "quantity", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={parseFloat(product.unit_price || 0).toFixed(2)}
                  onBlur={(e) =>
                    handleEdit(product, "unit_price", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={product.tax || 5}
                  onBlur={(e) => handleEdit(product, "tax", e.target.value)}
                  className="w-full border-none bg-transparent focus:outline-none"
                />
                %
              </td>
              <td className="border p-2">
                $
                {parseFloat(
                  product.price_with_tax ||
                    product.unit_price * (1 + (product.tax || 5) / 100) ||
                    0
                ).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
