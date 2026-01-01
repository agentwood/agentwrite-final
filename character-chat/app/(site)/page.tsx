import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to /home where the Agentwood design is implemented
  redirect('/home');
}
