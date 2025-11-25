
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

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Persona Pages from Menu */}
        <Route path="/students" element={<PersonaPage type="students" />} />
        <Route path="/creators" element={<PersonaPage type="creators" />} />
        
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/success" element={<StripeSuccessPage />} />
        
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/create" element={<AICreatePage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/project/:id" element={<EditorPage />} />
        
        {/* Brainstorming Flow */}
        <Route path="/brainstorm" element={<BrainstormSelection />} />
        <Route path="/brainstorm/:id" element={<BrainstormInput />} />
        <Route path="/results" element={<BrainstormResults />} />
      </Routes>
    </Router>
  );
};

export default App;
