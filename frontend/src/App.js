import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import Report from "./pages/Report";
import ProtectedRoute from "./components/ProtectedRoute";
import TechnicalSEO from "./pages/TechnicalSEO";
import PerformanceSEO from "./pages/PerformanceSEO";
import KeywordSEO from "./pages/KeywordSEO";
import CompetitorTraffic from "./pages/CompetitorTraffic";
import BacklinkSEO from "./pages/BacklinkSEO";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
          
        />

        <Route
          path="/analyze"
          element={
            <ProtectedRoute>
              <Analyze />
            </ProtectedRoute>
          }
        />

        <Route
          path="/report"
          element={
            <ProtectedRoute>
              <Report />
            </ProtectedRoute>
          }
        />

        <Route
          path="/technical-seo"
          element={
            <ProtectedRoute>
              <TechnicalSEO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/performance-seo"
          element={
            <ProtectedRoute>
              <PerformanceSEO />
            </ProtectedRoute>
          }
        />
        <Route
          path="/keyword-seo"
          element={
            <ProtectedRoute>
              <KeywordSEO />
            </ProtectedRoute>
          }
        />
          <Route
        path="/competitor-traffic"
        element={
          <ProtectedRoute>
            <CompetitorTraffic />
          </ProtectedRoute>
        }
      />
      <Route
      path="/backlink-seo"
      element={
        <ProtectedRoute>
          <BacklinkSEO />
        </ProtectedRoute>
      }
    />


      </Routes>
    </BrowserRouter>
  );
}

export default App;