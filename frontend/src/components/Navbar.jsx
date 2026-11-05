import { CheckSquare, Bell, Settings } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const location = useLocation();

  const links = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Search", to: "/search" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-[#4563ED] font-bold text-lg"
        >
          <div className="bg-[#4563ED] text-white p-1.5 rounded-lg">
            <CheckSquare size={18} />
          </div>
          <span>Todo</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-4">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition ${
                  location.pathname === link.to
                    ? "text-[#4563ED]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-500 hover:text-[#4563ED] rounded-lg hover:bg-gray-50">
              <Bell size={18} />
            </button>
            <button className="p-2 text-gray-500 hover:text-[#4563ED] rounded-lg hover:bg-gray-50">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
