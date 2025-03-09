import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { fetchCustomers, updateCustomer } from "../redux/slices/customerSlice";

const Customers = () => {
  const dispatch = useDispatch();
  const customers = useSelector((state) => state.customers) || [];

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch]);

  const handleEdit = (customer, field, value) => {
    const updatedCustomer = { ...customer, [field]: value };
    dispatch(updateCustomer(updatedCustomer)); // ✅ Update Redux & MongoDB
  };

  return (
    <div className="bg-white p-4 shadow-md rounded-xl">
      <h2 className="text-xl font-bold mb-4">Customers</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Customer Name</th>
            <th className="border p-2">Phone Number</th>
            <th className="border p-2">Total Purchase Amount</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={index} className="text-center">
              <td className="border p-2">
                <input
                  type="text"
                  defaultValue={customer.customer_name || "---"}
                  onBlur={(e) =>
                    handleEdit(customer, "customer_name", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
              <td className="border p-2">
                <input
                  type="text"
                  defaultValue={customer.phone_number || "N/A"}
                  onBlur={(e) =>
                    handleEdit(customer, "phone_number", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  defaultValue={parseFloat(
                    customer.total_purchase || 0
                  ).toFixed(2)}
                  onBlur={(e) =>
                    handleEdit(customer, "total_purchase", e.target.value)
                  }
                  className="w-full border-none bg-transparent focus:outline-none"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Customers;
