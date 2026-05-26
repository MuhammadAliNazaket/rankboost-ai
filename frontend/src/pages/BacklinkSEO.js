import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function BacklinkSEO() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/backlink/analyze", {
        url,
      });

      setReport(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(
        error.response?.data?.message ||
          "Backlink analysis failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-emerald-950 to-teal-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-emerald-300">
            Backlink Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Analyze Link Authority
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Analyze internal links, external links, dofollow/nofollow ratio,
            anchor text, authority score, trust score, spam score, and backlink opportunities.
          </p>
        </section>

        <form
          onSubmit={handleAnalyze}
          className="mt-8 flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-xl md:flex-row"
        >
          <input
            type="url"
            placeholder="Enter website URL e.g. https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-emerald-600 px-8 py-4 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Backlinks"}
          </button>
        </form>

        {report && (
          <section className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <ScoreCard title="Authority Score" value={report.authorityScore} color="text-blue-600" />
              <ScoreCard title="Trust Score" value={report.trustScore} color="text-emerald-600" />
              <ScoreCard title="Spam Score" value={report.spamScore} color="text-red-500" />
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Metric title="Internal Links" value={report.internalLinks} />
              <Metric title="External Links" value={report.externalLinks} />
              <Metric title="Dofollow Links" value={report.dofollowLinks} />
              <Metric title="Nofollow Links" value={report.nofollowLinks} />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-3xl bg-white p-7 shadow-xl">
                <h2 className="text-2xl font-black text-slate-900">
                  Top Anchor Texts
                </h2>

                <div className="mt-5 space-y-3">
                  {report.topAnchors.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
                    >
                      <span className="font-bold text-slate-800">
                        {item.anchor || "Empty Anchor"}
                      </span>

                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">
                        {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-7 shadow-xl">
                <h2 className="text-2xl font-black text-slate-900">
                  Backlink Opportunities
                </h2>

                <div className="mt-5 space-y-4">
                  {report.backlinkOpportunities.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-2xl bg-slate-100 p-4"
                    >
                      <h3 className="font-black text-slate-900">
                        {item.type}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {item.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ScoreCard({ title, value, color }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-xl">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <h2 className={`mt-3 text-5xl font-black ${color}`}>
        {value}
        <span className="text-2xl text-slate-400">/100</span>
      </h2>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-black text-slate-950">
        {value}
      </h3>
    </div>
  );
}

export default BacklinkSEO;