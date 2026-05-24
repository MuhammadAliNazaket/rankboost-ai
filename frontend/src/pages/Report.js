import { useEffect, useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function Report() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await API.get("/seo/reports");
      setReports(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  const chartData = {
    labels: reports.slice(0, 5).map((report) => report.url),
    datasets: [
      {
        label: "SEO Score",
        data: reports.slice(0, 5).map((report) => report.seo_score),
        backgroundColor: "#2563eb",
        borderRadius: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#334155",
          font: {
            weight: "bold",
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#64748b",
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          color: "#64748b",
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-blue-300">
            SEO Reports
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Saved Analysis Reports
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Track saved SEO reports, compare website performance history,
            and download professional PDF audits.
          </p>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-7 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-black text-slate-900">
                Recent SEO Score Analytics
              </h2>

              <p className="mt-2 text-slate-500">
                Latest website SEO score trend.
              </p>
            </div>

            <div className="rounded-2xl bg-blue-100 px-5 py-3 text-sm font-bold text-blue-700">
              {reports.length} Reports
            </div>
          </div>

          <Bar data={chartData} options={chartOptions} />
        </section>

        <section className="mt-8">
          <h2 className="text-3xl font-black text-slate-900">
            Report History
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-[28px] bg-white p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <p className="break-all text-sm font-bold text-blue-600">
                  {report.url}
                </p>

                <h2 className="mt-4 text-5xl font-black text-slate-950">
                  {report.seo_score}
                  <span className="text-2xl text-slate-400">/100</span>
                </h2>

                <div className="mt-5 space-y-3 text-sm text-slate-600">
                  <Info label="Title" value={report.title || "Missing"} />
                  <Info label="Images" value={report.total_images} />
                  <Info label="Links" value={report.total_links} />
                  <Info label="Word Count" value={report.word_count} />
                </div>

                <p className="mt-5 text-xs font-semibold text-slate-400">
                  {new Date(report.created_at).toLocaleString()}
                </p>

                <a
                  href={`http://localhost:5000/api/pdf/seo-report/${report.id}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <button className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600">
                    Download PDF Report
                  </button>
                </a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <p>
      <span className="font-bold text-slate-900">{label}:</span>{" "}
      {value}
    </p>
  );
}

export default Report;