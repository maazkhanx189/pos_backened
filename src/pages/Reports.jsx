import { useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import useToast from "../hooks/useToast";

function Reports() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const { toast, showToast, ToastContainer } = useToast();

  // FETCH REPORT LOGIC
  const getReport = async () => {
    if (!start || !end) {
      showToast("Please select both a start and an end date.", "error");
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(
        `/reports/sales-range?startDate=${start}&endDate=${end}`
      );
      setData(response.data);
    } catch (err) {
      console.error("Report Retrieval Failure:", err);
      showToast(err.response?.data?.message || "Failed to generate report records.", "error");
    } finally {
      setLoading(false);
    }
  };

  // EXCEL EXPORT METHOD (FIXED: Moved cleanly out of the return block scope)
  const exportExcel = () => {
    if (!data || !data.sales || data.sales.length === 0) {
      showToast("There are no sales data available to export yet.", "error");
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(data.sales);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sales");

      const excelBuffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "array",
      });

      const fileBlob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      saveAs(fileBlob, `sales-report-${start}-to-${end}.xlsx`);
      showToast("Spreadsheet export completed", "success");
    } catch (err) {
      console.error("Excel Generation Error:", err);
      showToast("An issue occurred while writing your spreadsheet export file.", "error");
    }
  };

  return (
    <MainLayout>
      <ToastContainer toast={toast} />
      <h1 className="text-3xl font-bold mb-5">Reports Engine</h1>

      {/* DATE FILTER CONTROL MATRIX */}
      <div className="mb-6 flex flex-col gap-3 rounded border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-semibold uppercase text-gray-500">Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="flex flex-col">
          <label className="mb-1 text-xs font-semibold uppercase text-gray-500">End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded border p-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <button
          onClick={getReport}
          disabled={loading}
          className="mt-2 rounded bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-400 sm:mt-0 sm:self-end"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </div>

      {/* REPORT OUTPUT COMPILATION PANEL */}
      {data ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded border shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gross Sales Revenue</p>
              <h2 className="text-2xl font-black text-gray-900 mt-1">${data.totalSales || 0}</h2>
            </div>

            <div className="bg-white p-5 rounded border shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Net Aggregated Profit</p>
              <h2 className="text-2xl font-black text-green-600 mt-1">${data.totalProfit || 0}</h2>
            </div>

            <div className="bg-white p-5 rounded border shadow-sm">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Processed Receipts</p>
              <h2 className="text-2xl font-black text-blue-600 mt-1">{data.count || 0} Invoices</h2>
            </div>
          </div>

          {/* ACTION SUB-BAR (FIXED: Gated cleanly behind data verification safety) */}
          <div className="flex justify-end">
            <button
              onClick={exportExcel}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded text-sm shadow transition-colors flex items-center gap-1"
            >
              📊 Export Spreadsheet (.xlsx)
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded text-gray-400 italic bg-gray-50">
          Select a date window sequence range above to load metrics.
        </div>
      )}
    </MainLayout>
  );
}

export default Reports;