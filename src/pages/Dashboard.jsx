import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [scannerError, setScannerError] = useState("");
  const scannerRef = useRef(null);
  const { toast, showToast, ToastContainer } = useToast();

  const baseURL =
    API.defaults.baseURL?.replace("/api", "") ||
    "http://localhost:8000";

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/reports/dashboard");
      setStats(data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await API.get(
        `/products?search=${encodeURIComponent(search)}`
      );
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data } = await API.get("/customers");
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setCustomers([]);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  useEffect(() => {
    let scanner;

    const stopScanner = async () => {
      try {
        if (
          scannerRef.current &&
          scannerRef.current.isScanning
        ) {
          await scannerRef.current.stop();
          await scannerRef.current.clear();
          scannerRef.current = null;
        }

        setShowScanner(false);
      } catch (error) {
        console.log(error);
      }
    };

    const startScanner = async () => {
      try {
        setScannerError("");
        scanner = new Html5Qrcode("dashboard-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: {
              width: 250,
              height: 120,
            },
            formatsToSupport: [
              Html5QrcodeSupportedFormats.EAN_13,
              Html5QrcodeSupportedFormats.EAN_8,
              Html5QrcodeSupportedFormats.CODE_128,
              Html5QrcodeSupportedFormats.UPC_A,
              Html5QrcodeSupportedFormats.QR_CODE,
            ],
          },
          (decodedText) => {
            setSearch(decodedText);
            stopScanner();
          },
          () => {}
        );
      } catch (error) {
        console.log(error);
        setScannerError(
          "Camera access denied or scanner failed"
        );
      }
    };

    if (showScanner) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [showScanner]);

  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast("Out of stock", "error");
      return;
    }

    setCart((prev) => {
      const existingItem = prev.find(
        (item) => item.product === product._id
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock) {
          showToast("Stock limit reached", "error");
          return prev;
        }

        return prev.map((item) =>
          item.product === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...prev,
        {
          product: product._id,
          name: product.name,
          image: product.image,
          price: Number(product.salePrice),
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    const quantity = Number(qty);

    setCart((prev) =>
      prev.map((item) => {
        if (item.product === id) {
          if (quantity > item.stock) {
            showToast(
              `Only ${item.stock} items available`,
              "error"
            );

            return { ...item, quantity: item.stock };
          }

          return {
            ...item,
            quantity: quantity < 1 ? 1 : quantity,
          };
        }

        return item;
      })
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item.product !== id));
  };

  const totalAmount = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const createSale = async () => {
    if (cart.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    try {
      const { data } = await API.post("/sales", {
        customer: selectedCustomer || null,
        items: cart,
        paidAmount: Number(paidAmount) || 0,
      });

      showToast("Sale Created", "success");
      setCart([]);
      setPaidAmount("");
      setSelectedCustomer("");

      setTimeout(() => {
        navigate(`/invoice/${data._id}`);
      }, 300);
    } catch (error) {
      console.log(error);
      showToast(
        error.response?.data?.message || "Sale failed",
        "error"
      );
    }
  };

  return (
    <MainLayout>
      <ToastContainer toast={toast} />

      <h1 className="text-3xl font-bold mb-5">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-sm text-gray-500">Total Revenue</h2>
          <p className="text-2xl font-bold">{stats.totalRevenue}</p>
        </div>

        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-sm text-gray-500">Total Profit</h2>
          <p className="text-2xl font-bold text-green-600">
            {stats.totalProfit}
          </p>
        </div>

        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-sm text-gray-500">Customers</h2>
          <p className="text-2xl font-bold">{stats.totalCustomers}</p>
        </div>

        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-sm text-gray-500">Products</h2>
          <p className="text-2xl font-bold">{stats.totalProducts}</p>
        </div>
      </div>

      {stats.lowStockProducts?.length > 0 && (
        <div className="bg-red-100 border border-red-200 text-red-800 p-3 my-4 rounded">
          ⚠ Low Stock Alert: {stats.lowStockProducts.length} products
        </div>
      )}

      <section className="mt-6">
        <div className="flex justify-between items-center mb-5">
          <h1 className="text-3xl font-bold">POS System</h1>

          <div className="flex gap-2">
            <button
              onClick={() => setShowScanner(!showScanner)}
              className={`px-4 py-2 rounded text-white ${
                showScanner ? "bg-red-500" : "bg-black"
              }`}
            >
              {showScanner ? "Close Scanner" : "Open Scanner"}
            </button>

            <Link
              to="/pos"
              className="inline-flex items-center rounded bg-gray-800 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700"
            >
              Open full POS
            </Link>
          </div>
        </div>

        {showScanner && (
          <div className="bg-white border p-4 rounded shadow-sm mb-5 max-w-lg mx-auto">
            {scannerError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs font-medium">
                ❌ {scannerError}
              </div>
            ) : (
              <>
                <div
                  id="dashboard-reader"
                  className="w-full bg-black rounded-md overflow-hidden min-h-[250px]"
                ></div>

                <p className="text-center text-xs text-gray-400 mt-2 italic">
                  Hold the barcode label completely flat within the viewfinder frame grid lines.
                </p>
              </>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search catalog by identity names or barcode sequence tracks..."
                className="border p-2 w-full mb-3 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-black pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 font-bold text-sm"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => addToCart(product)}
                  className="border rounded bg-white p-3 cursor-pointer shadow-sm hover:shadow flex flex-col justify-between"
                >
                  <div>
                    {product.image ? (
                      <img
                        src={`${baseURL}${product.image}`}
                        alt={product.name}
                        className="w-full h-24 object-cover mb-2 rounded border"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded mb-2 border">
                        No Image File Attached
                      </div>
                    )}

                    <h3 className="font-bold text-gray-800 text-sm line-clamp-2">
                      {product.name}
                    </h3>
                  </div>

                  <div className="mt-2 pt-2 border-t text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Stock Level:</span>
                      <span
                        className={
                          product.stock <= (product.lowStockAlert ?? 5)
                            ? "text-red-500 font-bold"
                            : "font-medium"
                        }
                      >
                        {product.stock} units
                      </span>
                    </div>

                    <div className="flex justify-between text-sm font-semibold text-gray-900 mt-1">
                      <span>Unit Price:</span>
                      <span>Rs. {product.salePrice || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 shadow rounded border flex flex-col justify-between h-fit">
            <div>
              <h2 className="text-xl font-bold mb-3 pb-2 border-b text-gray-700">
                Active Register Basket
              </h2>

              <select
                className="border w-full p-2 mb-4 rounded bg-gray-50 focus:outline-none"
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
              >
                <option value="">Anonymous Guest Walk-In</option>
                {customers.map((customer) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name}
                  </option>
                ))}
              </select>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 mb-4">
                {cart.map((item) => (
                  <div
                    key={item.product}
                    className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-sm text-gray-800 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        Rs. {item.price} each
                      </p>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-600 mr-1">
                          Qty:
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQty(item.product, e.target.value)}
                          className="border rounded w-16 px-1 text-center text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.product)}
                      className="text-red-400 hover:text-red-600 font-bold text-sm px-2 py-1 ml-1"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {cart.length === 0 && (
                  <p className="text-center text-gray-400 text-sm py-8 italic">
                    No items added to basket yet.
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-3 mt-2">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 font-medium">Cart Subtotal:</span>
                <span className="text-2xl font-black text-gray-900">
                  Rs. {totalAmount.toFixed(2)}
                </span>
              </div>

              <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">
                Amount Tendered
              </label>
              <input
                type="number"
                className="border w-full p-2 rounded text-lg font-mono focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder="Rs. 0.00"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
              />

              <button
                onClick={createSale}
                className="bg-green-600 hover:bg-green-700 text-white font-bold w-full p-3 rounded mt-4 shadow transition-colors duration-150"
              >
                Complete Sale & Print Receipt
              </button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default Dashboard;