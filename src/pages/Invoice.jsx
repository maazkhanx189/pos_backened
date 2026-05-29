import { useEffect, useState } from "react";
// FIX: Imported useNavigate here
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Invoice() {
  const { id } = useParams();
  // FIX: Initialized the navigate hook inside the component
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);

  const fetchSale = async () => {
    try {
      const { data } = await API.get(`/sales/${id}`);
      setSale(data);
    } catch (err) {
      console.error("Failed to load invoice details:", err);
    }
  };

  useEffect(() => {
    fetchSale();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (!sale) return <MainLayout>Loading...</MainLayout>;

  return (
    <MainLayout>
      <div className="p-4">

        {/* NON-PRINT AREA */}
        <div className="no-print mb-4 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            Print
          </button>

          {/* edit button - NOW WORKS WITHOUT ERROR */}
          <button
            onClick={() => navigate(`/sales/edit/${sale._id}`)}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            Edit Invoice
          </button>
        </div>

        {/* PRINT AREA */}
        <div className="print-area bg-white p-6 rounded shadow-sm max-w-md mx-auto border">

          <h1 className="text-center font-bold text-xl mb-1">
            Wholesale POS
          </h1>

          <p className="text-center text-sm text-gray-500 mb-4">
            Invoice ID: #{sale._id.slice(-6).toUpperCase()}
          </p>

          <hr className="my-3" />

          <div className="text-sm space-y-1 mb-4">
            <p>
              Customer: <b>{sale.customer?.name || "Anonymous Walk-In"}</b>
            </p>
            {sale.customer?.phone && <p>Phone: {sale.customer.phone}</p>}
          </div>

          <hr className="my-3" />

          <div className="space-y-2 my-4">
            {sale.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-700">
                  {item.name} <span className="text-xs text-gray-400">x{item.quantity}</span>
                </span>
                <span className="font-mono font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <hr className="my-3" />

          <div className="space-y-1.5 text-sm text-right max-w-[200px] ml-auto font-medium">
            <div className="flex justify-between text-gray-600">
              <span>Total:</span>
              <span className="font-mono">${Number(sale.totalAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Paid:</span>
              <span className="font-mono">${Number(sale.paidAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-red-600 font-bold border-t pt-1">
              <span>Remaining:</span>
              <span className="font-mono">${Number(sale.remainingAmount || 0).toFixed(2)}</span>
            </div>
          </div>

          <p className="text-center mt-8 text-xs text-gray-400 italic">
            Thank you for your business!
          </p>

        </div>
      </div>
    </MainLayout>
  );
}

export default Invoice;