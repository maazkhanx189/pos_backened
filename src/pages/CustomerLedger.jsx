import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function CustomerLedger() {

  const { id } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchLedger = async () => {
    try {
      const { data } = await API.get(`/customers/${id}/ledger`);
      setData(data);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load customer ledger."
      );
      setData(null);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, [id]);

  if (error)
    return (
      <MainLayout>
        <div className="rounded-xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold mb-4">
            Customer Ledger
          </h1>
          <p className="text-red-600">{error}</p>
          <p className="mt-4 text-sm text-gray-600">
            If this happens again, please verify the customer exists or
            reload the page.
          </p>
        </div>
      </MainLayout>
    );

  if (!data)
    return (
      <MainLayout>
        <p>Loading...</p>
      </MainLayout>
    );

  return (
    <MainLayout>

      <h1 className="text-2xl font-bold mb-5">
        Customer Ledger
      </h1>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-white p-4 shadow">
          <h2>Total Purchase</h2>
          <p className="text-xl font-bold">
            Rs {data.totalPurchase}
          </p>
        </div>

        <div className="bg-white p-4 shadow">
          <h2>Total Paid</h2>
          <p className="text-xl font-bold text-green-600">
            Rs {data.totalPaid}
          </p>
        </div>

        <div className="bg-white p-4 shadow">
          <h2>Remaining</h2>
          <p className="text-xl font-bold text-red-600">
            Rs {data.remaining}
          </p>
        </div>

      </div>

      {/* INVOICE HISTORY */}
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

            {data.sales.map((s) => (

              <tr key={s._id} className="text-center border-b">

                <td>
                  {new Date(
                    s.createdAt
                  ).toLocaleDateString()}
                </td>

                <td>
                  Rs {s.totalAmount}
                </td>

                <td>
                  Rs {s.paidAmount}
                </td>

                <td className="text-red-500">
                  Rs {s.totalAmount - s.paidAmount}
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