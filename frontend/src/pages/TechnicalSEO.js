import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function TechnicalSEO() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await API.post("/technical-seo/analyze", {
        url,
      });

      setReport(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(error.response?.data?.message || "Technical SEO analysis failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />

      <main className="ml-72 p-8">
        <section className="rounded-[32px] bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950 p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-widest text-cyan-300">
            Technical SEO Analyzer
          </p>

          <h1 className="mt-3 text-5xl font-black">
            Audit Website Technical Health
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            Check robots.txt, sitemap.xml, canonical tags, HTTPS, schema markup,
            Open Graph tags, and security headers.
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
            className="flex-1 rounded-2xl border border-slate-200 px-5 py-4 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-cyan-600 px-8 py-4 font-bold text-white transition hover:bg-cyan-700 disabled:opacity-60"
          >
            {loading ? "Analyzing..." : "Run Technical Audit"}
          </button>
        </form>

        {report && (
          <section className="mt-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <StatusCard
                title="HTTPS"
                value={report.httpsEnabled ? "Enabled" : "Disabled"}
                good={report.httpsEnabled}
              />

              <StatusCard
                title="robots.txt"
                value={report.robotsTxtStatus}
                good={report.robotsTxtStatus === "Found"}
              />

              <StatusCard
                title="sitemap.xml"
                value={report.sitemapStatus}
                good={report.sitemapStatus === "Found"}
              />

              <StatusCard
                title="Canonical"
                value={report.canonicalUrl === "Not Found" ? "Missing" : "Found"}
                good={report.canonicalUrl !== "Not Found"}
              />
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-2">
              <InfoPanel title="Canonical URL">
                <p className="break-all text-slate-700">{report.canonicalUrl}</p>
              </InfoPanel>

              <InfoPanel title="Schema Markup">
                <p className="text-slate-700">
                  {report.schemaMarkup.length > 0
                    ? `${report.schemaMarkup.length} schema blocks found`
                    : "No schema markup found"}
                </p>
              </InfoPanel>

              <InfoPanel title="Open Graph Tags">
                {Object.entries(report.openGraph).map(([key, value]) => (
                  <Info key={key} label={key} value={value || "Missing"} />
                ))}
              </InfoPanel>

              <InfoPanel title="Security Headers">
                {Object.entries(report.securityHeaders).map(([key, value]) => (
                  <Info key={key} label={key} value={value || "Missing"} />
                ))}
              </InfoPanel>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function StatusCard({ title, value, good }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-lg">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <h3 className={`mt-3 text-2xl font-black ${good ? "text-emerald-600" : "text-red-500"}`}>
        {value}
      </h3>
    </div>
  );
}

function InfoPanel({ title, children }) {
  return (
    <div className="rounded-3xl bg-white p-7 shadow-xl">
      <h2 className="mb-5 text-2xl font-black text-slate-900">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-sm font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="break-all text-slate-800">{value}</p>
    </div>
  );
}

export default TechnicalSEO;