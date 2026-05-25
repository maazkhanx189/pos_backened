import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";

function EditSale() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast, showToast, ToastContainer } = useToast();

  const [sale, setSale] = useState(null);

  const fetchSale = async () => {
    const { data } = await API.get(`/sales/${id}`);
    setSale(data);
  };

  useEffect(() => {
    fetchSale();
  }, []);

  const updateSale = async () => {
    try {
      await API.put(`/sales/${id}`, sale);

      showToast("Sale Updated", "success");

      setTimeout(() => navigate("/sales"), 300);
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to update sale", "error");
    }
  };

  if (!sale) return <p>Loading...</p>;

  return (
    <MainLayout>
      <ToastContainer toast={toast} />
      <h1 className="text-2xl font-bold mb-4">
        Edit Sale
      </h1>

      {/* PAID AMOUNT EDIT */}
      <input
        type="number"
        value={sale.paidAmount}
        onChange={(e) =>
          setSale({
            ...sale,
            paidAmount: e.target.value,
          })
        }
        className="border p-2 mb-3 w-full"
      />

      <button
        onClick={updateSale}
        className="bg-green-600 text-white px-4 py-2"
      >
        Save Changes
      </button>
    </MainLayout>
  );
}

export default EditSale;