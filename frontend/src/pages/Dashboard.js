import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-blue-300">
            Welcome Back
          </p>

          <h1 className="mt-3 text-5xl font-black">
            {user?.name}
          </h1>

          <p className="mt-4 max-w-2xl text-slate-300">
            Manage SEO analysis, technical audits,
            keyword intelligence, competitor traffic insights,
            and performance reports — all in one platform.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="SEO Reports"
            value="124"
            color="from-blue-600 to-blue-500"
          />

          <StatCard
            title="Websites Analyzed"
            value="87"
            color="from-violet-600 to-violet-500"
          />

          <StatCard
            title="Avg SEO Score"
            value="91%"
            color="from-emerald-600 to-emerald-500"
          />

          <StatCard
            title="Traffic Growth"
            value="+38%"
            color="from-orange-500 to-red-500"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-3xl font-black text-slate-900">
            SEO Tools
          </h2>

          <p className="mt-2 text-slate-500">
            Professional SEO intelligence modules for
            analysis, optimization, and competitor tracking.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <DashboardCard
              title="On-Page SEO"
              desc="Analyze titles, headings, meta descriptions, images, links, and content quality."
              link="/analyze"
            />

            <DashboardCard
              title="Technical SEO"
              desc="Check robots.txt, sitemap, schema markup, HTTPS, indexing, and security."
              link="/technical-seo"
            />

            <DashboardCard
              title="Performance SEO"
              desc="Analyze performance metrics, Core Web Vitals, speed optimization, and Lighthouse reports."
              link="/performance-seo"
            />

            <DashboardCard
              title="Keyword SEO"
              desc="Analyze keyword density, stuffing, keyword opportunities, and search potential."
              link="/keyword-seo"
            />

            <DashboardCard
              title="Competitor Traffic"
              desc="Compare competitor content strength, social presence, and estimated traffic."
              link="/competitor-traffic"
            />

            <DashboardCard
              title="Reports & PDFs"
              desc="View saved reports, analytics history, and download professional SEO PDF reports."
              link="/report"
            />
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${color} p-6 text-white shadow-xl`}
    >
      <p className="text-sm uppercase tracking-wider text-white/70">
        {title}
      </p>

      <h2 className="mt-4 text-4xl font-black">
        {value}
      </h2>
    </div>
  );
}

function DashboardCard({ title, desc, link }) {
  return (
    <div className="group rounded-3xl bg-white p-7 shadow-lg transition duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <h2 className="text-2xl font-black text-slate-900">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {desc}
      </p>

      <Link to={link}>
        <button className="mt-6 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600">
          Open Tool
        </button>
      </Link>
    </div>

    
  );
}

export default Dashboard;