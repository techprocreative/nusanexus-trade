import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout";
import { Dashboard, Trading, Strategies, Settings } from "./pages";
import StrategyBuilder from "./pages/StrategyBuilder";
import { WebSocketProvider } from "./components/providers/WebSocketProvider";
import ErrorBoundary, { WebSocketErrorBoundary } from './components/providers/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <WebSocketErrorBoundary>
        <WebSocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="trading" element={<Trading />} />
                <Route path="strategies" element={<Strategies />} />
                <Route path="strategies/builder" element={<StrategyBuilder />} />
                <Route path="ai-analysis" element={<div className="text-center text-xl text-white">AI Analysis - Coming Soon</div>} />
                <Route path="portfolio" element={<div className="text-center text-xl text-white">Portfolio - Coming Soon</div>} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </WebSocketProvider>
      </WebSocketErrorBoundary>
    </ErrorBoundary>
  );
}
