import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function Analyze() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/seo/analyze", {
        url,
      });

      setReport(response.data);

      setLoading(false);
    } catch (error) {
      setLoading(false);

      alert(
        error.response?.data?.message ||
          "SEO analysis failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-blue-300">
            RankBoost AI
          </p>

          <h1 className="mt-4 text-5xl font-black">
            On-Page SEO Analyzer
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Analyze website titles, headings, metadata,
            images, content structure, internal links,
            and SEO optimization quality.
          </p>
        </section>

        <section className="mt-8 rounded-[32px] bg-white p-8 shadow-xl">
          <form
            onSubmit={handleAnalyze}
            className="flex flex-col gap-5 lg:flex-row"
          >
            <input
              type="url"
              placeholder="Enter website URL..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 px-6 py-5 text-lg outline-none transition focus:border-blue-500"
            />

            <button
              type="submit"
              className="rounded-2xl bg-blue-600 px-8 py-5 font-bold text-white transition hover:bg-blue-700"
            >
              {loading ? "Analyzing..." : "Analyze SEO"}
            </button>
          </form>
        </section>

        {report && (
          <>
            <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="SEO Score"
                value={`${report.seoScore}/100`}
                color="from-blue-600 to-blue-500"
              />

              <StatCard
                title="Word Count"
                value={report.wordCount}
                color="from-violet-600 to-violet-500"
              />

              <StatCard
                title="Total Images"
                value={report.totalImages}
                color="from-emerald-600 to-emerald-500"
              />

              <StatCard
                title="Total Links"
                value={report.totalLinks}
                color="from-orange-500 to-red-500"
              />
            </section>

            <section className="mt-8 grid gap-6 xl:grid-cols-2">
              <InfoCard
                title="Meta Title"
                value={report.title}
              />

              <InfoCard
                title="Meta Description"
                value={report.metaDescription}
              />

              <InfoCard
                title="H1 Headings"
                value={
                  report.headings?.h1?.join(", ") ||
                  "No H1 headings"
                }
              />

              <InfoCard
                title="H2 Headings"
                value={
                  report.headings?.h2?.join(", ") ||
                  "No H2 headings"
                }
              />
            </section>

            <section className="mt-8 rounded-[32px] bg-white p-8 shadow-xl">
              <h2 className="text-3xl font-black text-slate-900">
                SEO Suggestions
              </h2>

              <div className="mt-6 grid gap-4">
                {report.suggestions?.map(
                  (item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <p className="font-medium text-slate-700">
                        {item}
                      </p>
                    </div>
                  )
                )}
              </div>
            </section>
          </>
        )}
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

function InfoCard({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-lg">
      <h2 className="text-xl font-black text-slate-900">
        {title}
      </h2>

      <p className="mt-4 leading-7 text-slate-600">
        {value || "Not Available"}
      </p>
    </div>
  );
}

export default Analyze;