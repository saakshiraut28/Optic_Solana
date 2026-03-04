/** @format */

import { Home, Search, Bell, User, Bolt } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Search, label: "Explore", to: "/explore" },
  { icon: Bell, label: "Notifications", to: "/notifications" },
  { icon: User, label: "Profile", to: "/profile" },
  { icon: Bolt, label: "Settings", to: "/settings" },
];

const LeftSidebar = () => {
  const location = useLocation();

  return (
    <>
      {/* ── DESKTOP / TABLET SIDEBAR ── */}
      {/* Tablet (md): icon-only narrow bar. Desktop (lg): full labels. */}
      <aside
        className="hidden md:flex flex-col justify-between border-r border-gray-200 bg-white
                        w-16 lg:w-64 p-3 lg:p-6 flex-shrink-0"
      >
        <div className="space-y-4 lg:space-y-6">
          {/* Logo — full on desktop, initial on tablet */}
          <h1 className="text-2xl font-black hidden lg:block">Optic</h1>
          <h1 className="text-2xl font-black lg:hidden text-center">O</h1>

          <nav className="space-y-1 text-gray-700">
            {navItems.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to;
              return (
                <Link to={to} key={label}>
                  {/* Desktop: icon + label */}
                  <div
                    className={`hidden lg:flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg transition
                      ${active ? "bg-gray-100 font-semibold text-black" : "hover:bg-gray-100"}`}
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </div>

                  {/* Tablet: icon only, centered */}
                  <div
                    className={`lg:hidden flex items-center justify-center cursor-pointer p-3 rounded-lg transition
                      ${active ? "bg-gray-100 text-black" : "text-gray-500 hover:bg-gray-100 hover:text-black"}`}
                    title={label}
                  >
                    <Icon size={22} />
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer — desktop only */}
        <div className="text-sm text-gray-500 hidden lg:block">
          <p>© 2026 Optic</p>
          <p>Powered by Tapestry.</p>
        </div>
      </aside>

      {/* ── MOBILE BOTTOM NAV BAR ── */}
      {/* Visible only below md breakpoint */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200
                      flex items-center justify-around px-2 pb-safe"
      >
        {navItems.map(({ icon: Icon, label, to }) => {
          const active = location.pathname === to;
          return (
            <Link
              to={to}
              key={label}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 transition
                ${active ? "text-black" : "text-gray-400 hover:text-black"}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default LeftSidebar;
