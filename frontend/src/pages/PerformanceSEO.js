import { useState } from "react";
import Sidebar from "../components/Sidebar";
import API from "../services/api";

function PerformanceSEO() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

    const response = await API.post("/lighthouse/analyze", {
    url,
    });

      setReport(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert(
        error.response?.data?.message ||
          "Performance SEO analysis failed."
      );
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      <Sidebar />

      <div style={{ marginLeft: "240px", padding: "40px" }}>
        <h1>Performance SEO Analyzer</h1>

        <p style={{ color: "#666" }}>
          Analyze page speed, Lighthouse score, accessibility, best practices, SEO score and Core Web Vitals.
        </p>

        <form
          onSubmit={handleAnalyze}
          style={{
            background: "#fff",
            padding: "25px",
            borderRadius: "16px",
            marginTop: "25px",
            boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
            display: "flex",
            gap: "10px",
          }}
        >
          <input
            type="url"
            placeholder="Enter website URL e.g. https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #ddd",
            }}
          />

          <button
            type="submit"
            style={{
              padding: "14px 25px",
              border: "none",
              borderRadius: "10px",
              background: "#2563eb",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {report && (
          <div style={{ marginTop: "30px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "20px",
              }}
            >
              <ScoreCard title="Performance" score={report.performanceScore} />
              <ScoreCard title="Accessibility" score={report.accessibilityScore} />
              <ScoreCard title="Best Practices" score={report.bestPracticesScore} />
              <ScoreCard title="SEO" score={report.seoScore} />
            </div>

            <div
              style={{
                background: "#fff",
                padding: "25px",
                borderRadius: "16px",
                marginTop: "25px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
              }}
            >
              <h2>Core Web Vitals</h2>

              <Metric title="First Contentful Paint" value={report.firstContentfulPaint} />
              <Metric title="Speed Index" value={report.speedIndex} />
              <Metric title="Largest Contentful Paint" value={report.largestContentfulPaint} />
              <Metric title="Total Blocking Time" value={report.totalBlockingTime} />
              <Metric title="Cumulative Layout Shift" value={report.cumulativeLayoutShift} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ title, score }) {
  return (
    <div
      style={{
        background: "#fff",
        padding: "25px",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ color: "#666" }}>{title}</p>
      <h1 style={{ color: "#2563eb" }}>{score}/100</h1>
    </div>
  );
}

function Metric({ title, value }) {
  return (
    <p>
      <strong>{title}:</strong> {value}
    </p>
  );
}

export default PerformanceSEO;