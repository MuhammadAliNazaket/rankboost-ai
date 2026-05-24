import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 bg-slate-950 text-white border-r border-slate-800 px-5 py-6">
      <div className="mb-10">
        <h1 className="text-2xl font-black tracking-tight">
          RankBoost<span className="text-blue-500"> AI</span>
        </h1>
        <p className="mt-2 text-xs text-slate-400">
          SEO Intelligence Platform
        </p>
      </div>

      <nav className="flex flex-col gap-2">
        <NavLink active={location.pathname === "/dashboard"} to="/dashboard" label="Dashboard" />
        <NavLink active={location.pathname === "/analyze"} to="/analyze" label="On-Page SEO" />
        <NavLink active={location.pathname === "/technical-seo"} to="/technical-seo" label="Technical SEO" />
        <NavLink active={location.pathname === "/performance-seo"} to="/performance-seo" label="Performance SEO" />
        <NavLink active={location.pathname === "/keyword-seo"} to="/keyword-seo" label="Keyword SEO" />
        <NavLink active={location.pathname === "/competitor-traffic"} to="/competitor-traffic" label="Competitor Traffic" />
        <NavLink active={location.pathname === "/report"} to="/report" label="Reports" />

        <button
          onClick={logout}
          className="mt-8 rounded-2xl bg-red-500 px-5 py-3 text-left text-sm font-bold text-white hover:bg-red-600 transition"
        >
          Logout
        </button>
      </nav>
    </aside>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link
      to={to}
      className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
        active
          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

export default Sidebar;