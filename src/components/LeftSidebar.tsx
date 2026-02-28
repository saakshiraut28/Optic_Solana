/** @format */

import { Home, Search, Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

const LeftSidebar = () => {
  return (
    <aside className="hidden md:flex w-64 flex-col justify-between border-r border-gray-200 p-6 bg-white">
      <div className="space-y-6">
        <h1 className="text-2xl font-black">Optic</h1>

        <nav className="space-y-4 text-gray-700">
          <a href="/">
            <SidebarItem icon={<Home size={20} />} label="Home" />
          </a>
          <Link to="/explore">
            <SidebarItem icon={<Search size={20} />} label="Explore" />
          </Link>
          <Link to="/notifications">
            <SidebarItem icon={<Bell size={20} />} label="Notifications" />
          </Link>
          <a href="/profile">
            <SidebarItem icon={<User size={20} />} label="Profile" />
          </a>
        </nav>
      </div>

      <div className="text-sm text-gray-500">
        <p>© 2026 Optic</p>
        <p>Powered by Tapestry.</p>
      </div>
    </aside>
  );
};

export default LeftSidebar;

/* --- Small Component --- */

const SidebarItem = ({ icon, label }: any) => (
  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 px-3 py-2 rounded-lg transition">
    {icon}
    <span>{label}</span>
  </div>
);
