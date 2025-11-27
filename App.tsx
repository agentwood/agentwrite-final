
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import BrainstormSelection from './pages/BrainstormSelection';
import BrainstormInput from './pages/BrainstormInput';
import BrainstormResults from './pages/BrainstormResults';
import StatsPage from './pages/StatsPage';
import PersonaPage from './pages/PersonaPage';
import PricingPage from './pages/PricingPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import StripeSuccessPage from './pages/StripeSuccessPage';
import AICreatePage from './pages/AICreatePage';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CancelPage from './pages/CancelPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<SignupPage />} /> {/* Added /login route */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <OnboardingPage />
          </ProtectedRoute>
        } />

        {/* Persona Pages from Menu */}
        <Route path="/students" element={<PersonaPage type="students" />} />
        <Route path="/creators" element={<PersonaPage type="creators" />} />

        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cancel" element={
          <ProtectedRoute>
            <CancelPage />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/stripe-success" element={
          <ProtectedRoute>
            <StripeSuccessPage />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />
        <Route path="/create" element={<AICreatePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/project/:projectId" element={
          <ProtectedRoute>
            <EditorPage />
          </ProtectedRoute>
        } />

        {/* Brainstorming Flow */}
        <Route path="/brainstorm" element={<BrainstormSelection />} />
        <Route path="/brainstorm/:id" element={<BrainstormInput />} />
        <Route path="/results" element={<BrainstormResults />} />
      </Routes >
    </Router >
  );
};

export default App;
