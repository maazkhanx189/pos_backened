// import { useEffect, useState, useRef } from "react";
// import API from "../services/api";
// import MainLayout from "../layouts/MainLayout";
// import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

// function POS() {
//   const [products, setProducts] = useState([]);
//   const [customers, setCustomers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [cart, setCart] = useState([]);
//   const [selectedCustomer, setSelectedCustomer] = useState("");
//   const [paidAmount, setPaidAmount] = useState("");
  
//   // SCANNER MANAGEMENT STATE
//   const [showScanner, setShowScanner] = useState(false);
//   const [scannerError, setScannerError] = useState("");
//   const scannerRef = useRef(null); // Keeps track of our active instance across renders

//   const baseURL = API.defaults.baseURL?.replace("/api", "") || "http://localhost:8000";

//   const fetchProducts = async () => {
//     try {
//       const { data } = await API.get(`/products?search=${encodeURIComponent(search)}`);
//       setProducts(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("POS Product Query Failure:", err);
//       setProducts([]); 
//     }
//   };

//   const fetchCustomers = async () => {
//     try {
//       const { data } = await API.get("/customers");
//       setCustomers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("POS Customer Query Failure:", err);
//       setCustomers([]);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, [search]);

//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   // EXPLICIT WEB-CAMERA LIFECYCLE CONTROLLER
//   useEffect(() => {
//     if (!showScanner) {
//       // Clean up and stop the camera if the panel is closed
//       if (scannerRef.current && scannerRef.current.isScanning) {
//         scannerRef.current.stop()
//           .then(() => {
//             scannerRef.current.clear();
//             scannerRef.current = null;
//           })
//           .catch((err) => console.error("Failed to stop scanner cleanly:", err));
//       }
//       return;
//     }

//     setScannerError("");

//     // Create custom configuration profile target rules
//     const config = {
//       fps: 20,
//       qrbox: { width: 280, height: 180 },
//       formatsToSupport: [
//         Html5QrcodeSupportedFormats.EAN_13,
//         Html5QrcodeSupportedFormats.EAN_8,
//         Html5QrcodeSupportedFormats.CODE_128,
//         Html5QrcodeSupportedFormats.UPC_A,
//         Html5QrcodeSupportedFormats.QR_CODE
//       ]
//     };

//     // Instantiate directly on the DOM element wrapper target
//     const html5Qrcode = new Html5Qrcode("reader", /* verbose= */ false);
//     scannerRef.current = html5Qrcode;

//     // Request stream interface channels explicitly 
//     html5Qrcode.start(
//       { facingMode: "environment" }, // Prefer back camera on mobile phones
//       config,
//       (decodedText) => {
//         setSearch(decodedText);
//         setShowScanner(false); // Turn off camera on scan match success
//       },
//       (errorMessage) => {
//         // FIX: Completely ignore the noisy 'NotFoundException' stream updates
//         // This keeps processing pipelines entirely clear
//       }
//     )
//     .catch((err) => {
//       console.error("Hardware Camera Access Denied:", err);
//       setScannerError(
//         "Could not launch camera peripheral. Verify that application permission permissions are enabled and that your site uses HTTPS secure contexts."
//       );
//     });

//     return () => {
//       if (scannerRef.current && scannerRef.current.isScanning) {
//         scannerRef.current.stop()
//           .then(() => { scannerRef.current = null; })
//           .catch((err) => console.error("Teardown error hook:", err));
//       }
//     };
//   }, [showScanner]);

//   const addToCart = (product) => {
//     if (product.stock <= 0) {
//       alert(`${product.name} is completely out of stock!`);
//       return;
//     }

//     setCart((prev) => {
//       const exist = prev.find((i) => i.product === product._id);
//       if (exist) {
//         if (exist.quantity >= product.stock) {
//           alert(`Cannot add more items. Only ${product.stock} units available.`);
//           return prev;
//         }
//         return prev.map((i) =>
//           i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i
//         );
//       }

//       return [
//         ...prev,
//         {
//           product: product._id,
//           name: product.name,
//           price: product.salePrice,
//           quantity: 1,
//           maxStock: product.stock
//         }
//       ];
//     });
//   };

//   const updateQty = (id, qty) => {
//     const numericQty = Math.max(1, Number(qty) || 1);
//     setCart((prev) =>
//       prev.map((i) => {
//         if (i.product === id) {
//           if (numericQty > i.maxStock) {
//             alert(`Requested inventory limits exceed warehouse stock. Cap set to ${i.maxStock}.`);
//             return { ...i, quantity: i.maxStock };
//           }
//           return { ...i, quantity: numericQty };
//         }
//         return i;
//       })
//     );
//   };

//   const removeItem = (id) => {
//     setCart((prev) => prev.filter((i) => i.product !== id));
//   };

//   const total = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0);

//   const createSale = async () => {
//     if (cart.length === 0) {
//       alert("Your transaction tray is completely empty!");
//       return;
//     }

//     try {
//       const { data } = await API.post("/sales", {
//         customer: selectedCustomer || null,
//         items: cart,
//         paidAmount: Number(paidAmount) || 0
//       });

//       if (data && data._id) {
//         window.location.href = `/invoice/${data._id}`;
//       } else {
//         throw new Error("Invalid transaction processing return data signature.");
//       }
//     } catch (err) {
//       console.error("Sales Submission Crash Trace:", err);
//       alert(err.response?.data?.message || "Failed to finalize point-of-sale checkout operation.");
//     }
//   };

