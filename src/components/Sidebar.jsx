import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Building2,
  Bot,
  UserPlus,
  LogOut,
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/");
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
      isActive
        ? "bg-blue-100 text-blue-600 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  return (
    <aside className="h-screen fixed w-64 bg-white border-r border-gray-200 p-4 hidden md:flex flex-col justify-between shadow-md">
      <div>
        <h2 className="text-2xl font-bold text-blue-600 mb-6 text-center tracking-wide">
          Troika Tech
        </h2>
        <nav className="space-y-2">
          <NavLink to="/dashboard/overview" className={navItemClass}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Overview
          </NavLink>

          <NavLink to="/dashboard/companies" className={navItemClass}>
            <Building2 className="mr-3 h-5 w-5" />
            Manage Companies
          </NavLink>

          <NavLink to="/dashboard/chatbots" className={navItemClass}>
            <Bot className="mr-3 h-5 w-5" />
            Manage Chatbots
          </NavLink>

          <NavLink to="/dashboard/add-admin" className={navItemClass}>
            <UserPlus className="mr-3 h-5 w-5" />
            Add Admin
          </NavLink>
        </nav>
      </div>

      <button
        onClick={logout}
        className="flex cursor-pointer items-center px-4 py-2 rounded-lg text-sm font-medium text-red-500 hover:text-white hover:bg-red-500 transition-all"
      >
        <LogOut className="mr-3 h-5 w-5" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
