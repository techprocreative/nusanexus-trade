import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout";
import { 
  Dashboard, 
  Trading, 
  Strategies, 
  Settings, 
  StrategyLibrary,
  StrategyBuilder,
  AIMarketAnalysis,
  StrategyAnalysis,
  InteractiveTools,
  UserFeedbackCenter,
  EducationalHub,
  ImplementationAssistant,
  OnboardingFlow
} from "./pages";
import { WebSocketProvider } from "./components/providers/WebSocketProvider";
import ErrorBoundary, { WebSocketErrorBoundary } from './components/providers/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <WebSocketErrorBoundary>
        <WebSocketProvider>
          <Router>
            <Routes>
              {/* Onboarding Flow - Outside Layout */}
              <Route path="/onboarding" element={<OnboardingFlow />} />
              
              <Route path="/" element={<Layout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="trading" element={<Trading />} />
                <Route path="strategies" element={<Strategies />} />
                <Route path="strategies/builder" element={<StrategyBuilder />} />
                <Route path="strategies/library" element={<StrategyLibrary />} />
                <Route path="strategies/analysis/:id" element={<StrategyAnalysis />} />
                <Route path="ai-analysis" element={<AIMarketAnalysis />} />
                <Route path="interactive-tools" element={<InteractiveTools />} />
                <Route path="feedback" element={<UserFeedbackCenter />} />
                <Route path="education" element={<EducationalHub />} />
                <Route path="implementation" element={<ImplementationAssistant />} />
                <Route path="portfolio" element={<div className="text-center text-xl text-white">Portfolio - Coming Soon</div>} />
                <Route path="settings/*" element={<Settings />} />
              </Route>
            </Routes>
          </Router>
        </WebSocketProvider>
      </WebSocketErrorBoundary>
    </ErrorBoundary>
  );
}