//   return (
//     <MainLayout>
//       <div className="flex justify-between items-center mb-5">
//         <h1 className="text-3xl font-bold">POS System Terminal</h1>
//         <button
//           onClick={() => setShowScanner(!showScanner)}
//           className={`px-4 py-2 text-xs font-bold rounded shadow transition-all ${
//             showScanner ? "bg-red-500 hover:bg-red-600 text-white" : "bg-black hover:bg-gray-800 text-white"
//           }`}
//         >
//           {showScanner ? "✕ Close Registration Tool" : "📷 Start Laser Camera Scanner"}
//         </button>
//       </div>

//       {/* VIEW-FINDER CAMERA PLACEMENT SANDBOX CONTAINER */}
//       {showScanner && (
//         <div className="bg-white p-4 border rounded shadow-sm mb-5 max-w-lg mx-auto">
//           {scannerError ? (
//             <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs font-medium">
//               ❌ {scannerError}
//             </div>
//           ) : (
//             <>
//               {/* FIXED CORE VIEWPORT CANVAS MOUNT TARGET ELEMENT */}
//               <div id="reader" className="w-full bg-black rounded-md overflow-hidden min-h-[250px]"></div>
//               <p className="text-center text-xs text-gray-400 mt-2 italic">Hold the barcode label completely flat within the viewfinder frame grid lines.</p>
//             </>
//           )}
//         </div>
//       )}

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* PRODUCTS LIST */}
//         <div className="lg:col-span-2">
//           <div className="relative">
//             <input
//               className="border p-2 w-full mb-3 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-black pr-10"
//               placeholder="Search catalog by identity names or barcode sequence tracks..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//             />
//             {search && (
//               <button onClick={() => setSearch("")} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 font-bold text-sm">✕</button>
//             )}
//           </div>

//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//             {products.map((p) => (
//               <div key={p._id} onClick={() => addToCart(p)} className="border rounded bg-white p-3 cursor-pointer shadow-sm hover:shadow flex flex-col justify-between">
//                 <div>
//                   {p.image ? (
//                     <img src={`${baseURL}${p.image}`} className="w-full h-24 object-cover mb-2 rounded border" alt={p.name} />
//                   ) : (
//                     <div className="w-full h-24 bg-gray-100 flex items-center justify-center text-gray-400 text-xs rounded mb-2 border">No Image File Attached</div>
//                   )}
//                   <h3 className="font-bold text-gray-800 text-sm line-clamp-2">{p.name}</h3>
//                 </div>
//                 <div className="mt-2 pt-2 border-t text-xs text-gray-600">
//                   <div className="flex justify-between">
//                     <span>Stock Level:</span>
//                     <span className={p.stock <= (p.lowStockAlert ?? 5) ? "text-red-500 font-bold" : "font-medium"}>{p.stock} units</span>
//                   </div>
//                   <div className="flex justify-between text-sm font-semibold text-gray-900 mt-1">
//                     <span>Unit Price:</span>
//                     <span>${p.salePrice || 0}</span>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* SHOPPING CART PANEL */}
//         <div className="bg-white p-4 shadow rounded border flex flex-col justify-between h-fit">
//           <div>
//             <h2 className="text-xl font-bold mb-3 pb-2 border-b text-gray-700">Active Register Basket</h2>
//             <select className="border w-full p-2 mb-4 rounded bg-gray-50 focus:outline-none" value={selectedCustomer} onChange={(e) => setSelectedCustomer(e.target.value)}>
//               <option value="">Anonymous Guest Walk-In</option>
//               {customers.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
//             </select>

//             <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 mb-4">
//               {cart.map((i) => (
//                 <div key={i.product} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
//                   <div className="flex-1 min-w-0 mr-2">
//                     <p className="font-medium text-sm text-gray-800 truncate">{i.name}</p>
//                     <p className="text-xs text-gray-500">${i.price} each</p>
//                     <div className="flex items-center mt-1">
//                       <span className="text-xs text-gray-600 mr-1">Qty:</span>
//                       <input type="number" min="1" value={i.quantity} onChange={(e) => updateQty(i.product, e.target.value)} className="border rounded w-16 px-1 text-center text-sm" />
//                     </div>
//                   </div>
//                   <button onClick={() => removeItem(i.product)} className="text-red-400 hover:text-red-600 font-bold text-sm px-2 py-1 ml-1">✕</button>
//                 </div>
//               ))}
//               {cart.length === 0 && <p className="text-center text-gray-400 text-sm py-8 italic">No items added to basket yet.</p>}
//             </div>
//           </div>

//           <div className="border-t pt-3 mt-2">
//             <div className="flex justify-between items-center mb-3">
//               <span className="text-gray-600 font-medium">Cart Subtotal:</span>
//               <span className="text-2xl font-black text-gray-900">${total.toFixed(2)}</span>
//             </div>
//             <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Amount Tendered</label>
//             <input type="number" className="border w-full p-2 rounded text-lg font-mono focus:outline-none focus:ring-1 focus:ring-green-500" placeholder="$0.00" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
//             <button onClick={createSale} className="bg-green-600 hover:bg-green-700 text-white font-bold w-full p-3 rounded mt-4 shadow transition-colors duration-150">Complete Sale & Print Receipt</button>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }

// export default POS;



























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
    "http://localhost:8000";

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