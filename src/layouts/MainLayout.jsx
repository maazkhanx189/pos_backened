import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 8, y: 8 });
  const dragRef = useRef(null);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const onPointerDown = (e) => {
      dragging.current = true;
      dragStart.current = { x: e.clientX, y: e.clientY };
      el.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e) => {
      if (!dragging.current) return;
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setPos((p) => {
        const next = { x: p.x + dx, y: p.y + dy };
        const maxX = window.innerWidth - 240; // approx aside width
        const maxY = window.innerHeight - 40;
        if (next.x < 8) next.x = 8;
        if (next.y < 8) next.y = 8;
        if (next.x > maxX) next.x = maxX;
        if (next.y > maxY) next.y = maxY;
        return next;
      });
    };

    const onPointerUp = (e) => {
      dragging.current = false;
      el.releasePointerCapture?.(e.pointerId);
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  const navLinkStyles = ({ isActive }) => {
    const baseClasses = "flex items-center px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-150 ease-in-out";
    const activeClasses = "bg-gray-800 text-white underline decoration-2 underline-offset-4 border-l-4 border-blue-500 rounded-l-none pl-3";
    const inactiveClasses = "text-gray-300 hover:text-white hover:bg-gray-800/50";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile toggle button */}
      {isMobile && (
        <button
          onClick={() => setOpen((v) => !v)}
          className="fixed z-50 flex items-center justify-center h-10 w-10 rounded-full bg-gray-900 text-white shadow-lg"
          style={{ left: pos.x, top: pos.y }}
        >
          ☰
        </button>
      )}

      {/* Sidebar / Navbar */}
      {isMobile ? (
        open && (
          <aside
            ref={dragRef}
            className="bg-gray-900 p-4 text-white shadow-xl rounded-md"
            style={{ position: "fixed", top: pos.y + 44, left: pos.x, width: 240, zIndex: 60 }}
          >
            <div className="flex flex-col gap-4 md:h-full md:justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h1 className="text-2xl font-bold tracking-wide text-gray-100">Wholesale POS</h1>
                  <button onClick={() => setOpen(false)} className="text-gray-300">✕</button>
                </div>

                <nav className="mt-5">
                  <ul className="space-y-1.5">
                    <li>
                      <NavLink to="/dashboard" className={navLinkStyles} onClick={() => setOpen(false)}>
                        Dashboard
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/products" className={navLinkStyles} onClick={() => setOpen(false)}>
                        Products
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/customers" className={navLinkStyles} onClick={() => setOpen(false)}>
                        Customers
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/pos" className={navLinkStyles} onClick={() => setOpen(false)}>
                        POS Terminal
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/sales" className={navLinkStyles} onClick={() => setOpen(false)}>
                        Sales Logs
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/reports" className={navLinkStyles} onClick={() => setOpen(false)}>
                        Reports Engine
                      </NavLink>
                    </li>
                  </ul>
                </nav>

                {user?.name && (
                  <div className="mt-6 rounded-lg border border-gray-800/60 bg-gray-800/40 p-3 text-xs text-gray-300 md:mx-2">
                    Logged in as:
                    <span className="mt-1 block text-sm font-bold text-gray-100">{user.name}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="mt-6 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow transition-colors duration-150 hover:bg-red-700 active:bg-red-800"
              >
                Sign Out Account
              </button>
            </div>
          </aside>
        )
      ) : (
        <aside className="w-full bg-gray-900 p-4 text-white shadow-xl md:w-64 md:p-5">
          <div className="flex flex-col gap-4 md:h-full md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-wide text-gray-100">
              Wholesale POS
            </h1>

            <nav className="mt-5">
              <ul className="space-y-1.5">
                <li>
                  <NavLink to="/dashboard" className={navLinkStyles}>
                    Dashboard
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products" className={navLinkStyles}>
                    Products
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/customers" className={navLinkStyles}>
                    Customers
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/pos" className={navLinkStyles}>
                    POS Terminal
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/sales" className={navLinkStyles}>
                    Sales Logs
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports" className={navLinkStyles}>
                    Reports Engine
                  </NavLink>
                </li>
              </ul>
            </nav>

            {user?.name && (
              <div className="mt-6 rounded-lg border border-gray-800/60 bg-gray-800/40 p-3 text-xs text-gray-300 md:mx-2">
                Logged in as:
                <span className="mt-1 block text-sm font-bold text-gray-100">
                  {user.name}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 w-full rounded-md bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow transition-colors duration-150 hover:bg-red-700 active:bg-red-800"
          >
            Sign Out Account
          </button>
        </div>
      </aside>

      )}

      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-5 md:p-6">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;