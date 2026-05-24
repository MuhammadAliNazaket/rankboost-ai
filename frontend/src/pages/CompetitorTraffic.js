import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function CompetitorTraffic() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [competitorUrl, setCompetitorUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/competitor-traffic/analyze", {
        websiteUrl,
        competitorUrl,
      });

      setReport(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(
        error.response?.data?.message ||
          "Competitor traffic analysis failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-blue-300">
            Competitor Traffic Intelligence
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Compare Website Growth Signals
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Compare your website against competitors using traffic potential,
            keyword strength, content depth, social presence, links, and images.
          </p>
        </section>

        <form
          onSubmit={handleAnalyze}
          className="mt-8 rounded-3xl bg-white p-6 shadow-xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="url"
              placeholder="Your website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              required
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />

            <input
              type="url"
              placeholder="Competitor website URL"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              required
              className="rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-5 rounded-2xl bg-blue-600 px-8 py-4 font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Analyze Competitor"}
          </button>
        </form>

        {report && (
          <section className="mt-8">
            <div className="rounded-[32px] bg-slate-950 p-8 text-white shadow-2xl">
              <p className="text-sm uppercase tracking-widest text-blue-300">
                Competitive Result
              </p>

              <h2 className="mt-3 text-5xl font-black">
                Winner:{" "}
                <span className="text-blue-400">
                  {report.estimatedWinner}
                </span>
              </h2>

              <p className="mt-4 text-slate-300">
                Based on content depth, keyword signals, links, images, and social visibility.
              </p>
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <TrafficCard title="Your Website" data={report.website} />
              <TrafficCard title="Competitor" data={report.competitor} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function TrafficCard({ title, data }) {
  return (
    <div className="rounded-[32px] bg-white p-7 shadow-xl">
      <p className="text-sm uppercase tracking-widest text-slate-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-black text-slate-900">
        {data.estimatedMonthlyVisits || "Estimated"}
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <MiniStat label="Monthly Visits" value={data.estimatedMonthlyVisits || "N/A"} />
        <MiniStat label="Traffic Potential" value={data.trafficPotential || "N/A"} />
        <MiniStat label="Top Source" value={data.topTrafficSource || "Organic"} />
        <MiniStat label="Social Links" value={data.socialLinks?.length || 0} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric label="Words" value={data.wordCount} />
        <Metric label="Links" value={data.totalLinks} />
        <Metric label="Images" value={data.totalImages} />
      </div>

      <div className="mt-7">
        <h3 className="text-xl font-black text-slate-900">
          Top Keywords
        </h3>

        <div className="mt-4 space-y-3">
          {data.topKeywords.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3"
            >
              <span className="font-bold text-slate-800">
                {item.keyword}
              </span>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-bold text-blue-700">
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-black text-slate-900">{value}</p>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-950 p-4 text-white">
      <p className="text-xs text-slate-400">{label}</p>
      <h3 className="mt-2 text-2xl font-black">{value}</h3>
    </div>
  );
}

export default CompetitorTraffic;