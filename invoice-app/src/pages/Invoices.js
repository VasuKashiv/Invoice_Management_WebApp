import { useSelector, useDispatch } from "react-redux";
import { useEffect, React } from "react";
import { fetchInvoices, updateInvoice } from "../redux/slices/invoiceSlice";

const Invoices = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices) || [];

  const API_BASE_URL = process.env.API_BASE_URL;
  console.log("✅ API BASE URL:", process.env.API_BASE_URL);
  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleEdit = (invoice, field, value) => {
    const updatedInvoice = { ...invoice, [field]: value };
    dispatch(updateInvoice(updatedInvoice)); // ✅ Update Redux & MongoDB
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-xl">
      <h2 className="text-xl font-bold mb-4">Invoices</h2>
      <p>API Base URL: {process.env.API_BASE_URL}</p>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">#</th>
            <th className="border p-2">Customer Name</th>
            <th className="border p-2">Product Name</th>
            <th className="border p-2">Quantity</th>
            <th className="border p-2">Tax (%)</th>
            <th className="border p-2">Total Amount</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) =>
            invoice.products?.map((product, pIndex) => (
              <tr key={`${index}-${pIndex}`} className="text-center">
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    {index + 1}
                  </td>
                )}
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    <input
                      type="text"
                      defaultValue={invoice.customer?.customer_name || "---"}
                      onBlur={(e) =>
                        handleEdit(invoice, "customer_name", e.target.value)
                      }
                      className="w-full border-none bg-transparent focus:outline-none"
                    />
                  </td>
                )}
                <td className="border p-2">
                  <input
                    type="text"
                    defaultValue={product.product_name}
                    onBlur={(e) =>
                      handleEdit(product, "product_name", e.target.value)
                    }
                    className="w-full border-none bg-transparent focus:outline-none"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    defaultValue={product.quantity}
                    onBlur={(e) =>
                      handleEdit(product, "quantity", e.target.value)
                    }
                    className="w-full border-none bg-transparent focus:outline-none"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    defaultValue={product.tax || "0"}
                    onBlur={(e) => handleEdit(product, "tax", e.target.value)}
                    className="w-full border-none bg-transparent focus:outline-none"
                  />
                  %
                </td>
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    <input
                      type="number"
                      defaultValue={parseFloat(
                        invoice.total_amount || 0
                      ).toFixed(2)}
                      onBlur={(e) =>
                        handleEdit(invoice, "total_amount", e.target.value)
                      }
                      className="w-full border-none bg-transparent focus:outline-none"
                    />
                  </td>
                )}
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    <input
                      type="text"
                      defaultValue={invoice.date || "---"}
                      onBlur={(e) =>
                        handleEdit(invoice, "date", e.target.value)
                      }
                      className="w-full border-none bg-transparent focus:outline-none"
                    />
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Invoices;
