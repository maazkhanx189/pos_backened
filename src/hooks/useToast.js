import { createElement, useEffect, useState } from "react";

const toastStyles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
};

function ToastContainer({ toast }) {
  if (!toast) {
    return null;
  }

  return createElement(
    "div",
    {
      className: `fixed right-4 top-4 z-50 max-w-sm rounded border px-4 py-3 shadow-lg ${
        toastStyles[toast.type] || toastStyles.info
      }`,
    },
    toast.message
  );
}

export default function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) {
      return undefined;
    }

    const timer = setTimeout(() => setToast(null), 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  return {
    toast,
    showToast,
    ToastContainer,
  };
}
