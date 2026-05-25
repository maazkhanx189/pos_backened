// import { Link, useNavigate } from "react-router-dom";

// function MainLayout({ children }) {
//   const navigate = useNavigate();

//   const user =
//     JSON.parse(localStorage.getItem("user")) || {};

//   const handleLogout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     navigate("/");
//   };

//   return (
//     <div className="flex min-h-screen ">

//       {/* SIDEBAR */}
//       <div className="w-64 bg-gray-900 text-white p-5 gap-5 flex flex-col justify-between">
//         <div >
//           <h1 className="text-2xl font-bold mb-10">
//             Wholesale POS
//           </h1>

//           <ul className="space-y-4">
//             <li><Link to="/dashboard">Dashboard</Link></li>
//             <li><Link to="/products">Products</Link></li>
//             <li><Link to="/customers">Customers</Link></li>
//             <li><Link to="/pos">POS</Link></li>
//             <li><Link to="/sales">Sales</Link></li>
//             <li><Link to="/reports">Reports</Link></li>
//           </ul>

//           {/* USER INFO (SAFE) */}
//           {user?.name && (
//             <div className="mt-10 text-sm text-gray-300">
//               Logged in as: <b>{user.name}</b>
//             </div>
//           )}

//         </div>
//         <div>
//           {/* LOGOUT */}
//           <button
//             onClick={handleLogout}
//             className="bg-red-500 px-4 py-2 rounded mt-5 w-full"
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       {/* MAIN CONTENT */}
//       <div className="flex-1 p-6 bg-gray-100">
//         {children}
//       </div>

//     </div>
//   );
// }

// export default MainLayout;










import { NavLink, useNavigate } from "react-router-dom";

function MainLayout({ children }) {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user")) || {};

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const navLinkStyles = ({ isActive }) => {
    const baseClasses = "flex items-center px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-150 ease-in-out";
    const activeClasses = "bg-gray-800 text-white underline decoration-2 underline-offset-4 border-l-4 border-blue-500 rounded-l-none pl-3";
    const inactiveClasses = "text-gray-300 hover:text-white hover:bg-gray-800/50";

    return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
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

      <main className="flex-1 overflow-y-auto bg-gray-100 p-4 sm:p-5 md:p-6">
        {children}
      </main>
    </div>
  );
}

export default MainLayout;