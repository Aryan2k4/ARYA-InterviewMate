import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { SignupPage } from "./components/auth/SignupPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { InterviewSetupPage } from "./components/interview/InterviewSetupPage";
import { InterviewSessionPage } from "./components/interview/InterviewSessionPage";
import { InterviewReportPage } from "./components/interview/InterviewReportPage";
import { HistoryPage } from "./components/interview/HistoryPage";
import { AnalyticsPage } from "./components/analytics/AnalyticsPage";
import { LeaderboardPage } from "./components/leaderboard/LeaderboardPage";
import { CoachPage } from "./components/coach/CoachPage";
import { AdminPage } from "./components/admin/AdminPage";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Protected */}
          <Route path="/dashboard" element={
            <ProtectedRoute><DashboardPage /></ProtectedRoute>
          } />
          <Route path="/interview/setup" element={
            <ProtectedRoute><InterviewSetupPage /></ProtectedRoute>
          } />
          <Route path="/interview/:id" element={
            <ProtectedRoute><InterviewSessionPage /></ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute><HistoryPage /></ProtectedRoute>
          } />
          <Route path="/history/:id" element={
            <ProtectedRoute><InterviewReportPage /></ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute><AnalyticsPage /></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><LeaderboardPage /></ProtectedRoute>
          } />
          <Route path="/coach" element={
            <ProtectedRoute><CoachPage /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><AdminPage /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
