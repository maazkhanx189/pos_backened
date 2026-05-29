import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function CustomerLedger() {
  const { id } = useParams();

  const [ledger, setLedger] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchLedger = async () => {
    try {
      setLoading(true);

      const res = await API.get(
        `/customers/${id}/ledger`
      );

      setLedger(res.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customer ledger"
      );
      setLedger(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <p className="p-5">Loading ledger...</p>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-6 bg-white shadow">
          <h1 className="text-xl font-bold mb-2">
            Customer Ledger
          </h1>
          <p className="text-red-600">{error}</p>
        </div>
      </MainLayout>
    );
  }

  if (!ledger) {
    return (
      <MainLayout>
        <p>No data found</p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-2xl font-bold mb-5">
        Customer Ledger
      </h1>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 shadow">
          <h2>Total Purchase</h2>
          <p className="text-xl font-bold">
            Rs {ledger.totalPurchase}
          </p>
        </div>

        <div className="bg-white p-4 shadow">
          <h2>Total Paid</h2>
          <p className="text-xl font-bold text-green-600">
            Rs {ledger.totalPaid}
          </p>
        </div>

        <div className="bg-white p-4 shadow">
          <h2>Remaining</h2>
          <p className="text-xl font-bold text-red-600">
            Rs {ledger.remaining}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white p-5 shadow">
        <h2 className="font-bold mb-4">
          Purchase History
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th>Date</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Remaining</th>
            </tr>
          </thead>

          <tbody>
            {ledger.sales?.map((s) => (
              <tr
                key={s._id}
                className="text-center border-b"
              >
                <td>
                  {new Date(
                    s.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>Rs {s.totalAmount}</td>
                <td>Rs {s.paidAmount}</td>

                <td className="text-red-500">
                  Rs{" "}
                  {s.totalAmount - s.paidAmount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default CustomerLedger;