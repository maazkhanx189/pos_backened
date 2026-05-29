import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import MainLayout from "../layouts/MainLayout";
import useToast from "../hooks/useToast";

function EditSale() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { toast, showToast, ToastContainer } =
    useToast();

  const [sale, setSale] = useState(null);

  // FETCH SALE
  const fetchSale = async () => {
    const { data } = await API.get(
      `/sales/${id}`
    );

    setSale(data);
  };

  useEffect(() => {
    fetchSale();
  }, []);

  // UPDATE QUANTITY
  const updateQuantity = (
    index,
    quantity
  ) => {

    const updatedItems = [
      ...sale.items,
    ];

    updatedItems[index].quantity =
      quantity;

    setSale({
      ...sale,
      items: updatedItems,
    });
  };

  // UPDATE PRICE
  const updatePrice = (
    index,
    price
  ) => {

    const updatedItems = [
      ...sale.items,
    ];

    updatedItems[index].price =
      price;

    setSale({
      ...sale,
      items: updatedItems,
    });
  };

  // REMOVE PRODUCT
  const removeItem = (index) => {

    const updatedItems =
      sale.items.filter(
        (_, i) => i !== index
      );

    setSale({
      ...sale,
      items: updatedItems,
    });
  };

  // TOTAL
  const totalAmount =
    sale?.items.reduce(
      (acc, item) =>
        acc +
        item.price *
          item.quantity,
      0
    );

  // SAVE
  const updateSale = async () => {

    try {

      await API.put(
        `/sales/${id}`,
        {
          ...sale,
          totalAmount,
        }
      );

      showToast(
        "Invoice Updated",
        "success"
      );

      setTimeout(() => {
        navigate("/sales");
      }, 500);

    } catch (error) {

      showToast(
        error.response?.data?.message ||
          "Failed to update invoice",
        "error"
      );
    }
  };

  if (!sale) {
    return <p>Loading...</p>;
  }

  return (
    <MainLayout>

      <ToastContainer toast={toast} />

      <div className="bg-white p-5 shadow max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-5">

          <h1 className="text-3xl font-bold">
            Edit Invoice
          </h1>

          <p>
            Invoice ID:
            {sale._id.slice(-6)}
          </p>

        </div>

        {/* ITEMS */}
        <div className="space-y-3">

          {sale.items.map(
            (item, index) => (

              <div
                key={index}
                className="grid grid-cols-5 gap-3 items-center border-b pb-2"
              >

                {/* NAME */}
                <input
                  value={item.name}
                  disabled
                  className="border p-2 bg-gray-100"
                />

                {/* QUANTITY */}
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateQuantity(
                      index,
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="border p-2"
                />

                {/* PRICE */}
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updatePrice(
                      index,
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="border p-2"
                />

                {/* TOTAL */}
                <div className="font-bold">

                  Rs{" "}
                  {item.price *
                    item.quantity}

                </div>

                {/* REMOVE */}
                <button
                  onClick={() =>
                    removeItem(index)
                  }
                  className="bg-red-500 text-white px-3 py-2"
                >
                  Remove
                </button>

              </div>
            )
          )}

        </div>

        {/* PAYMENT */}
        <div className="mt-6">

          <h2 className="font-bold mb-2">
            Payment
          </h2>

          <input
            type="number"
            value={sale.paidAmount}
            onChange={(e) =>
              setSale({
                ...sale,
                paidAmount:
                  Number(
                    e.target.value
                  ),
              })
            }
            className="border p-2 w-full"
          />

        </div>

        {/* TOTALS */}
        <div className="mt-6 space-y-2 text-lg">

          <p>
            Total:
            <span className="font-bold ml-2">
              Rs {totalAmount}
            </span>
          </p>

          <p>
            Remaining:
            <span className="font-bold ml-2 text-red-500">

              Rs{" "}
              {totalAmount -
                sale.paidAmount}

            </span>
          </p>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 mt-6">

          <button
            onClick={updateSale}
            className="bg-green-600 text-white px-5 py-2"
          >
            Save Invoice
          </button>

          <button
            onClick={() =>
              window.print()
            }
            className="bg-black text-white px-5 py-2"
          >
            Print
          </button>

        </div>

      </div>

    </MainLayout>
  );
}

export default EditSale;
