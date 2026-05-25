import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";

function Sales() {
  const [sales, setSales] = useState([]);

  const navigate = useNavigate();
  const { toast, showToast, ToastContainer } = useToast();

  // FETCH SALES
  const fetchSales = async () => {
    try {
      const { data } = await API.get("/sales");

      setSales(data);
    } catch (error) {
      console.log(error);

      showToast(error.response?.data?.message || "Failed to fetch sales", "error");
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  // DELETE SALE
  const deleteSale = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this sale?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/sales/${id}`);

      showToast("Sale deleted successfully", "success");

      fetchSales();
    } catch (error) {
      console.log(error);

      showToast(error.response?.data?.message || "Failed to delete sale", "error");
    }
  };

  return (
    <MainLayout>
      <ToastContainer toast={toast} />
      <h1 className="text-3xl font-bold mb-5">
        Sales History
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow border">

          <thead>
            <tr className="bg-gray-200">

              <th className="p-3 border">
                Customer
              </th>

              <th className="border">
                Total
              </th>

              <th className="border">
                Paid
              </th>

              <th className="border">
                Remaining
              </th>

              <th className="border">
                Date
              </th>

              <th className="border">
                Actions
              </th>

            </tr>
          </thead>

          <tbody>
            {sales.length > 0 ? (
              sales.map((s) => (
                <tr
                  key={s._id}
                  className="text-center border-t"
                >

                  {/* SAFE CUSTOMER */}
                  <td className="p-3 border">
                    {s.customer?.name ||
                      "Walk-in Customer"}
                  </td>

                  <td className="border">
                    {s.totalAmount}
                  </td>

                  <td className="border">
                    {s.paidAmount}
                  </td>

                  <td className="border text-red-500 font-bold">
                    {s.remainingAmount}
                  </td>

                  <td className="border">
                    {new Date(
                      s.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="border">
                    <div className="flex justify-center gap-2 p-2">

                      {/* VIEW BUTTON */}
                      <button
                        onClick={() =>
                          navigate(
                            `/invoice/${s._id}`
                          )
                        }
                        className="bg-black text-white px-3 py-1 rounded"
                      >
                        View
                      </button>

                      {/* edit */}
                      <button
                        onClick={() =>
                          navigate(`/sales/edit/${s._id}`)
                        }
                        className="bg-blue-500 text-white px-3 py-1 ml-2"
                      >
                        Edit
                      </button>

                      {/* DELETE BUTTON */}
                      <button
                        onClick={() =>
                          deleteSale(s._id)
                        }
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="text-center p-5"
                >
                  No sales found
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </MainLayout>
  );
}

export default Sales;