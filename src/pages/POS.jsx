import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";

function POS() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");

  const [cart, setCart] = useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState("");

  const [paidAmount, setPaidAmount] = useState("");
  const { toast, showToast, ToastContainer } = useToast();

  // BARCODE SCANNER
  const [showScanner, setShowScanner] =
    useState(false);

  const [scannerError, setScannerError] =
    useState("");

  const scannerRef = useRef(null);

  // API IMAGE URL
  const baseURL =
    API.defaults.baseURL?.replace("/api", "") ||
    window.location.origin;

  // =========================================
  // FETCH PRODUCTS
  // =========================================
  const fetchProducts = async () => {
    try {
      const { data } = await API.get(
        `/products?search=${search}`
      );

      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log(error);
      setProducts([]);
    }
  };

  // =========================================
  // FETCH CUSTOMERS
  // =========================================
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
    fetchProducts();
  }, [search]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // =========================================
  // START / STOP SCANNER
  // =========================================
  useEffect(() => {
    let scanner;

    const startScanner = async () => {
      try {
        setScannerError("");

        scanner = new Html5Qrcode("reader");

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

          // SUCCESS
          (decodedText) => {
            setSearch(decodedText);

            stopScanner();
          },

          // ERROR
          () => {}
        );
      } catch (error) {
        console.log(error);

        setScannerError(
          "Camera access denied or scanner failed"
        );
      }
    };

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

    if (showScanner) {
      startScanner();
    }

    return () => {
      stopScanner();
    };
  }, [showScanner]);

  // =========================================
  // ADD TO CART
  // =========================================
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showToast("Out of stock", "error");
      return;
    }

    setCart((prev) => {
      const exist = prev.find(
        (item) => item.product === product._id
      );

      // IF ALREADY EXISTS
      if (exist) {
        if (exist.quantity >= product.stock) {
          showToast("Stock limit reached", "error");
          return prev;
        }

        return prev.map((item) =>
          item.product === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      // NEW ITEM
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

  // =========================================
  // UPDATE QUANTITY
  // =========================================
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

            return {
              ...item,
              quantity: item.stock,
            };
          }

          return {
            ...item,
            quantity:
              quantity < 1 ? 1 : quantity,
          };
        }

        return item;
      })
    );
  };

  // =========================================
  // REMOVE ITEM
  // =========================================
  const removeItem = (id) => {
    setCart((prev) =>
      prev.filter(
        (item) => item.product !== id
      )
    );
  };

  // =========================================
  // TOTAL
  // =========================================
  const totalAmount = cart.reduce(
    (acc, item) =>
      acc + item.price * item.quantity,
    0
  );

  // =========================================
  // CREATE SALE
  // =========================================
  const createSale = async () => {
    if (cart.length === 0) {
      showToast("Cart is empty", "error");
      return;
    }

    try {
      const { data } = await API.post(
        "/sales",
        {
          customer:
            selectedCustomer || null,

          items: cart,

          paidAmount:
            Number(paidAmount) || 0,
        }
      );

      showToast("Sale Created", "success");

      setCart([]);
      setPaidAmount("");
      setSelectedCustomer("");

      setTimeout(() => {
        window.location.href = `/invoice/${data._id}`;
      }, 300);
    } catch (error) {
      console.log(error);

      showToast(
        error.response?.data?.message ||
          "Sale failed",
        "error"
      );
    }
  };

  return (
    <MainLayout>
      <ToastContainer toast={toast} />
      {/* HEADER */}
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-3xl font-bold">
          POS System
        </h1>

        <button
          onClick={() =>
            setShowScanner(!showScanner)
          }
          className={`px-4 py-2 rounded text-white ${
            showScanner
              ? "bg-red-500"
              : "bg-black"
          }`}
        >
          {showScanner
            ? "Close Scanner"
            : "Open Scanner"}
        </button>
      </div>

      {/* SCANNER */}
      {showScanner && (
        <div className="bg-white border p-4 rounded shadow mb-5">
          {scannerError ? (
            <div className="text-red-500">
              {scannerError}
            </div>
          ) : (
            <>
              <div
                id="reader"
                className="w-full max-w-md mx-auto"
              ></div>

              <p className="text-center text-sm text-gray-500 mt-2">
                Scan barcode here
              </p>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* PRODUCTS */}
        <div className="lg:col-span-2">

          {/* SEARCH */}
          <input
            type="text"
            placeholder="Search products..."
            className="border p-2 w-full mb-4 rounded"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {/* PRODUCT GRID */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {products.map((p) => (
              <div
                key={p._id}
                onClick={() => addToCart(p)}
                className="bg-white border rounded p-3 cursor-pointer shadow hover:shadow-lg transition"
              >

                {/* IMAGE */}
                {p.image ? (
                  <img
                    src={`${baseURL}${p.image}`}
                    alt={p.name}
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded mb-2 text-gray-400">
                    No Image
                  </div>
                )}

                {/* INFO */}
                <h3 className="font-bold text-sm">
                  {p.name}
                </h3>

                <p className="text-sm text-gray-600">
                  Stock: {p.stock}
                </p>

                <p className="font-bold mt-1">
                  Rs. {p.salePrice}
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* CART */}
        <div className="bg-white border rounded shadow p-4">

          <h2 className="text-xl font-bold mb-4">
            Cart
          </h2>

          {/* CUSTOMER */}
          <select
            className="border p-2 w-full mb-4 rounded"
            value={selectedCustomer}
            onChange={(e) =>
              setSelectedCustomer(
                e.target.value
              )
            }
          >
            <option value="">
              Select Customer
            </option>

            {customers.map((c) => (
              <option
                key={c._id}
                value={c._id}
              >
                {c.name}
              </option>
            ))}
          </select>

          {/* CART ITEMS */}
          <div className="space-y-3 max-h-[400px] overflow-auto">

            {cart.length > 0 ? (
              cart.map((item) => (
                <div
                  key={item.product}
                  className="border rounded p-2 flex justify-between gap-2"
                >

                  <div className="flex gap-2 flex-1">

                    {/* IMAGE */}
                    {item.image && (
                      <img
                        src={`${baseURL}${item.image}`}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded"
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-semibold text-sm">
                        {item.name}
                      </p>

                      <p className="text-sm">
                        Rs. {item.price}
                      </p>

                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQty(
                            item.product,
                            e.target.value
                          )
                        }
                        className="border w-20 p-1 mt-1 rounded"
                      />
                    </div>
                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={() =>
                      removeItem(
                        item.product
                      )
                    }
                    className="text-red-500 font-bold"
                  >
                    X
                  </button>

                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">
                Cart is empty
              </p>
            )}

          </div>

          {/* TOTAL */}
          <div className="border-t mt-4 pt-4">

            <h2 className="text-xl font-bold mb-3">
              Total: Rs.{" "}
              {totalAmount.toFixed(2)}
            </h2>

            {/* PAID */}
            <input
              type="number"
              placeholder="Paid Amount"
              className="border p-2 w-full rounded mb-3"
              value={paidAmount}
              onChange={(e) =>
                setPaidAmount(
                  e.target.value
                )
              }
            />

            {/* COMPLETE SALE */}
            <button
              onClick={createSale}
              className="bg-green-600 hover:bg-green-700 text-white w-full p-3 rounded"
            >
              Complete Sale
            </button>

          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default POS;