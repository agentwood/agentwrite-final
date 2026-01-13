import { Metadata } from 'next';
import LoginForm from '@/app/components/auth/LoginForm';

// Server Component allowing metadata export
export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to Agentwood to continue your story.',
};

export default function LoginPage() {
  return <LoginForm />;
}
