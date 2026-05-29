
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { useEffect, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";

function Reports() {

  const [stats, setStats] = useState(null);

  const fetchReports = async () => {
    const { data } = await API.get(
      "/reports/dashboard"
    );

    setStats(data);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (!stats) return <p>Loading...</p>;

  return (
    <MainLayout>

      <h1 className="text-3xl font-bold mb-6">
        Reports & Analytics
      </h1>

      {/* TOP CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Revenue
          </h2>

          <p className="text-3xl font-bold">
            Rs {stats.totalRevenue}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Profit
          </h2>

          <p className="text-3xl font-bold text-green-600">
            Rs {stats.totalProfit}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Customers
          </h2>

          <p className="text-3xl font-bold">
            {stats.totalCustomers}
          </p>
        </div>

        <div className="bg-white p-5 rounded shadow">
          <h2 className="text-gray-500">
            Products
          </h2>

          <p className="text-3xl font-bold">
            {stats.totalProducts}
          </p>
        </div>

      </div>

      {/* SALES CHART */}
      <div className="bg-white p-5 rounded shadow mb-6">

        <h2 className="text-xl font-bold mb-4">
          Monthly Sales
        </h2>

        <ResponsiveContainer
          width="100%"
          height={300}
        >
          <BarChart data={stats.monthlySales}>

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Bar
              dataKey="sales"
              fill="#2563eb"
            />

          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* TOP PRODUCTS + CREDIT */}
      <div className="grid grid-cols-2 gap-6">

        {/* TOP PRODUCTS */}
        <div className="bg-white p-5 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Top Products
          </h2>

          <table className="w-full">

            <thead>
              <tr className="border-b">
                <th>Name</th>
                <th>Sold</th>
              </tr>
            </thead>

            <tbody>
              {stats.topProducts?.map(
                (p, i) => (
                  <tr
                    key={i}
                    className="text-center border-b"
                  >
                    <td>{p.name}</td>
                    <td>{p.quantity}</td>
                  </tr>
                )
              )}
            </tbody>

          </table>

        </div>

        {/* CREDIT CUSTOMERS */}
        <div className="bg-white p-5 rounded shadow">

          <h2 className="text-xl font-bold mb-4">
            Credit Customers
          </h2>

          {stats.creditCustomers?.map(
            (c, i) => (
              <div
                key={i}
                className="flex justify-between border-b py-2"
              >
                <span>{c.name}</span>

                <span className="text-red-500">
                  Rs {c.currentBalance}
                </span>
              </div>
            )
          )}

        </div>

      </div>

    </MainLayout>
  );
}

export default Reports;