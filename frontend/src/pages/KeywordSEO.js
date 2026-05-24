import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function KeywordSEO() {
  const [url, setUrl] = useState("");
  const [mainKeyword, setMainKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await API.post("/keyword-seo/analyze", {
        url,
        mainKeyword,
        timezone,
      });

      setReport(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);

      alert(
        error.response?.data?.message ||
          "Keyword SEO analysis failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-violet-950 to-fuchsia-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-fuchsia-300">
            Keyword SEO Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Analyze Keyword Potential
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Discover keyword density, keyword stuffing,
            country-based keyword opportunities, and SEO optimization insights.
          </p>
        </section>

        <form
          onSubmit={handleAnalyze}
          className="mt-8 rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="url"
              placeholder="Enter website URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100"
            />

            <input
              type="text"
              placeholder="Enter main keyword"
              value={mainKeyword}
              onChange={(e) => setMainKeyword(e.target.value)}
              required
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-2xl bg-fuchsia-600 px-8 py-4 font-bold text-white transition hover:bg-fuchsia-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Keywords"}
          </button>
        </form>

        {report && (
          <section className="mt-8">
            <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl">
              <p className="text-sm uppercase tracking-widest text-fuchsia-300">
                Keyword Analysis
              </p>

              <h2 className="mt-3 text-4xl font-black">
                {report.mainKeyword}
              </h2>

              <p className="mt-4 text-slate-300">
                Country Target: {report.country}
              </p>

              <div className="mt-6 inline-flex rounded-2xl bg-white/10 px-5 py-3">
                <span className="font-semibold">
                  Keyword Stuffing:
                </span>

                <span
                  className={`ml-2 font-bold ${
                    report.keywordStuffing
                      ? "text-red-400"
                      : "text-emerald-400"
                  }`}
                >
                  {report.keywordStuffing
                    ? "Detected"
                    : "Not Detected"}
                </span>
              </div>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-3">
              <KeywordCard
                title="High Search Keywords"
                keywords={report.highKeywords}
                color="text-red-500"
              />

              <KeywordCard
                title="Medium Search Keywords"
                keywords={report.mediumKeywords}
                color="text-yellow-500"
              />

              <KeywordCard
                title="Low Search Keywords"
                keywords={report.lowKeywords}
                color="text-emerald-500"
              />
            </div>

            <div className="mt-8 rounded-3xl bg-white p-7 shadow-xl">
              <h2 className="text-3xl font-black text-slate-900">
                Top Keyword Density
              </h2>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {report.keywordDensity.map((item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-slate-100 p-5"
                  >
                    <p className="text-lg font-black text-slate-900">
                      {item.keyword}
                    </p>

                    <p className="mt-2 text-slate-600">
                      Count: {item.count}
                    </p>

                    <p className="font-semibold text-fuchsia-600">
                      Density: {item.density}%
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function KeywordCard({ title, keywords, color }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-xl">
      <h2 className="text-2xl font-black text-slate-900">
        {title}
      </h2>

      <div className="mt-5 space-y-4">
        {keywords.map((item, index) => (
          <div
            key={index}
            className="rounded-2xl bg-slate-100 p-4"
          >
            <p className="font-black text-slate-900">
              {item.keyword}
            </p>

            <p className={`mt-1 font-semibold ${color}`}>
              {item.searchLevel}
            </p>

            <p className="text-sm text-slate-500">
              {item.country}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default KeywordSEO;