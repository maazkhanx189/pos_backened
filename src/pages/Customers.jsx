import { useEffect, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import { Link } from "react-router-dom";

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

  // FORMAT
  const formatCurrency = (value) =>
    Number(value || 0).toFixed(2);

  // TOAST
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // FETCH
  const fetchCustomers = async () => {
    try {
      setLoading(true);

      const { data } = await API.get(
        `/customers?search=${search}`
      );

      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast("Failed to load customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  // INPUT
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ADD
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
      showToast(
        err.response?.data?.message || "Error",
        "error"
      );
    }
  };

  // DELETE
  const deleteCustomer = async (id) => {
    if (!window.confirm("Delete customer?")) return;

    try {
      await API.delete(`/customers/${id}`);
      showToast("Deleted successfully", "success");
      fetchCustomers();
    } catch (err) {
      showToast("Delete failed", "error");
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-5">
        Customers
      </h1>

      {/* TOAST */}
      {toast && (
        <div
          className={`fixed top-4 right-4 p-3 rounded shadow ${
            toast.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* SEARCH */}
      <input
        className="border p-2 w-full mb-4"
        placeholder="Search customer..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && (
        <p className="text-sm text-gray-500 mb-2">
          Loading...
        </p>
      )}

      {/* FORM */}
      <form
        onSubmit={addCustomer}
        className="grid grid-cols-2 gap-3 mb-6"
      >
        <input
          name="name"
          placeholder="Name"
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
          className="border p-2 col-span-2"
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

        <button className="bg-black text-white p-2 col-span-2">
          Add Customer
        </button>
      </form>

      {/* TABLE */}
      <table className="w-full bg-white shadow">
        <thead>
          <tr className="bg-gray-200">
            <th>Name</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Balance</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((c) => (
            <tr
              key={c._id}
              className="text-center border-t"
            >
              <td>{c.name}</td>
              <td>{c.phone}</td>
              <td>{c.address}</td>

              <td
                className={
                  c.currentBalance > 0
                    ? "text-red-600 font-bold"
                    : "text-green-600"
                }
              >
                {formatCurrency(c.currentBalance)}
              </td>

              <td className="flex gap-2 justify-center">
                <Link
                  to={`/customers/ledger/${c._id}`}
                  className="bg-blue-600 text-white px-3 py-1 text-sm"
                >
                  Ledger
                </Link>

                <button
                  onClick={() => deleteCustomer(c._id)}
                  className="bg-red-500 text-white px-3 py-1 text-sm"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </MainLayout>
  );
}

export default Customers;