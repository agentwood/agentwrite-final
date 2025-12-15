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
import BusinessPage from './pages/BusinessPage';
import VideoIdeasPage from './pages/VideoIdeasPage';
import ContentMarketingAIPage from './pages/ContentMarketingAIPage';
import VideoScriptGeneratorPage from './pages/VideoScriptGeneratorPage';
import VideoMarketingToolsPage from './pages/VideoMarketingToolsPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ArticlesPage from './pages/ArticlesPage';
import BlogAdminPage from './pages/BlogAdminPage';
import HelpPage from './pages/HelpPage';
import HelpArticlePage from './pages/HelpArticlePage';
import ChangelogPage from './pages/ChangelogPage';
import FAQPage from './pages/FAQPage';
import ResourcesPage from './pages/ResourcesPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import StripeSuccessPage from './pages/StripeSuccessPage';
import AICreatePage from './pages/AICreatePage';
import DiagnosticsPage from './pages/DiagnosticsPage';
import ProtectedRoute from './components/ProtectedRoute';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import CancelPage from './pages/CancelPage';
import ContactPage from './pages/ContactPage';
import CharacterNameGeneratorPage from './pages/CharacterNameGeneratorPage';
import StoryGeneratorPage from './pages/StoryGeneratorPage';
import TitleGeneratorPage from './pages/TitleGeneratorPage';
import PlotGeneratorPage from './pages/PlotGeneratorPage';

import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<SignupPage />} />
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
          <Route path="/business" element={<BusinessPage />} />
          <Route path="/video-ideas-generator" element={<VideoIdeasPage />} />
          <Route path="/content-marketing-ai" element={<ContentMarketingAIPage />} />
          <Route path="/video-script-generator" element={<VideoScriptGeneratorPage />} />
          <Route path="/video-marketing-tools" element={<VideoMarketingToolsPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/help/:slug" element={<HelpArticlePage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/tools/character-name-generator" element={<CharacterNameGeneratorPage />} />
          <Route path="/tools/story-generator" element={<StoryGeneratorPage />} />
          <Route path="/tools/title-generator" element={<TitleGeneratorPage />} />
          <Route path="/tools/plot-generator" element={<PlotGeneratorPage />} />
          <Route path="/blog-admin" element={
            <ProtectedRoute>
              <BlogAdminPage />
            </ProtectedRoute>
          } />
          <Route path="/changelog" element={<ChangelogPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/diagnostics" element={<DiagnosticsPage />} />
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
    </AuthProvider>
  );
};

export default App;
