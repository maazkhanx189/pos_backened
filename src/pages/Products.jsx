import { useEffect, useState } from "react";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";

function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    barcode: "",
    category: "",
    purchasePrice: "",
    salePrice: "",
    stock: "",
    lowStockAlert: "5"
  });

  const [image, setImage] = useState(null);

  const { toast, showToast, ToastContainer } = useToast();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const baseURL = API.defaults.baseURL?.replace("/api", "") || "http://localhost:8000";

  const fetchProducts = async (signal) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products?search=${encodeURIComponent(search.trim())}`, {
        signal,
      });

      if (!signal?.aborted) {
        setProducts(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
        console.error("Error fetching products:", err);
        showToast("Failed to load products", "error");
      }
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetchProducts(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  // INPUT HANDLER
  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ADD PRODUCT (WITH IMAGE UPLOAD)
  const addProduct = async (e) => {
    e.preventDefault();

    if (!form.name || !form.barcode) {
      showToast("Name and Barcode are required properties!", "error");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("barcode", form.barcode);
      formData.append("category", form.category);
      formData.append("purchasePrice", form.purchasePrice);
      formData.append("salePrice", form.salePrice);
      formData.append("stock", form.stock);
      formData.append("lowStockAlert", form.lowStockAlert);

      if (image) {
        formData.append("image", image);
      }

      await API.post("/products", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      setForm({
        name: "",
        barcode: "",
        category: "",
        purchasePrice: "",
        salePrice: "",
        stock: "",
        lowStockAlert: "5"
      });
      setImage(null);
      showToast("Product added successfully", "success");
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to add product", "error");
    }
  };

  // DELETE PRODUCT
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await API.delete(`/products/${id}`);
      showToast("Product deleted successfully", "success");
      fetchProducts();
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to delete", "error");
    }
  };

  return (
    <MainLayout>
      <ToastContainer toast={toast} />
      <h1 className="text-3xl font-bold mb-5">Products</h1>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search products..."
          className="w-full border p-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {loading && (
          <p className="mt-2 text-sm text-gray-500">Loading products...</p>
        )}
      </div>

      {/* FORM */}
      <form onSubmit={addProduct} className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <input
          name="name"
          placeholder="Name *"
          className="border p-2"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="barcode"
          placeholder="Barcode *"
          className="border p-2"
          value={form.barcode}
          onChange={handleChange}
          required
        />
        <input
          name="category"
          placeholder="Category"
          className="border p-2"
          value={form.category}
          onChange={handleChange}
        />
        <input
          name="purchasePrice"
          type="number"
          placeholder="Purchase Price"
          className="border p-2"
          value={form.purchasePrice}
          onChange={handleChange}
        />
        <input
          name="salePrice"
          type="number"
          placeholder="Sale Price"
          className="border p-2"
          value={form.salePrice}
          onChange={handleChange}
        />
        <input
          name="stock"
          type="number"
          placeholder="Initial Stock"
          className="border p-2"
          value={form.stock}
          onChange={handleChange}
        />
        <input
          name="lowStockAlert"
          type="number"
          placeholder="Low Stock Alert Threshold"
          className="border p-2 sm:col-span-2 xl:col-span-3"
          value={form.lowStockAlert}
          onChange={handleChange}
        />

        {/* IMAGE UPLOAD */}
        <input
          type="file"
          accept="image/*"
          className="border p-2 sm:col-span-2 xl:col-span-3"
          onChange={(e) => setImage(e.target.files[0] || null)}
        />

        {/* PREVIEW IMAGE */}
        {image && (
          <div className="sm:col-span-2 xl:col-span-3">
            <img
              src={URL.createObjectURL(image)}
              className="h-16 w-16 rounded border object-cover"
              alt="preview"
            />
          </div>
        )}

        <button type="submit" className="bg-black p-2 text-white transition-colors hover:bg-gray-800 sm:col-span-2 xl:col-span-3">
          Add Product
        </button>
      </form>

      {/* DATA VIEW TABLE */}
      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full bg-white shadow rounded overflow-hidden">
          <thead>
            <tr className="bg-gray-200 text-gray-700 text-sm">
              <th className="p-3">Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Purchase</th>
              <th>Sale</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.length > 0 ? (
              products.map((p) => {
                const isLowStock = p.stock <= (p.lowStockAlert ?? 5);
                return (
                  <tr key={p._id} className="text-center border-t hover:bg-gray-50 text-sm">
                    {/* IMAGE */}
                    <td className="p-2">
                      {p.image ? (
                        <img
                          src={`${baseURL}${p.image}`}
                          className="mx-auto h-10 w-10 rounded border object-cover"
                          alt={p.name}
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No image</span>
                      )}
                    </td>

                    <td className="font-medium">{p.name}</td>
                    <td>{p.category || "—"}</td>

                    {/* STOCK WITH DYNAMIC STYLING ALERT */}
                    <td className="p-2">
                      <span className={isLowStock ? "font-bold text-red-600" : "text-gray-800"}>
                        {p.stock}
                      </span>
                      {isLowStock && (
                        <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-500">
                          Low Stock
                        </div>
                      )}
                    </td>

                    <td>${p.purchasePrice || 0}</td>
                    <td>${p.salePrice || 0}</td>

                    {/* ACTIONS */}
                    <td className="p-2">
                      {user?.role === "admin" ? (
                        <button
                          onClick={() => deleteProduct(p._id)}
                          className="rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
                        >
                          Delete
                        </button>
                      ) : (
                        <span className="text-xs italic text-gray-400">Restricted</span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-8 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </MainLayout>
  );
}

export default Products;