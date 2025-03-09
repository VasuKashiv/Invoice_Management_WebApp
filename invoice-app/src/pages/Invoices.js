import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  fetchInvoices,
  saveInvoice,
  updateInvoice,
} from "../redux/slices/invoiceSlice";

const Invoices = () => {
  const dispatch = useDispatch();
  const invoices = useSelector((state) => state.invoices) || [];
  const [editInvoice, setEditInvoice] = useState(null);

  useEffect(() => {
    dispatch(fetchInvoices());
  }, [dispatch]);

  const handleEdit = (invoice, field, value) => {
    const updatedInvoice = { ...invoice, [field]: value };
    dispatch(updateInvoice(updatedInvoice)); // ✅ Update Redux & MongoDB
  };

  const handleSave = () => {
    dispatch(saveInvoice(editInvoice));
    setEditInvoice(null);
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-xl">
      <h2 className="text-xl font-bold mb-4">Invoices</h2>
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
            {/* <th className="border p-2">Actions</th> */}
          </tr>
        </thead>
        {/* <tbody>
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
                    {invoice.customer?.customer_name || "---"}
                  </td>
                )}
                <td className="border p-2">{product.product_name}</td>
                <td className="border p-2">{product.quantity}</td>
                <td className="border p-2">{product.tax || "0"}%</td>
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                  </td>
                )}
                {pIndex === 0 && (
                  <td className="border p-2" rowSpan={invoice.products.length}>
                    {invoice.date || "---"}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody> */}
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
