import { useEffect, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    previousBalance: 0,
  });

  const formatCurrency = (value) =>
    `${Number(value || 0).toFixed(2)}`;

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  const fetchCustomers = async (signal) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/customers?search=${encodeURIComponent(search.trim())}`, {
        signal,
      });

      if (!signal?.aborted) {
        setCustomers(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Error fetching customers:", err);
        showToast("Failed to load customers", "error");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchCustomers(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD CUSTOMER
  const addCustomer = async (e) => {
    e.preventDefault();

    try {
      await API.post("/customers", form);

      setForm({
        name: "",
        phone: "",
        address: "",
        previousBalance: 0,
      });

      showToast("Customer added successfully", "success");
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add customer", "error");
    }
  };

  // DELETE CUSTOMER
  const deleteCustomer = async (id) => {
    try {
      await API.delete(`/customers/${id}`);
      showToast("Customer deleted successfully", "success");
      fetchCustomers();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete customer", "error");
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-5">
        Customers
      </h1>

      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 max-w-sm rounded border px-4 py-3 shadow-lg ${
            toast.type === "success"
              ? "border-green-200 bg-green-50 text-green-800"
              : toast.type === "error"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search customer..."
          className="w-full border p-2"
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && (
          <p className="mt-2 text-sm text-gray-500">Loading customers...</p>
        )}
      </div>

      {/* ADD CUSTOMER FORM */}
      <form
        onSubmit={addCustomer}
        className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <input
          name="name"
          placeholder="Customer Name"
          className="border p-2"
          value={form.name}
          onChange={handleChange}
        />

        <input
          name="phone"
          placeholder="Phone"
          className="border p-2"
          value={form.phone}
          onChange={handleChange}
        />

        <input
          name="address"
          placeholder="Address"
          className="border p-2 sm:col-span-2"
          value={form.address}
          onChange={handleChange}
        />

        <input
          name="previousBalance"
          placeholder="Previous Balance"
          className="border p-2"
          value={form.previousBalance}
          onChange={handleChange}
        />

        <button className="bg-black p-2 text-white sm:col-span-2">
          Add Customer
        </button>
      </form>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[700px] w-full bg-white shadow">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2">Name</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Outstanding Balance</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr
                key={c._id}
                className="text-center border-t"
              >
                <td className="p-2">{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.address}</td>

                {/* CREDIT HIGHLIGHT */}
                <td
                  className={
                    c.currentBalance > 0
                      ? "font-bold text-red-600"
                      : "text-green-600"
                  }
                >
                  {formatCurrency(c.currentBalance)}
                </td>

                <td>
                  <button
                    onClick={() => deleteCustomer(c._id)}
                    className="bg-red-500 px-3 py-1 text-white"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Customers;